<?php

namespace Database\Factories;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class DriverFactory extends Factory
{
    protected $model = Driver::class;

    public function definition(): array
    {
        return [
            "user_id" => User::factory()->state(["role" => "DRIVER"]),
            "employee_code" => "DRV-".$this->faker->unique()->numberBetween(1000, 9999),
            "license_number" => strtoupper($this->faker->bothify("N##-##-######")),
            "license_expiry" => $this->faker->dateTimeBetween("+3 months", "+3 years"),
            "status" => "ACTIVE",
        ];
    }
}
