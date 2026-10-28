<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Trip;
use App\Models\Bus;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TripController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()->isAdmin(),
            403
        );

        $baseQuery = Trip::query()
            ->when(
                $request->status,
                fn ($query, $status) =>
                    $query->where('status', $status)
            );

        $trips = (clone $baseQuery)
            ->with([
                'busAssignment.driver.user',
                'busAssignment.bus',
                'busAssignment.route',
            ])
            ->withCount('vehicleLocations')
            ->latest('started_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Admin/Trips/Index',
            [
                'trips' => $trips,
                'filters' => $request->only('status'),
                'summary' => [
                    'fleet_total' => Bus::count(),
                    'total' => (clone $baseQuery)->count(),
                    'completed' => (clone $baseQuery)
                        ->where('status', 'COMPLETED')
                        ->count(),
                    'active' => (clone $baseQuery)
                        ->where('status', 'ACTIVE')
                        ->count(),
                ],
            ]
        );
    }
}