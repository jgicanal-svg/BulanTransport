<?php

namespace Database\Factories;

use App\Models\Bus;
use App\Models\Driver;
use App\Models\Trip;
use App\Models\VehicleLocation;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleLocationFactory extends Factory
{
    protected $model = VehicleLocation::class;

    public function definition(): array
    {
        $recordedAt = $this->faker->dateTimeBetween("-3 days", "now");

        return [
            "trip_id" => Trip::factory(),
            "bus_id" => Bus::factory(),
            "driver_id" => Driver::factory(),
            // Roughly along the Bulan <-> Sorsogon City corridor for demo purposes only.
            "latitude" => $this->faker->latitude(12.65, 12.98),
            "longitude" => $this->faker->longitude(123.85, 124.05),
            "accuracy" => $this->faker->randomFloat(2, 3, 25),
            "speed" => $this->faker->randomFloat(2, 0, 60),
            "heading" => $this->faker->randomFloat(2, 0, 359),
            "altitude" => $this->faker->randomFloat(2, 5, 60),
            "recorded_at" => $recordedAt,
            "received_at" => (clone $recordedAt)->modify("+2 seconds"),
        ];
    }
}
