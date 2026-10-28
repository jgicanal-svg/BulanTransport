<?php

namespace Database\Factories;

use App\Models\Bus;
use Illuminate\Database\Eloquent\Factories\Factory;

class BusFactory extends Factory
{
    protected $model = Bus::class;

    public function definition(): array
    {
        return [
            "bus_number" => "BTC-".$this->faker->unique()->numberBetween(100, 999),
            "plate_number" => strtoupper($this->faker->bothify("???-####")),
            "device_code" => "BTR-".$this->faker->unique()->numberBetween(1000, 9999),
            "model" => $this->faker->randomElement(["Isuzu NQR Mini-Bus", "Foton Aumark Mini-Bus", "Hyundai County", "Mitsubishi Fuso Rosa"]),
            "capacity" => $this->faker->randomElement([16, 18, 22, 27]),
            "status" => "ACTIVE",
        ];
    }
}
