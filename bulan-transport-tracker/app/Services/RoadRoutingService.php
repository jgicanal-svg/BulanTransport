<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use RuntimeException;
use Throwable;

class RoadRoutingService
{
    private string $baseUrl = 'https://router.project-osrm.org';

    /**
     * Calculate the actual drivable road route.
     *
     * The service returns geometry in the SAME format already expected
     * by the existing MapPanel:
     *
     * [
     *     [latitude, longitude],
     *     [latitude, longitude],
     *     ...
     * ]
     */
    public function calculate(
        float $originLatitude,
        float $originLongitude,
        float $destinationLatitude,
        float $destinationLongitude,
        array $waypoints = []
    ): array {
        $coordinates = [];

        /*
        |--------------------------------------------------------------------------
        | Origin
        |--------------------------------------------------------------------------
        |
        | OSRM expects:
        |
        | longitude,latitude
        |
        */

        $coordinates[] =
            "{$originLongitude},{$originLatitude}";

        /*
        |--------------------------------------------------------------------------
        | Optional Stops / Waypoints
        |--------------------------------------------------------------------------
        */

        foreach ($waypoints as $waypoint) {
            if (
                ! isset(
                    $waypoint['latitude'],
                    $waypoint['longitude']
                )
            ) {
                continue;
            }

            $latitude =
                (float) $waypoint['latitude'];

            $longitude =
                (float) $waypoint['longitude'];

            $coordinates[] =
                "{$longitude},{$latitude}";
        }

        /*
        |--------------------------------------------------------------------------
        | Destination
        |--------------------------------------------------------------------------
        */

        $coordinates[] =
            "{$destinationLongitude},{$destinationLatitude}";

        $coordinateString =
            implode(';', $coordinates);

        $url =
            "{$this->baseUrl}/route/v1/driving/{$coordinateString}";

        /*
        |--------------------------------------------------------------------------
        | Request Actual Road Route
        |--------------------------------------------------------------------------
        */

        try {
            $response = Http::timeout(20)
                ->retry(2, 500)
                ->get(
                    $url,
                    [
                        'overview' => 'full',
                        'geometries' => 'geojson',
                        'steps' => 'false',
                        'alternatives' => 'false',
                    ]
                );

            if (! $response->successful()) {
                return $this->fallbackRoute(
                    $originLatitude,
                    $originLongitude,
                    $destinationLatitude,
                    $destinationLongitude,
                    $waypoints
                );
            }

            $data = $response->json();

            if (
                ($data['code'] ?? null) !== 'Ok' ||
                empty($data['routes'])
            ) {
                return $this->fallbackRoute(
                    $originLatitude,
                    $originLongitude,
                    $destinationLatitude,
                    $destinationLongitude,
                    $waypoints
                );
            }
        } catch (Throwable $exception) {
            // Route management must still save when the external routing
            // service is temporarily unavailable. The fallback preserves the
            // same [lat, lng] geometry format used by the existing map.
            return $this->fallbackRoute(
                $originLatitude,
                $originLongitude,
                $destinationLatitude,
                $destinationLongitude,
                $waypoints
            );
        }

        $roadRoute =
            $data['routes'][0];

        /*
        |--------------------------------------------------------------------------
        | Convert GeoJSON → Existing MapPanel Format
        |--------------------------------------------------------------------------
        |
        | OSRM gives:
        |
        | [
        |     [longitude, latitude],
        |     ...
        | ]
        |
        | Your existing MapPanel expects:
        |
        | [
        |     [latitude, longitude],
        |     ...
        | ]
        |
        */

        $osrmCoordinates =
            $roadRoute['geometry']['coordinates'] ?? [];

        $leafletGeometry =
            collect($osrmCoordinates)
                ->map(
                    function ($coordinate) {
                        return [
                            (float) $coordinate[1],
                            (float) $coordinate[0],
                        ];
                    }
                )
                ->values()
                ->all();

        if (count($leafletGeometry) < 2) {
            return $this->fallbackRoute(
                $originLatitude,
                $originLongitude,
                $destinationLatitude,
                $destinationLongitude,
                $waypoints
            );
        }

        /*
        |--------------------------------------------------------------------------
        | Result
        |--------------------------------------------------------------------------
        */

        return [
            /*
             * OSRM distance is meters.
             * Store kilometers.
             */
            'distance_km' => round(
                ($roadRoute['distance'] ?? 0) / 1000,
                2
            ),

            /*
             * OSRM duration is seconds.
             */
            'duration_seconds' => round(
                $roadRoute['duration'] ?? 0
            ),

            /*
             * IMPORTANT:
             *
             * Preserve your ORIGINAL application's geometry format.
             */
            'geometry' =>
                $leafletGeometry,

            'waypoints' =>
                $data['waypoints'] ?? [],

            'routing_source' => 'OSRM',
        ];
    }

    private function fallbackRoute(
        float $originLatitude,
        float $originLongitude,
        float $destinationLatitude,
        float $destinationLongitude,
        array $waypoints = []
    ): array {
        $geometry = [
            [$originLatitude, $originLongitude],
        ];

        foreach ($waypoints as $waypoint) {
            if (isset($waypoint['latitude'], $waypoint['longitude'])) {
                $geometry[] = [
                    (float) $waypoint['latitude'],
                    (float) $waypoint['longitude'],
                ];
            }
        }

        $geometry[] = [
            $destinationLatitude,
            $destinationLongitude,
        ];

        $distance = 0.0;

        for ($index = 1; $index < count($geometry); $index++) {
            $distance += $this->haversineKm(
                $geometry[$index - 1][0],
                $geometry[$index - 1][1],
                $geometry[$index][0],
                $geometry[$index][1],
            );
        }

        return [
            'distance_km' => round($distance, 2),
            'duration_seconds' => null,
            'geometry' => $geometry,
            'waypoints' => [],
            'routing_source' => 'FALLBACK',
        ];
    }

    private function haversineKm(
        float $latitude1,
        float $longitude1,
        float $latitude2,
        float $longitude2
    ): float {
        $earthRadiusKm = 6371;

        $lat1 = deg2rad($latitude1);
        $lat2 = deg2rad($latitude2);
        $deltaLat = deg2rad($latitude2 - $latitude1);
        $deltaLon = deg2rad($longitude2 - $longitude1);

        $a = sin($deltaLat / 2) ** 2
            + cos($lat1) * cos($lat2) * sin($deltaLon / 2) ** 2;

        return $earthRadiusKm * 2 * atan2(sqrt($a), sqrt(1 - $a));
    }
}