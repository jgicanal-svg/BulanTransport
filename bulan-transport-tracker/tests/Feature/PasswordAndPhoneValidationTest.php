<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it("password validation requires minimum 8 characters, a letter, a number, and a symbol", function () {
    $cases = [
        "short1!" => false,
        "alllettersnodigits!" => false,
        "12345678!" => false,
        "NoSymbolHere1" => false,
        "Valid1Pass!" => true,
    ];

    foreach ($cases as $password => $shouldPass) {
        $email = "pwtest-".uniqid()."@example.test";
        $response = $this->actingAs($this->admin)->post("/admin/drivers", [
            "first_name" => "Test", "last_name" => "User",
            "email" => $email,
            "contact_number" => "0917".rand(1000000, 9999999),
            "password" => $password, "password_confirmation" => $password,
            "status" => "ACTIVE",
        ]);

        if ($shouldPass) {
            $response->assertSessionHasNoErrors();
            $this->assertDatabaseHas("users", ["email" => $email, "role" => "DRIVER"]);
        } else {
            $response->assertSessionHasErrors("password");
            $this->assertDatabaseMissing("users", ["email" => $email]);
        }
    }
});

it("PH contact number must be exactly 11 digits starting with 09", function () {
    $invalidNumbers = ["123", "08171234567", "0917123456", "091712345678", "abcdefghijk"];

    foreach ($invalidNumbers as $number) {
        $response = test()->actingAs($this->admin)->post("/admin/drivers", [
            "first_name" => "Test", "last_name" => "User",
            "email" => "phtest-".uniqid()."@example.test",
            "contact_number" => $number,
            "password" => "Valid1Pass!", "password_confirmation" => "Valid1Pass!",
            "status" => "ACTIVE",
        ]);

        $response->assertSessionHasErrors("contact_number");
    }
});
