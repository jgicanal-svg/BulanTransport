<?php

namespace App\Policies;

use App\Models\Bus;
use App\Models\User;

class BusPolicy
{
    public function viewAny(User $user): bool { return $user->isAdmin(); }
    public function view(User $user, Bus $bus): bool { return $user->isAdmin(); }
    public function create(User $user): bool { return $user->isAdmin(); }
    public function update(User $user, Bus $bus): bool { return $user->isAdmin(); }
    public function archive(User $user, Bus $bus): bool { return $user->isAdmin(); }
    public function restore(User $user, Bus $bus): bool { return $user->isAdmin(); }
    public function forceDelete(User $user, Bus $bus): bool { return $user->isAdmin() && $bus->trashed(); }
}
