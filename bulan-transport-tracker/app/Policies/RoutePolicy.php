<?php

namespace App\Policies;

use App\Models\Route;
use App\Models\User;

class RoutePolicy
{
    public function viewAny(User $user): bool { return $user->isAdmin(); }
    public function view(User $user, Route $route): bool { return $user->isAdmin(); }
    public function create(User $user): bool { return $user->isAdmin(); }
    public function update(User $user, Route $route): bool { return $user->isAdmin(); }
    public function archive(User $user, Route $route): bool { return $user->isAdmin(); }
    public function restore(User $user, Route $route): bool { return $user->isAdmin(); }
    public function forceDelete(User $user, Route $route): bool { return $user->isAdmin() && $route->trashed(); }
}
