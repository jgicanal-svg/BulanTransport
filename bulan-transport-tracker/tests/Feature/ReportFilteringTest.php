<?php

use App\Models\Bus;
use App\Models\User;
use App\Models\VehicleLocation;

it("filters vehicle location history by bus", function () {
    $admin = User::factory()->admin()->create();
    $busA = Bus::factory()->create();
    $busB = Bus::factory()->create();

    VehicleLocation::factory()->create(["bus_id" => $busA->id]);
    VehicleLocation::factory()->create(["bus_id" => $busB->id]);

    $response = $this->actingAs($admin)->getJson("/admin/reports/vehicle-location-history?bus_id={$busA->id}");

    $response->assertOk();
    $data = $response->json("rows.data");
    expect(collect($data)->every(fn ($row) => $row["bus_id"] === $busA->id))->toBeTrue();
});

it("blocks a non-admin from accessing reports", function () {
    $driver = User::factory()->create(["role" => "DRIVER"]);

    $this->actingAs($driver)->get("/admin/reports")->assertForbidden();
});
