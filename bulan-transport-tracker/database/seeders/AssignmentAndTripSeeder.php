<?php

namespace Database\Seeders;

use App\Models\Bus;
use App\Models\BusAssignment;
use App\Models\Driver;
use App\Models\LatestVehicleLocation;
use App\Models\Route;
use App\Models\Trip;
use App\Models\VehicleLocation;
use Illuminate\Database\Seeder;

class AssignmentAndTripSeeder extends Seeder
{
    public function run(): void
    {
        $route = Route::where("code", "BUL-SOR")->first();
        $drivers = Driver::whereHas("user")->where("status", "ACTIVE")->limit(10)->get();
        $buses = Bus::where("status", "ACTIVE")->limit(10)->get();

        foreach ($drivers as $index => $driver) {
            $bus = $buses[$index] ?? null;
            if (! $bus) {
                continue;
            }

            $assignment = BusAssignment::create([
                "driver_id" => $driver->id,
                "bus_id" => $bus->id,
                "route_id" => $route->id,
                "assigned_at" => now()->subDays(rand(1, 20)),
                "is_active" => true,
            ]);

            // Give the demo driver (first one) a live ACTIVE trip with fresh points.
            if ($index === 0) {
                $trip = Trip::factory()->active()->create(["bus_assignment_id" => $assignment->id]);

                $lastPoint = null;
                for ($i = 10; $i >= 0; $i--) {
                    $lastPoint = VehicleLocation::create([
                        "trip_id" => $trip->id,
                        "bus_id" => $bus->id,
                        "driver_id" => $driver->id,
                        "latitude" => 12.6706,
                        "longitude" => 123.8747,
                        "accuracy" => rand(5, 15),
                        "speed" => rand(20, 45),
                        "heading" => rand(0, 359),
                        "recorded_at" => now()->subSeconds($i * 30),
                        "received_at" => now()->subSeconds(($i * 30) - 2),
                    ]);
                }

                LatestVehicleLocation::updateOrCreate(
                    ["bus_id" => $bus->id],
                    [
                        "trip_id" => $trip->id,
                        "driver_id" => $driver->id,
                        "latitude" => $lastPoint->latitude,
                        "longitude" => $lastPoint->longitude,
                        "accuracy" => $lastPoint->accuracy,
                        "speed" => $lastPoint->speed,
                        "heading" => $lastPoint->heading,
                        "recorded_at" => $lastPoint->recorded_at,
                        "received_at" => $lastPoint->received_at,
                        "updated_at" => now(),
                    ]
                );

                $trip->update(["last_location_at" => $lastPoint->received_at]);
            } else {
                // Completed historical trips for the other demo drivers/buses.
                Trip::factory()->count(rand(2, 4))->create(["bus_assignment_id" => $assignment->id]);
            }
        }
    }
}
