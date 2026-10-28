<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_public_registration_screen_is_disabled(): void
    {
        $this->get('/register')
            ->assertNotFound();
    }

    public function test_guests_cannot_submit_public_registration(): void
    {
        $response = $this->post('/register', [
            'first_name' => 'Test',
            'last_name' => 'User',
            'email' => 'test@example.com',
            'contact_number' => '09123456789',
            'password' => 'Password1!',
            'password_confirmation' => 'Password1!',
        ]);

        $response->assertNotFound();

        $this->assertGuest();

        $this->assertDatabaseMissing('users', [
            'email' => 'test@example.com',
        ]);
    }
}