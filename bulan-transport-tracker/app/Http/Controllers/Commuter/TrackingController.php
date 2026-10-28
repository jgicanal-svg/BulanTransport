<?php

namespace App\Http\Controllers\Commuter;

use App\Http\Controllers\Controller;
use App\Models\LatestVehicleLocation;
use App\Models\Route;
use App\Support\TripDirection;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class TrackingController extends Controller
{
    public function index(): Response
    {
        return Inertia::render("Commuter/LiveBuses", [
            "routes" => Route::where("is_active", true)->with("stops")->get(),
        ]);
    }

    /**
     * Public, read-only, field-limited response. Never expose contact
     * numbers, emails, credentials, or internal IDs beyond what a commuter
     * needs to identify a bus on the map.
     */
    public function latestLocations(Request $request)
    {
        $inactiveSeconds =
            config("tracking.inactive_threshold_seconds");

        $liveSeconds =
            config("tracking.live_threshold_seconds");

        $staleSeconds =
            config("tracking.stale_threshold_seconds");

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
            ->when(
                $request->route_id,
                fn ($query, $routeId) =>
                    $query->whereHas(
                        "trip.busAssignment",
                        fn ($assignmentQuery) =>
                            $assignmentQuery->where(
                                "route_id",
                                $routeId
                            )
                    )
            )
            ->get()
            ->map(function ($location) use (
                $liveSeconds,
                $staleSeconds
            ) {
                $age = now()->diffInSeconds(
                    $location->recorded_at
                );

                $status =
                    $age <= $liveSeconds
                        ? "LIVE"
                        : (
                            $age <= $staleSeconds
                                ? "STALE"
                                : "INACTIVE"
                        );

                $route =
                    $location
                        ->trip
                        ?->busAssignment
                        ?->route;

                return [
                    /*
                    |--------------------------------------------------------------------------
                    | Public-safe vehicle information
                    |--------------------------------------------------------------------------
                    */

                    "bus_number" =>
                        $location->bus?->bus_number,

                    "driver_name" =>
                        $location
                            ->driver
                            ?->user
                            ?->full_name,

                    "route_id" =>
                        $route?->id,

                    "route" => $location->trip?->busAssignment
                        ? TripDirection::name($location->trip->busAssignment, $location->trip)
                        : $route?->name,

                    "latitude" =>
                        (float) $location->latitude,

                    "longitude" =>
                        (float) $location->longitude,

                    "status" =>
                        $status,

                    "last_update" =>
                        $location->recorded_at,
                ];
            });

        return response()->json([
            "locations" => $locations,
        ])->header("Cache-Control", "no-store, no-cache, must-revalidate, private");
    }
}
