<?php

namespace App\Policies;

use App\Models\Driver;
use App\Models\User;

class DriverPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->isAdmin();
    }

    public function view(User $user, Driver $driver): bool
    {
        return $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->isAdmin();
    }

    public function update(User $user, Driver $driver): bool
    {
        return $user->isAdmin();
    }

    public function archive(User $user, Driver $driver): bool
    {
        return $user->isAdmin();
    }

    public function restore(User $user, Driver $driver): bool
    {
        return $user->isAdmin();
    }

    public function forceDelete(User $user, Driver $driver): bool
    {
        return $user->isAdmin() && $driver->trashed();
    }
}
