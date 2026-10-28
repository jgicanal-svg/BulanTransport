<?php

use App\Models\Driver;
use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it("allows admin to create a driver", function () {
    $response = $this->actingAs($this->admin)->post("/admin/drivers", [
        "first_name" => "Pedro",
        "last_name" => "Santos",
        "email" => "pedro@example.test",
        "contact_number" => "09171230001",
        "password" => "Str0ng!Pass",
        "password_confirmation" => "Str0ng!Pass",
        "status" => "ACTIVE",
    ]);

    $response->assertSessionDoesntHaveErrors();
    expect(User::where("email", "pedro@example.test")->exists())->toBeTrue();
});

it("archives an active driver instead of deleting", function () {
    $driver = Driver::factory()->create();

    $this->actingAs($this->admin)->patch("/admin/drivers/{$driver->id}/archive");

    expect(Driver::withTrashed()->find($driver->id)->trashed())->toBeTrue();
    expect(Driver::find($driver->id))->toBeNull();
});

it("restores an archived driver", function () {
    $driver = Driver::factory()->create();
    $driver->delete();

    $this->actingAs($this->admin)->patch("/admin/drivers/{$driver->id}/restore");

    expect(Driver::find($driver->id))->not->toBeNull();
});

it("permanently deletes only an already archived driver", function () {
    $driver = Driver::factory()->create();
    $driver->delete();

    $this->actingAs($this->admin)->delete("/admin/drivers/{$driver->id}/force-delete");

    expect(Driver::withTrashed()->find($driver->id))->toBeNull();
});

it("rejects a non-alphabetic first name on update", function () {
    $driver = Driver::factory()->create();

    $response = $this->actingAs($this->admin)->put("/admin/drivers/{$driver->id}", [
        "first_name" => "Pedro99",
        "last_name" => "Santos",
        "email" => $driver->user->email,
        "contact_number" => $driver->user->contact_number,
        "status" => "ACTIVE",
    ]);

    $response->assertSessionHasErrors("first_name");
});
