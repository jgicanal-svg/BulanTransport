<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DriverSeeder extends Seeder
{
    public function run(): void
    {
        // One well-known demo driver login for the capstone demo.
        $demoUser = User::updateOrCreate(
            ["email" => "driver@bulantransport.test"],
            [
                "first_name" => "Jose",
                "middle_name" => "Mendoza",
                "last_name" => "Bautista",
                "contact_number" => "09181234567",
                "password" => Hash::make("Driver@12345"),
                "role" => "DRIVER",
                "is_active" => true,
                "email_verified_at" => now(),
            ]
        );

        Driver::updateOrCreate(
            ["user_id" => $demoUser->id],
            ["employee_code" => "DRV-0001", "license_number" => "N01-23-456789", "license_expiry" => now()->addYears(2), "status" => "ACTIVE"]
        );

        Driver::factory()->count(19)->create();
        Driver::factory()->count(2)->create()->each->delete();
    }
}
