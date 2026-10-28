<?php

namespace Database\Factories;

use App\Models\BusAssignment;
use App\Models\Trip;
use Illuminate\Database\Eloquent\Factories\Factory;

class TripFactory extends Factory
{
    protected $model = Trip::class;

    public function definition(): array
    {
        $started = $this->faker->dateTimeBetween("-3 days", "-1 hour");
        $ended = (clone $started)->modify("+".$this->faker->numberBetween(30, 90)." minutes");

        return [
            "bus_assignment_id" => BusAssignment::factory(),
            "started_at" => $started,
            "ended_at" => $ended,
            "status" => "COMPLETED",
            "start_latitude" => $this->faker->latitude(12.65, 12.98),
            "start_longitude" => $this->faker->longitude(123.85, 124.05),
            "end_latitude" => $this->faker->latitude(12.65, 12.98),
            "end_longitude" => $this->faker->longitude(123.85, 124.05),
            "last_location_at" => $ended,
        ];
    }

    public function active(): static
    {
        return $this->state(fn () => [
            "status" => "ACTIVE",
            "ended_at" => null,
            "end_latitude" => null,
            "end_longitude" => null,
            "last_location_at" => now(),
        ]);
    }
}
