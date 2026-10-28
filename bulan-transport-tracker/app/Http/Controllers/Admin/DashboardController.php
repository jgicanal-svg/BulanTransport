<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Trip;
use App\Models\VehicleLocation;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class DashboardController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdmin(), 403);

        $liveSeconds = config("tracking.live_threshold_seconds");
        $inactiveSeconds = config("tracking.inactive_threshold_seconds");

        $activeBuses = Bus::where("status", "ACTIVE")->count();
        $liveTrips = Trip::where("status", "ACTIVE")->count();

        // Count every bus that is explicitly not ACTIVE, plus ACTIVE buses
        // whose GPS feed is missing/stale. This keeps the dashboard counters
        // independent instead of making "Stale/Inactive" mirror Active Buses.
        $inactiveBuses = Bus::where(function ($query) use ($inactiveSeconds) {
            $query->where("status", "!=", "ACTIVE")
                ->orWhere(function ($activeQuery) use ($inactiveSeconds) {
                    $activeQuery->where("status", "ACTIVE")
                        ->where(function ($locationQuery) use ($inactiveSeconds) {
                            $locationQuery->whereDoesntHave("latestLocation")
                                ->orWhereHas(
                                    "latestLocation",
                                    fn ($latestQuery) => $latestQuery->where(
                                        "recorded_at",
                                        "<",
                                        now()->subSeconds($inactiveSeconds)
                                    )
                                );
                        });
                });
        })->count();

        $gpsActivity = collect(range(6, 0))
            ->map(function ($daysAgo) {
                $date = now()->subDays($daysAgo);

                return [
                    "date" => $date->toDateString(),
                    "label" => $date->format("M j"),
                    "count" => VehicleLocation::whereDate(
                        "received_at",
                        $date->toDateString()
                    )->count(),
                ];
            })
            ->values();

        return Inertia::render("Admin/Dashboard/Index", [
            "metrics" => [
                "total_buses" => Bus::count(),
                "active_buses" => $activeBuses,
                "live_trips" => $liveTrips,
                "stale_inactive_buses" => $inactiveBuses,
                "active_drivers" => Driver::where("status", "ACTIVE")->count(),
                "routes" => Route::where("is_active", true)->count(),
                "gps_updates_today" => VehicleLocation::whereDate(
                    "received_at",
                    today()
                )->count(),
            ],

            "gpsActivity" => $gpsActivity,

            "thresholds" => [
                "live_seconds" => $liveSeconds,
                "stale_seconds" => config(
                    "tracking.stale_threshold_seconds"
                ),
                "inactive_seconds" => $inactiveSeconds,
            ],

            "recentActivity" => VehicleLocation::with([
                "bus",
                "driver.user",
            ])
                ->latest("received_at")
                ->limit(10)
                ->get(),
        ]);
    }
}