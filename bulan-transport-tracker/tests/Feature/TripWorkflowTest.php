<?php

use App\Models\Bus;
use App\Models\BusAssignment;
use App\Models\Driver;
use App\Models\Route;

it("does not allow a driver to start a trip without an assignment", function () {
    $driver = Driver::factory()->create();

    $this->actingAs($driver->user)->post("/driver/tracking/start")
        ->assertSessionHasErrors("assignment");
});

it("allows a driver with an active assignment to start a trip", function () {
    $driver = Driver::factory()->create();
    $assignment = BusAssignment::factory()->create(["driver_id" => $driver->id, "is_active" => true]);

    $this->actingAs($driver->user)->post("/driver/tracking/start")
        ->assertSessionDoesntHaveErrors();

    expect($assignment->activeTrip())->not->toBeNull();
});

it("allows a driver to stop an active trip", function () {
    $driver = Driver::factory()->create();
    $assignment = BusAssignment::factory()->create(["driver_id" => $driver->id, "is_active" => true]);
    $this->actingAs($driver->user)->post("/driver/tracking/start");

    $this->actingAs($driver->user)->post("/driver/tracking/stop")
        ->assertSessionDoesntHaveErrors();

    expect($assignment->fresh()->activeTrip())->toBeNull();
});

it("prevents overlapping active assignments for the same driver", function () {
    $admin = \App\Models\User::factory()->admin()->create();
    $driver = Driver::factory()->create();
    BusAssignment::factory()->create(["driver_id" => $driver->id, "is_active" => true]);

    $bus = Bus::factory()->create();
    $route = Route::factory()->create();

    $this->actingAs($admin)->post("/admin/assignments", [
        "driver_id" => $driver->id,
        "bus_id" => $bus->id,
        "route_id" => $route->id,
    ])->assertSessionHasErrors("driver_id");
});
