<?php

use App\Models\User;

it("blocks a DRIVER from accessing admin routes", function () {
    $driver = User::factory()->create(["role" => "DRIVER"]);

    $this->actingAs($driver)->get("/admin/dashboard")->assertForbidden();
});

it("blocks a guest from accessing admin routes", function () {
    $this->get("/admin/dashboard")->assertRedirect("/login");
});

it("blocks an ADMIN from accessing driver-only tracking routes", function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get("/driver/tracking")->assertForbidden();
});

it("allows an ADMIN to access the admin dashboard", function () {
    $admin = User::factory()->admin()->create();

    $this->actingAs($admin)->get("/admin/dashboard")->assertOk();
});

it("allows anyone, including guests, to view the public commuter page", function () {
    $this->get("/")->assertOk();
});
