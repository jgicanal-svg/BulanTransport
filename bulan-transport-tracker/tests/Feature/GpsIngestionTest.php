<?php

use App\Models\Bus;
use App\Models\BusAssignment;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Trip;
use App\Models\VehicleLocation;

function makeActiveDriverWithTrip(): Driver
{
    $driver = Driver::factory()->create();
    $bus = Bus::factory()->create();
    $route = Route::factory()->create();

    $assignment = BusAssignment::factory()->create([
        "driver_id" => $driver->id,
        "bus_id" => $bus->id,
        "route_id" => $route->id,
        "is_active" => true,
    ]);

    Trip::factory()->active()->create(["bus_assignment_id" => $assignment->id]);

    return $driver->fresh();
}

it("rejects GPS submission from an unauthenticated request", function () {
    $this->post("/driver/tracking/location", [
        "latitude" => 12.67,
        "longitude" => 123.87,
        "recorded_at" => now()->toIso8601String(),
    ])->assertRedirect("/login");
});

it("rejects GPS submission from a driver with no active trip", function () {
    $driver = Driver::factory()->create();

    $this->actingAs($driver->user)->post("/driver/tracking/location", [
        "latitude" => 12.67,
        "longitude" => 123.87,
        "recorded_at" => now()->toIso8601String(),
    ])->assertSessionHasErrors("trip");
});

it("accepts a valid GPS point from a driver with an active trip", function () {
    $driver = makeActiveDriverWithTrip();

    $this->actingAs($driver->user)->post("/driver/tracking/location", [
        "latitude" => 12.6706,
        "longitude" => 123.8747,
        "accuracy" => 8.5,
        "speed" => 30,
        "heading" => 90,
        "recorded_at" => now()->toIso8601String(),
    ])->assertSessionDoesntHaveErrors();

    expect(VehicleLocation::count())->toBe(1);
});

it("rejects latitude outside the valid range", function () {
    $driver = makeActiveDriverWithTrip();

    $this->actingAs($driver->user)->post("/driver/tracking/location", [
        "latitude" => 200,
        "longitude" => 123.87,
        "recorded_at" => now()->toIso8601String(),
    ])->assertSessionHasErrors("latitude");
});

it("rejects longitude outside the valid range", function () {
    $driver = makeActiveDriverWithTrip();

    $this->actingAs($driver->user)->post("/driver/tracking/location", [
        "latitude" => 12.67,
        "longitude" => 500,
        "recorded_at" => now()->toIso8601String(),
    ])->assertSessionHasErrors("longitude");
});

it("ignores a client-supplied driver_id/bus_id/trip_id and resolves identity server-side", function () {
    $driver = makeActiveDriverWithTrip();
    $otherDriver = Driver::factory()->create();

    $this->actingAs($driver->user)->post("/driver/tracking/location", [
        "latitude" => 12.6706,
        "longitude" => 123.8747,
        "recorded_at" => now()->toIso8601String(),
        "driver_id" => $otherDriver->id,
        "bus_id" => 99999,
        "trip_id" => 99999,
    ]);

    $point = VehicleLocation::first();
    expect($point->driver_id)->toBe($driver->id);
    expect($point->driver_id)->not->toBe($otherDriver->id);
});

it("rejects a point that is far too old (staleness tolerance)", function () {
    $driver = makeActiveDriverWithTrip();

    $this->actingAs($driver->user)->post("/driver/tracking/location", [
        "latitude" => 12.67,
        "longitude" => 123.87,
        "recorded_at" => now()->subHours(2)->toIso8601String(),
    ])->assertSessionHasErrors("recorded_at");
});

it("does not accept GPS points for a completed trip", function () {
    $driver = makeActiveDriverWithTrip();
    $trip = $driver->activeAssignment()->activeTrip();
    $trip->update(["status" => "COMPLETED", "ended_at" => now()]);

    $this->actingAs($driver->user)->post("/driver/tracking/location", [
        "latitude" => 12.67,
        "longitude" => 123.87,
        "recorded_at" => now()->toIso8601String(),
    ])->assertSessionHasErrors("trip");
});
