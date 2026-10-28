<?php

namespace App\Http\Controllers\Passenger;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\LatestVehicleLocation;
use App\Models\Trip;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        $inactiveSeconds = config(
            'tracking.inactive_threshold_seconds'
        );

        $liveLocations = LatestVehicleLocation::query()
            ->with([
                'bus',
                'driver.user',
                'trip.busAssignment.route',
            ])
            ->where(
                'recorded_at',
                '>=',
                now()->subSeconds($inactiveSeconds)
            )
            ->latest('recorded_at')
            ->get()
            ->map(function (LatestVehicleLocation $location) {
                return [
                    'bus_id' => $location->bus_id,
                    'bus_number' =>
                        $location->bus?->bus_number ?? 'Unknown Bus',
                    'driver_name' =>
                        $location->driver?->user?->full_name,
                    'route' =>
                        $location->trip
                            ?->busAssignment
                            ?->route
                            ?->name ?? 'No assigned route',
                    'recorded_at' => $location->recorded_at,
                ];
            });

        return Inertia::render('Passenger/Dashboard', [
            'metrics' => [
                'active_buses' => Bus::where(
                    'status',
                    'ACTIVE'
                )->count(),

                'live_trips' => Trip::where(
                    'status',
                    'ACTIVE'
                )->count(),

                'network_online' => true,
            ],

            'nearbyBuses' => $liveLocations
                ->take(5)
                ->values(),

            'passenger' => [
                'name' => $request->user()->full_name,
            ],
        ]);
    }
}