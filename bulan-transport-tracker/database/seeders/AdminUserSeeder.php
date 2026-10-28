<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        User::updateOrCreate(
            ["email" => "admin@bulantransport.test"],
            [
                "first_name" => "Maria",
                "middle_name" => "Santos",
                "last_name" => "Reyes",
                "contact_number" => "09171234567",
                "password" => Hash::make("Admin@12345"),
                "role" => "ADMIN",
                "is_active" => true,
                "email_verified_at" => now(),
            ]
        );
    }
}
