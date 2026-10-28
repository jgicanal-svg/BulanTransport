<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\LatestVehicleLocation;
use App\Models\Route;
use App\Support\TripDirection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class LiveTrackingController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdmin(), 403);

        return Inertia::render("Admin/LiveTracking/Index", [
            "routes" => Route::where("is_active", true)->with("stops")->get(),
        ]);
    }

    /**
     * JSON polling fallback for when the WebSocket connection is down,
     * and the initial payload for the live map on page load.
     */
    public function latestLocations(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $inactiveSeconds = config("tracking.inactive_threshold_seconds");

        $locations = LatestVehicleLocation::with([
            "bus",
            "driver.user",
            "trip.busAssignment.route",
        ])
            ->where(
                "recorded_at",
                ">=",
                now()->subSeconds($inactiveSeconds)
            )
            ->whereHas(
                "bus",
                fn ($query) => $query->where("status", "ACTIVE")
            )
            ->whereHas(
                "trip",
                fn ($query) => $query->where("status", "ACTIVE")
            )
            ->get()
            ->each(function ($location) {
                $assignment = $location->trip?->busAssignment;
                $location->setAttribute("direction_name", $assignment
                    ? TripDirection::name($assignment, $location->trip) : null);
            });

        return response()->json([
            "locations" => $locations,
            "thresholds" => [
                "live_seconds" => config("tracking.live_threshold_seconds"),
                "stale_seconds" => config("tracking.stale_threshold_seconds"),
                "inactive_seconds" => $inactiveSeconds,
            ],
        ])->header("Cache-Control", "no-store, no-cache, must-revalidate, private");
    }
}
