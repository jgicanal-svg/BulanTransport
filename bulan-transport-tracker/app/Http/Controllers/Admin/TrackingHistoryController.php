<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\BusAssignment;
use App\Models\Driver;
use App\Models\VehicleLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackingHistoryController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()->isAdmin(),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | GPS history
        |--------------------------------------------------------------------------
        | Only show GPS records connected to an actual trip.
        */

        $points = VehicleLocation::with([
            'bus',
            'driver.user',
            'trip.busAssignment.route',
        ])
            ->whereNotNull('trip_id')
            ->when(
                $request->date_from,
                fn ($query, $value) =>
                    $query->whereDate(
                        'recorded_at',
                        '>=',
                        $value
                    )
            )
            ->when(
                $request->date_to,
                fn ($query, $value) =>
                    $query->whereDate(
                        'recorded_at',
                        '<=',
                        $value
                    )
            )
            ->when(
                $request->bus_id,
                fn ($query, $value) =>
                    $query->where(
                        'bus_id',
                        $value
                    )
            )
            ->when(
                $request->driver_id,
                fn ($query, $value) =>
                    $query->where(
                        'driver_id',
                        $value
                    )
            )
            ->latest('recorded_at')
            ->paginate(10)
            ->withQueryString();

        /*
        |--------------------------------------------------------------------------
        | Buses currently on active trips
        |--------------------------------------------------------------------------
        */

        $activeBusIds = BusAssignment::query()
            ->where('is_active', true)
            ->whereHas(
                'trips',
                fn ($query) =>
                    $query->where(
                        'status',
                        'ACTIVE'
                    )
            )
            ->distinct()
            ->pluck('bus_id');

        $totalBuses = Bus::count();

        $busesOnTrips =
            $activeBusIds->count();

        $inactiveBuses =
            max(
                $totalBuses - $busesOnTrips,
                0
            );

        return Inertia::render(
            'Admin/TrackingHistory/Index',
            [
                'points' => $points,

                'filters' => $request->only(
                    'date_from',
                    'date_to',
                    'bus_id',
                    'driver_id'
                ),

                'buses' => Bus::orderBy(
                    'bus_number'
                )->get(),

                'drivers' => Driver::with(
                    'user'
                )->get(),

                'summary' => [
                    'total_buses' =>
                        $totalBuses,

                    'buses_on_trips' =>
                        $busesOnTrips,

                    'inactive_buses' =>
                        $inactiveBuses,
                ],
            ]
        );
    }
}