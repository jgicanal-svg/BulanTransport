<?php

namespace Database\Seeders;

use App\Models\Bus;
use Illuminate\Database\Seeder;

class BusSeeder extends Seeder
{
    public function run(): void
    {
        Bus::factory()->count(20)->create();

        // A few explicitly archived/maintenance buses so the Archived view has demo content.
        Bus::factory()->count(3)->create(["status" => "MAINTENANCE"]);
        Bus::factory()->count(2)->create()->each->delete();
    }
}
