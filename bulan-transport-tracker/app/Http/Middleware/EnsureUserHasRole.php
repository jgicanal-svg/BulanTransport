<?php

namespace App\Http\Middleware;

use App\Enums\UserRole;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureUserHasRole
{
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $user = $request->user();

        if (! $user || ! $user->is_active) {
            abort(403, "Your account is not authorized to access this area.");
        }

        $expected = UserRole::from($role);

        if ($user->role !== $expected) {
            abort(403, "You do not have permission to access this area.");
        }

        return $next($request);
    }
}
