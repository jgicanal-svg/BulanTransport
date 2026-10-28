<?php

namespace App\Http\Requests\Auth;

use App\Models\Driver;
use Illuminate\Auth\Events\Lockout;
use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class LoginRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'email' => [
                'required',
                'string',
                'email:rfc',
                'regex:/^[^\\s@]+@[^\\s@]+\\.[A-Za-z]{2,}$/',
            ],

            'password' => [
                'required',
                'string',
            ],
        ];
    }

    public function messages(): array
    {
        return [
            'email.required' => 'The email address is required.',
            'email.email' => 'Enter a valid email address.',
            'email.regex' => 'Enter a complete email address including a valid domain (for example, name@example.com).',
            'password.required' => 'The password is required.',
        ];
    }

    /**
     * Attempt to authenticate the request's credentials.
     *
     * Only active ADMIN and DRIVER accounts are allowed.
     *
     * @throws ValidationException
     */
    public function authenticate(): void
    {
        $this->ensureIsNotRateLimited();

        $authenticated = Auth::attempt(
            [
                'email' => $this->string('email')->toString(),
                'password' => $this->string('password')->toString(),
                'is_active' => true,
            ],
            $this->boolean('remember')
        );

        /*
        |--------------------------------------------------------------------------
        | Invalid credentials / inactive account
        |--------------------------------------------------------------------------
        */

        if (! $authenticated) {
            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'The provided credentials are incorrect or this account is inactive.',
            ]);
        }

        $user = Auth::user();

        /*
        |--------------------------------------------------------------------------
        | ADMIN + DRIVER ONLY
        |--------------------------------------------------------------------------
        |
        | Old PASSENGER accounts may still exist in the database.
        | They are intentionally prevented from accessing the authentication
        | system.
        |
        */

        if (! $user || (! $user->isAdmin() && ! $user->isDriver())) {
            Auth::logout();

            $this->session()->invalidate();
            $this->session()->regenerateToken();

            RateLimiter::hit($this->throttleKey());

            throw ValidationException::withMessages([
                'email' => 'Access denied. Only administrator and driver accounts can sign in.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Driver operational state
        |--------------------------------------------------------------------------
        |
        | A driver may still have an active User row after the Driver record is
        | marked inactive or soft-deleted. Check the driver profile (including
        | trashed rows) so inactive/archived drivers cannot enter the terminal.
        | Legacy/test DRIVER users that never had a Driver profile remain
        | compatible.
        */
        if ($user->isDriver()) {
            $driver = Driver::withTrashed()
                ->where('user_id', $user->id)
                ->first();

            if (
                $driver &&
                ($driver->trashed() || $driver->status->value !== 'ACTIVE')
            ) {
                Auth::logout();

                $this->session()->invalidate();
                $this->session()->regenerateToken();

                RateLimiter::hit($this->throttleKey());

                throw ValidationException::withMessages([
                    'email' => 'The provided credentials are incorrect or this account is inactive.',
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Successful login
        |--------------------------------------------------------------------------
        */

        RateLimiter::clear($this->throttleKey());
    }

    /**
     * Ensure the login request is not rate limited.
     *
     * @throws ValidationException
     */
    public function ensureIsNotRateLimited(): void
    {
        if (! RateLimiter::tooManyAttempts(
            $this->throttleKey(),
            5
        )) {
            return;
        }

        event(new Lockout($this));

        $seconds = RateLimiter::availableIn(
            $this->throttleKey()
        );

        throw ValidationException::withMessages([
            'email' => trans('auth.throttle', [
                'seconds' => $seconds,
                'minutes' => ceil($seconds / 60),
            ]),
        ]);
    }

    /**
     * Get the rate limiting throttle key for the request.
     */
    public function throttleKey(): string
    {
        return Str::transliterate(
            Str::lower(
                $this->string('email')->toString()
            )
            . '|'
            . $this->ip()
        );
    }
}