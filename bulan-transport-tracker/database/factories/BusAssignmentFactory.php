<?php

namespace Database\Factories;

use App\Models\Bus;
use App\Models\BusAssignment;
use App\Models\Driver;
use App\Models\Route;
use Illuminate\Database\Eloquent\Factories\Factory;

class BusAssignmentFactory extends Factory
{
    protected $model = BusAssignment::class;

    public function definition(): array
    {
        return [
            "driver_id" => Driver::factory(),
            "bus_id" => Bus::factory(),
            "route_id" => Route::factory(),
            "assigned_at" => $this->faker->dateTimeBetween("-1 month", "now"),
            "ended_at" => null,
            "is_active" => true,
        ];
    }
}
