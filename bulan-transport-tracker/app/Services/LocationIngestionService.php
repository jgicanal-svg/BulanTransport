<?php

namespace App\Services;

use App\Events\BusCheckpointReached;
use App\Events\VehicleLocationUpdated;
use App\Models\Driver;
use App\Models\LatestVehicleLocation;
use App\Models\TripCheckpointEvent;
use App\Models\VehicleLocation;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class LocationIngestionService
{
    /*
    |--------------------------------------------------------------------------
    | Municipality Checkpoints
    |--------------------------------------------------------------------------
    |
    | These are approximate municipality-center checkpoints for the demo.
    | Radius is intentionally generous because phone GPS and town boundaries
    | are not exact points.
    |
    | You can replace these later with exact terminal/checkpoint coordinates.
    |
    */

    private const CHECKPOINTS = [
        [
            'name' => 'Bulan',
            'latitude' => 12.6714,
            'longitude' => 123.8754,
            'radius_km' => 2.0,
        ],
        [
            'name' => 'Irosin',
            'latitude' => 12.7000,
            'longitude' => 124.0330,
            'radius_km' => 2.0,
        ],
        [
            'name' => 'Juban',
            'latitude' => 12.8470,
            'longitude' => 123.9870,
            'radius_km' => 2.0,
        ],
        [
            'name' => 'Casiguran',
            'latitude' => 12.8730,
            'longitude' => 124.0090,
            'radius_km' => 2.0,
        ],
        [
            'name' => 'Sorsogon City',
            'latitude' => 12.9740,
            'longitude' => 124.0050,
            'radius_km' => 2.0,
        ],
    ];

    public function ingest(
        Driver $driver,
        array $payload
    ): VehicleLocation {
        $assignment =
            $driver->activeAssignment();

        if (! $assignment) {
            throw ValidationException::withMessages([
                'trip' =>
                    'You do not have an active bus/route assignment.',
            ]);
        }

        $assignment->loadMissing([
            'bus',
            'route',
            'driver.user',
        ]);

        $trip =
            $assignment->activeTrip();

        if (
            ! $trip ||
            $trip->status->value !== 'ACTIVE'
        ) {
            throw ValidationException::withMessages([
                'trip' =>
                    'You do not have an active trip. Start a trip before sending location updates.',
            ]);
        }

        $recordedAt =
            Carbon::parse(
                $payload['recorded_at']
            );

        $maxAge =
            config(
                'tracking.max_point_age_seconds'
            );

        if (
            $recordedAt->lt(
                now()->subSeconds($maxAge)
            )
        ) {
            throw ValidationException::withMessages([
                'recorded_at' =>
                    'This location point is too old to accept.',
            ]);
        }

        if (
            $recordedAt->gt(
                now()->addMinute()
            )
        ) {
            throw ValidationException::withMessages([
                'recorded_at' =>
                    'This location point has an implausible future timestamp.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Preserve your existing GPS ingestion
        |--------------------------------------------------------------------------
        */

        $location =
            DB::transaction(
                function () use (
                    $driver,
                    $assignment,
                    $trip,
                    $payload,
                    $recordedAt
                ) {
                    $receivedAt =
                        now();

                    $location =
                        VehicleLocation::create([
                            'trip_id' =>
                                $trip->id,

                            'bus_id' =>
                                $assignment->bus_id,

                            'driver_id' =>
                                $driver->id,

                            'latitude' =>
                                $payload['latitude'],

                            'longitude' =>
                                $payload['longitude'],

                            'accuracy' =>
                                $payload['accuracy']
                                ?? null,

                            'speed' =>
                                $payload['speed']
                                ?? null,

                            'heading' =>
                                $payload['heading']
                                ?? null,

                            'altitude' =>
                                $payload['altitude']
                                ?? null,

                            'recorded_at' =>
                                $recordedAt,

                            'received_at' =>
                                $receivedAt,
                        ]);

                    LatestVehicleLocation::updateOrCreate(
                        [
                            'bus_id' =>
                                $assignment->bus_id,
                        ],
                        [
                            'trip_id' =>
                                $trip->id,

                            'driver_id' =>
                                $driver->id,

                            'latitude' =>
                                $payload['latitude'],

                            'longitude' =>
                                $payload['longitude'],

                            'accuracy' =>
                                $payload['accuracy']
                                ?? null,

                            'speed' =>
                                $payload['speed']
                                ?? null,

                            'heading' =>
                                $payload['heading']
                                ?? null,

                            'recorded_at' =>
                                $recordedAt,

                            'received_at' =>
                                $receivedAt,

                            'updated_at' =>
                                $receivedAt,
                        ]
                    );

                    $trip->update([
                        'last_location_at' =>
                            $receivedAt,
                    ]);

                    broadcast(
                        new VehicleLocationUpdated(
                            busId:
                                $assignment->bus_id,

                            tripId:
                                $trip->id,

                            latitude:
                                (float) $payload['latitude'],

                            longitude:
                                (float) $payload['longitude'],

                            recordedAt:
                                $recordedAt
                                    ->toIso8601String(),
                        )
                    )->toOthers();

                    return $location;
                }
            );

        /*
        |--------------------------------------------------------------------------
        | Check Municipality Geofences
        |--------------------------------------------------------------------------
        |
        | This happens after the normal GPS point has been stored.
        |
        */

        $this->checkCheckpoints(
            driver: $driver,
            assignment: $assignment,
            tripId: $trip->id,
            latitude: (float) $payload['latitude'],
            longitude: (float) $payload['longitude'],
            recordedAt: $recordedAt,
        );

        return $location;
    }

    private function checkCheckpoints(
        Driver $driver,
        $assignment,
        int $tripId,
        float $latitude,
        float $longitude,
        Carbon $recordedAt
    ): void {
        foreach (
            self::CHECKPOINTS
            as $checkpoint
        ) {
            $distanceKm =
                $this->distanceKm(
                    $latitude,
                    $longitude,
                    $checkpoint['latitude'],
                    $checkpoint['longitude']
                );

            /*
            |--------------------------------------------------------------------------
            | Outside checkpoint radius
            |--------------------------------------------------------------------------
            */

            if (
                $distanceKm >
                $checkpoint['radius_km']
            ) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Already reported during this trip?
            |--------------------------------------------------------------------------
            */

            $alreadyReached =
                TripCheckpointEvent::where(
                    'trip_id',
                    $tripId
                )
                    ->where(
                        'checkpoint_name',
                        $checkpoint['name']
                    )
                    ->exists();

            if ($alreadyReached) {
                continue;
            }

            /*
            |--------------------------------------------------------------------------
            | Save checkpoint event
            |--------------------------------------------------------------------------
            */

            TripCheckpointEvent::create([
                'trip_id' =>
                    $tripId,

                'bus_id' =>
                    $assignment->bus_id,

                'checkpoint_name' =>
                    $checkpoint['name'],

                'latitude' =>
                    $latitude,

                'longitude' =>
                    $longitude,

                'entered_at' =>
                    $recordedAt,
            ]);

            /*
            |--------------------------------------------------------------------------
            | Driver Name
            |--------------------------------------------------------------------------
            */

            $driverName =
                $driver->user?->full_name
                ?? trim(
                    ($driver->user?->first_name ?? '')
                    . ' '
                    . ($driver->user?->last_name ?? '')
                );

            /*
            |--------------------------------------------------------------------------
            | Reverb Notification
            |--------------------------------------------------------------------------
            */

            broadcast(
                new BusCheckpointReached(
                    busId:
                        $assignment->bus_id,

                    tripId:
                        $tripId,

                    busNumber:
                        $assignment->bus?->bus_number
                        ?? 'Bus',

                    driverName:
                        $driverName
                        ?: 'Unknown Driver',

                    checkpoint:
                        $checkpoint['name'],

                    latitude:
                        $latitude,

                    longitude:
                        $longitude,

                    distanceKm:
                        round(
                            $distanceKm,
                            2
                        ),

                    recordedAt:
                        $recordedAt
                            ->toIso8601String(),
                )
            )->toOthers();
        }
    }

    /*
    |--------------------------------------------------------------------------
    | Haversine only for geofence proximity
    |--------------------------------------------------------------------------
    |
    | IMPORTANT:
    |
    | This is NOT your route distance.
    |
    | Road distance remains handled by OSRM.
    | Haversine here is correct because we only need:
    |
    | "How far is the bus from this checkpoint?"
    |
    */

    private function distanceKm(
        float $latitude1,
        float $longitude1,
        float $latitude2,
        float $longitude2
    ): float {
        $earthRadius =
            6371;

        $latDelta =
            deg2rad(
                $latitude2 -
                $latitude1
            );

        $lngDelta =
            deg2rad(
                $longitude2 -
                $longitude1
            );

        $a =
            sin(
                $latDelta / 2
            ) ** 2
            +
            cos(
                deg2rad($latitude1)
            )
            *
            cos(
                deg2rad($latitude2)
            )
            *
            sin(
                $lngDelta / 2
            ) ** 2;

        $c =
            2 *
            atan2(
                sqrt($a),
                sqrt(1 - $a)
            );

        return
            $earthRadius * $c;
    }
}