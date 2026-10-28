<?php

use App\Models\Bus;
use App\Models\BusAssignment;
use App\Models\Driver;
use App\Models\LatestVehicleLocation;
use App\Models\Route;
use App\Models\Trip;

it("allows a guest to view the public live buses page", function () {
    $this->get("/live-buses")->assertOk();
});

it("returns latest bus locations without requiring authentication", function () {
    $driver = Driver::factory()->create();
    $bus = Bus::factory()->create();
    $route = Route::factory()->create();
    $assignment = BusAssignment::factory()->create(["driver_id" => $driver->id, "bus_id" => $bus->id, "route_id" => $route->id]);
    $trip = Trip::factory()->active()->create(["bus_assignment_id" => $assignment->id]);

    LatestVehicleLocation::create([
        "bus_id" => $bus->id,
        "trip_id" => $trip->id,
        "driver_id" => $driver->id,
        "latitude" => 12.67,
        "longitude" => 123.87,
        "recorded_at" => now(),
        "received_at" => now(),
        "updated_at" => now(),
    ]);

    $response = $this->getJson("/api/commuter/latest-locations");

    $response->assertOk();
    $response->assertJsonFragment(["bus_number" => $bus->bus_number]);
});

it("never exposes driver email or contact number in the public locations payload", function () {
    $driver = Driver::factory()->create();
    $bus = Bus::factory()->create();
    $route = Route::factory()->create();
    $assignment = BusAssignment::factory()->create(["driver_id" => $driver->id, "bus_id" => $bus->id, "route_id" => $route->id]);
    $trip = Trip::factory()->active()->create(["bus_assignment_id" => $assignment->id]);

    LatestVehicleLocation::create([
        "bus_id" => $bus->id, "trip_id" => $trip->id, "driver_id" => $driver->id,
        "latitude" => 12.67, "longitude" => 123.87, "recorded_at" => now(), "received_at" => now(), "updated_at" => now(),
    ]);

    $response = $this->getJson("/api/commuter/latest-locations");
    $body = $response->json();

    expect(json_encode($body))->not->toContain($driver->user->email);
    expect(json_encode($body))->not->toContain($driver->user->contact_number);
});
