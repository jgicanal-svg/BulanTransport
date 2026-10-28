<?php

use App\Models\User;

it("allows a user to login with correct credentials", function () {
    $user = User::factory()->create(["password" => bcrypt("password123!")]);

    $response = $this->post("/login", [
        "email" => $user->email,
        "password" => "password123!",
    ]);

    $response->assertRedirect(route("driver.assignment.show", absolute: false));
    $this->assertAuthenticatedAs($user);
});

it("rejects login with incorrect credentials", function () {
    $user = User::factory()->create();

    $response = $this->post("/login", [
        "email" => $user->email,
        "password" => "wrong-password",
    ]);

    $response->assertSessionHasErrors();
    $this->assertGuest();
});

it("logs a user out", function () {
    $user = User::factory()->create();

    $this->actingAs($user)->post("/logout")->assertRedirect(route("login", absolute: false));
    $this->assertGuest();
});
