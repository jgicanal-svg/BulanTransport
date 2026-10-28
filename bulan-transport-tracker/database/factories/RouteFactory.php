<?php

namespace Database\Factories;

use App\Models\Route;
use Illuminate\Database\Eloquent\Factories\Factory;

class RouteFactory extends Factory
{
    protected $model = Route::class;

    public function definition(): array
    {
        $origin = $this->faker->randomElement([
            'Bulan',
            'Matnog',
            'Irosin',
            'Bulusan',
            'Magallanes',
            'Barcelona',
        ]);

        $destination = $this->faker->randomElement([
            'Sorsogon City',
            'Gubat',
            'Juban',
            'Casiguran',
            'Donsol',
            'Pilar',
        ]);

        return [
            'name' => "{$origin} - {$destination}",
            'code' => strtoupper(
                $this->faker->unique()->bothify('RT-???-###')
            ),
            'origin' => "{$origin} Terminal, Sorsogon",
            'destination' => "{$destination} Terminal, Sorsogon",
            'distance_km' => $this->faker->randomFloat(2, 10, 100),
            'description' => 'Demonstration route generated for testing.',
            'geometry' => null,
            'is_active' => true,
        ];
    }
}