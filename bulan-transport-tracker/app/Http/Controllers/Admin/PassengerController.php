<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class PassengerController extends Controller
{
    public function index(Request $request): Response
    {
        $passengers = User::query()
            ->where('role', UserRole::PASSENGER->value)
            ->when(
                $request->string('search')->toString(),
                function ($query, string $search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where(
                                'first_name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'middle_name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'last_name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'email',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'contact_number',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Passengers/Index', [
            'passengers' => $passengers,
            'filters' => $request->only('search'),
        ]);
    }

    public function archived(Request $request): Response
    {
        $passengers = User::onlyTrashed()
            ->where('role', UserRole::PASSENGER->value)
            ->when(
                $request->string('search')->toString(),
                function ($query, string $search) {
                    $query->where(function ($query) use ($search) {
                        $query
                            ->where(
                                'first_name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'last_name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'email',
                                'like',
                                "%{$search}%"
                            );
                    });
                }
            )
            ->latest('deleted_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Admin/Passengers/Archived',
            [
                'passengers' => $passengers,
                'filters' => $request->only('search'),
            ]
        );
    }

    public function archive(User $passenger): RedirectResponse
    {
        $this->ensurePassenger($passenger);

        $passenger->update([
            'is_active' => false,
        ]);

        $passenger->delete();

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Passenger account archived.',
        ]);
    }

    public function restore(int $passengerId): RedirectResponse
    {
        $passenger = User::onlyTrashed()
            ->where('role', UserRole::PASSENGER->value)
            ->findOrFail($passengerId);

        $passenger->restore();

        $passenger->update([
            'is_active' => true,
        ]);

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Passenger account restored.',
        ]);
    }

    public function forceDelete(
        int $passengerId
    ): RedirectResponse {
        $passenger = User::onlyTrashed()
            ->where('role', UserRole::PASSENGER->value)
            ->findOrFail($passengerId);

        $passenger->forceDelete();

        return back()->with('toast', [
            'type' => 'success',
            'message' =>
                'Passenger account permanently deleted.',
        ]);
    }

    private function ensurePassenger(User $user): void
    {
        abort_unless(
            $user->role === UserRole::PASSENGER,
            404
        );
    }
}