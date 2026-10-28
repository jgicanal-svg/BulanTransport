<?php

use App\Models\Bus;
use App\Models\BusAssignment;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Trip;
use App\Models\User;
use Illuminate\Support\Facades\Http;

it('accepts a vehicle capacity update above the old 25 passenger limit', function () {
    $admin = User::factory()->admin()->create();
    $bus = Bus::factory()->create(['capacity' => 25]);

    $response = $this->actingAs($admin)->put("/admin/buses/{$bus->id}", [
        'bus_number' => $bus->bus_number,
        'plate_number' => $bus->plate_number,
        'device_code' => $bus->device_code,
        'model' => $bus->model,
        'capacity' => 26,
        'status' => 'ACTIVE',
        'notes' => $bus->notes,
    ]);

    $response->assertSessionDoesntHaveErrors();
    expect($bus->fresh()->capacity)->toBe(26);
});

it('rejects malformed email addresses before attempting authentication', function () {
    $response = $this->post('/login', [
        'email' => '344@r',
        'password' => 'password',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('denies login for an inactive driver profile even when the user row is active', function () {
    $driver = Driver::factory()->create(['status' => 'INACTIVE']);
    $driver->user->update([
        'password' => bcrypt('password123!'),
        'is_active' => true,
    ]);

    $response = $this->post('/login', [
        'email' => $driver->user->email,
        'password' => 'password123!',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('denies login for an archived driver profile', function () {
    $driver = Driver::factory()->create();
    $driver->user->update([
        'password' => bcrypt('password123!'),
        'is_active' => true,
    ]);
    $driver->delete();

    $response = $this->post('/login', [
        'email' => $driver->user->email,
        'password' => 'password123!',
    ]);

    $response->assertSessionHasErrors('email');
    $this->assertGuest();
});

it('applies the selected bus filter to the monthly travel report', function () {
    $admin = User::factory()->admin()->create();
    $busA = Bus::factory()->create();
    Bus::factory()->create();

    $response = $this->actingAs($admin)->getJson(
        "/admin/reports/monthly-bus-travel?month=".now()->format('Y-m')."&bus_id={$busA->id}"
    );

    $response->assertOk();
    expect($response->json('rows'))->toHaveCount(1)
        ->and($response->json('rows.0.bus_id'))->toBe($busA->id);
});

it('keeps route creation functional if the external road router is unavailable', function () {
    Http::fake([
        'router.project-osrm.org/*' => Http::response([], 503),
    ]);

    $admin = User::factory()->admin()->create();

    $response = $this->actingAs($admin)->post('/admin/routes', [
        'name' => 'Bulan - Test Destination',
        'code' => 'RT-FALLBACK-1',
        'origin' => 'Bulan Terminal',
        'origin_latitude' => 12.6706,
        'origin_longitude' => 123.8747,
        'destination' => 'Test Destination',
        'destination_latitude' => 12.9700,
        'destination_longitude' => 123.9900,
        'is_active' => true,
        'stops' => [],
    ]);

    $response->assertSessionDoesntHaveErrors();

    $route = Route::where('code', 'RT-FALLBACK-1')->first();
    expect($route)->not->toBeNull()
        ->and($route->geometry)->toHaveCount(2)
        ->and((float) $route->distance_km)->toBeGreaterThan(0);
});

it('blocks archiving a vehicle that is currently used by an active trip', function () {
    $admin = User::factory()->admin()->create();
    $driver = Driver::factory()->create();
    $bus = Bus::factory()->create();
    $route = Route::factory()->create();
    $assignment = BusAssignment::factory()->create([
        'driver_id' => $driver->id,
        'bus_id' => $bus->id,
        'route_id' => $route->id,
        'is_active' => true,
    ]);
    Trip::factory()->active()->create(['bus_assignment_id' => $assignment->id]);

    $response = $this->actingAs($admin)->patch("/admin/buses/{$bus->id}/archive");

    $response->assertSessionHas('toast');
    expect(Bus::find($bus->id))->not->toBeNull();
});

it('lets an administrator archive a driver from the assignment action while preserving history', function () {
    $admin = User::factory()->admin()->create();
    $assignment = BusAssignment::factory()->create(['is_active' => true]);
    $driverId = $assignment->driver_id;
    $userId = $assignment->driver->user_id;

    $response = $this->actingAs($admin)
        ->patch("/admin/assignments/{$assignment->id}/archive-driver");

    $response->assertSessionDoesntHaveErrors();
    expect(Driver::withTrashed()->find($driverId)?->trashed())->toBeTrue()
        ->and(User::find($userId)?->is_active)->toBeFalse()
        ->and($assignment->fresh()->is_active)->toBeFalse();
});
