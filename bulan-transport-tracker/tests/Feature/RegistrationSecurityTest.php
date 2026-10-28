<?php

use App\Models\User;

beforeEach(function () {
    $this->admin = User::factory()->admin()->create();
});

it('does not provide a public registration page', function () {
    $this->get('/register')->assertNotFound();
});

it('does not accept public registration submissions', function () {
    $this->post('/register', [
        'first_name' => 'Juan',
        'last_name' => 'Dela Cruz',
        'email' => 'juan@example.test',
        'contact_number' => '09171112222',
        'password' => 'Str0ng!Pass',
        'password_confirmation' => 'Str0ng!Pass',
    ])->assertNotFound();

    expect(User::where('email', 'juan@example.test')->exists())->toBeFalse();
});

it('does not allow a driver to create another driver account', function () {
    $driver = User::factory()->create([
        'role' => 'DRIVER',
    ]);

    $this->actingAs($driver)
        ->post('/admin/drivers', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan2@example.test',
            'contact_number' => '09171112222',
            'password' => 'Str0ng!Pass',
            'password_confirmation' => 'Str0ng!Pass',
            'status' => 'ACTIVE',
        ])
        ->assertForbidden();

    expect(User::where('email', 'juan2@example.test')->exists())->toBeFalse();
});

it('forces admin-created accounts to use the DRIVER role', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/drivers', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan3@example.test',
            'contact_number' => '09171113333',
            'password' => 'Str0ng!Pass',
            'password_confirmation' => 'Str0ng!Pass',
            'status' => 'ACTIVE',
            'role' => 'ADMIN',
        ]);

    $response->assertSessionDoesntHaveErrors();

    $createdUser = User::where('email', 'juan3@example.test')->first();

    expect($createdUser)->not->toBeNull();
    expect($createdUser->role->value)->toBe('DRIVER');
});

it('rejects an invalid PH contact number during admin driver creation', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/drivers', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan4@example.test',
            'contact_number' => '12345',
            'password' => 'Str0ng!Pass',
            'password_confirmation' => 'Str0ng!Pass',
            'status' => 'ACTIVE',
        ]);

    $response->assertSessionHasErrors('contact_number');
});

it('rejects a weak password during admin driver creation', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/drivers', [
            'first_name' => 'Juan',
            'last_name' => 'Dela Cruz',
            'email' => 'juan5@example.test',
            'contact_number' => '09171115555',
            'password' => 'password',
            'password_confirmation' => 'password',
            'status' => 'ACTIVE',
        ]);

    $response->assertSessionHasErrors('password');
});

it('rejects a first name containing numbers', function () {
    $response = $this->actingAs($this->admin)
        ->post('/admin/drivers', [
            'first_name' => 'Juan123',
            'last_name' => 'Dela Cruz',
            'email' => 'juan6@example.test',
            'contact_number' => '09171116666',
            'password' => 'Str0ng!Pass',
            'password_confirmation' => 'Str0ng!Pass',
            'status' => 'ACTIVE',
        ]);

    $response->assertSessionHasErrors('first_name');
});