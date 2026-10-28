<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use Inertia\Response;

class AuthenticatedSessionController extends Controller
{
    /**
     * Display the login view.
     *
     * If the user is already authenticated, automatically return them
     * to their respective dashboard instead of showing the login page again.
     */
    public function create(Request $request): Response|RedirectResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Already Logged-In ADMIN
        |--------------------------------------------------------------------------
        */

        if (Auth::check() && $request->user()->isAdmin()) {
            return redirect()
                ->route('admin.dashboard')
                ->with(
                    'status',
                    'You are already signed in as Administrator.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Already Logged-In DRIVER
        |--------------------------------------------------------------------------
        */

        if (Auth::check() && $request->user()->isDriver()) {
            return redirect()
                ->route('driver.assignment.show')
                ->with(
                    'status',
                    'You are already signed in as Driver.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Unexpected authenticated role
        |--------------------------------------------------------------------------
        |
        | For example, an old PASSENGER account with an existing session.
        | Destroy the session and return them to the login screen.
        |
        */

        if (Auth::check()) {
            Auth::guard('web')->logout();

            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()
                ->route('login')
                ->with(
                    'status',
                    'Your account is not authorized to access this system.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Normal Login Page
        |--------------------------------------------------------------------------
        */

        return Inertia::render('Auth/Login', [
            'canResetPassword' => Route::has('password.request'),
            'status' => session('status'),
        ]);
    }

    /**
     * Handle an incoming authentication request.
     */
    public function store(LoginRequest $request): RedirectResponse
    {
        /*
        |--------------------------------------------------------------------------
        | Authenticate
        |--------------------------------------------------------------------------
        */

        $request->authenticate();

        /*
        |--------------------------------------------------------------------------
        | Prevent Session Fixation
        |--------------------------------------------------------------------------
        */

        $request->session()->regenerate();

        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | ADMIN Redirect
        |--------------------------------------------------------------------------
        */

        if ($user->isAdmin()) {
            return redirect()
                ->route('admin.dashboard')
                ->with(
                    'status',
                    'Welcome back, Administrator.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | DRIVER Redirect
        |--------------------------------------------------------------------------
        */

        if ($user->isDriver()) {
            return redirect()
                ->route('driver.assignment.show')
                ->with(
                    'status',
                    'Welcome back.'
                );
        }

        /*
        |--------------------------------------------------------------------------
        | Failsafe
        |--------------------------------------------------------------------------
        |
        | LoginRequest should already prevent this, but this protects us if
        | authentication rules are accidentally changed later.
        |
        */

        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('login')
            ->withErrors([
                'email' => 'Your account is not authorized to access this system.',
            ]);
    }

    /**
     * Destroy an authenticated session.
     */
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect()
            ->route('login')
            ->with(
                'status',
                'You have been signed out successfully.'
            );
    }
}