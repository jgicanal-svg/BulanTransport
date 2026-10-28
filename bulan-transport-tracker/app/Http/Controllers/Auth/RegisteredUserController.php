<?php

namespace App\Http\Controllers\Auth;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\RegisterPassengerRequest;
use App\Models\User;
use Illuminate\Auth\Events\Registered;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;

class RegisteredUserController extends Controller
{
    public function create(): Response
    {
        return Inertia::render('Auth/Register');
    }

    public function store(
        RegisterPassengerRequest $request
    ): RedirectResponse {
        $validated = $request->validated();

        $user = DB::transaction(function () use ($validated) {
            return User::create([
                'first_name' => $validated['first_name'],
                'middle_name' => $validated['middle_name'] ?? null,
                'last_name' => $validated['last_name'],
                'email' => $validated['email'],
                'contact_number' => $validated['contact_number'],
                'password' => Hash::make($validated['password']),

                // Never accept the role from the request.
                'role' => UserRole::PASSENGER,
                'is_active' => true,
            ]);
        });

        event(new Registered($user));

        Auth::login($user);

        $request->session()->regenerate();

        return redirect()
            ->route('passenger.dashboard')
            ->with('toast', [
                'type' => 'success',
                'message' => 'Passenger account created successfully. Welcome!',
            ]);
    }
}