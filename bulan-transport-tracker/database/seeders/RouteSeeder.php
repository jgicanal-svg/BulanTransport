<?php

namespace Database\Seeders;

use App\Models\Route;
use Illuminate\Database\Seeder;

class RouteSeeder extends Seeder
{
    public function run(): void
    {
        /*
         * Main highway route:
         * Bulan Terminal to Sorsogon City Terminal.
         *
         * The frontend routing service calculates the road-following
         * geometry between these two endpoints.
         */
        $primary = Route::updateOrCreate(
            ['code' => 'BUL-SOR'],
            [
                'name' => 'Bulan - Sorsogon City',
                'origin' => 'Bulan Terminal, Sorsogon',
                'destination' => 'Sorsogon City Terminal, Sorsogon',
                'distance_km' => 62.0,
                'description' => 'Primary Bulan Transport Cooperative highway route.',
                'geometry' => null,
                'is_active' => true,
            ],
        );

        // Remove outdated and inaccurate demonstration stops.
        $primary->stops()->delete();

        $primary->stops()->createMany([
            [
                'name' => 'Bulan Terminal',
                'latitude' => 12.6706,
                'longitude' => 123.8747,
                'stop_order' => 1,
            ],
            [
                'name' => 'Sorsogon City Terminal',
                'latitude' => 12.9743,
                'longitude' => 124.0058,
                'stop_order' => 2,
            ],
        ]);

        /*
         * Separate local Bulan–Irosin route.
         * This route does not affect the BUL-SOR highway route.
         */
        $secondary = Route::updateOrCreate(
            ['code' => 'BUL-IROS'],
            [
                'name' => 'Bulan - Irosin (Local)',
                'origin' => 'Bulan Terminal, Sorsogon',
                'destination' => 'Irosin Public Market, Sorsogon',
                'distance_km' => 18.5,
                'description' => 'Secondary local route between Bulan and Irosin.',
                'geometry' => null,
                'is_active' => true,
            ],
        );

        // Remove any previously stored inaccurate stops.
        $secondary->stops()->delete();

        $secondary->stops()->createMany([
            [
                'name' => 'Bulan Terminal',
                'latitude' => 12.6706,
                'longitude' => 123.8747,
                'stop_order' => 1,
            ],
            [
                'name' => 'Irosin Public Market',
                'latitude' => 12.7025,
                'longitude' => 124.0321,
                'stop_order' => 2,
            ],
        ]);
    }
}