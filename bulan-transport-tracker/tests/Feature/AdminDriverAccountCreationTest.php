<?php

use App\Models\User;

/**
 * Replaces the old public-registration security tests. Per
 * USER_ROLES_AND_PERMISSIONS.md, there is no public self-registration at
 * all - driver accounts are created only by an authenticated ADMIN.
 */
beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it("guests cannot reach the removed public registration route", function () {
    $this->get("/register")->assertStatus(404);
});

it("only an authenticated admin can create a driver account", function () {
    $driver = User::factory()->create(["role" => "DRIVER"]);

    $this->actingAs($driver)->post("/admin/drivers", [
        "first_name" => "Juan", "last_name" => "Dela Cruz", "email" => "juan@example.test",
        "contact_number" => "09171112222", "password" => "Str0ng!Pass", "password_confirmation" => "Str0ng!Pass",
        "status" => "ACTIVE",
    ])->assertForbidden();
});

it("admin-created driver accounts are always DRIVER role, never ADMIN", function () {
    $this->actingAs($this->admin)->post("/admin/drivers", [
        "first_name" => "Juan", "last_name" => "Dela Cruz", "email" => "juan2@example.test",
        "contact_number" => "09171113333", "password" => "Str0ng!Pass", "password_confirmation" => "Str0ng!Pass",
        "status" => "ACTIVE",
    ]);

    $user = User::where("email", "juan2@example.test")->first();
    expect($user->role->value)->toBe("DRIVER");
});

it("rejects a weak password when admin creates a driver", function () {
    $response = $this->actingAs($this->admin)->post("/admin/drivers", [
        "first_name" => "Juan", "last_name" => "Dela Cruz", "email" => "juan3@example.test",
        "contact_number" => "09171114444", "password" => "password", "password_confirmation" => "password",
        "status" => "ACTIVE",
    ]);

    $response->assertSessionHasErrors("password");
});

it("rejects an invalid PH contact number when admin creates a driver", function () {
    $response = $this->actingAs($this->admin)->post("/admin/drivers", [
        "first_name" => "Juan", "last_name" => "Dela Cruz", "email" => "juan4@example.test",
        "contact_number" => "12345", "password" => "Str0ng!Pass", "password_confirmation" => "Str0ng!Pass",
        "status" => "ACTIVE",
    ]);

    $response->assertSessionHasErrors("contact_number");
});
