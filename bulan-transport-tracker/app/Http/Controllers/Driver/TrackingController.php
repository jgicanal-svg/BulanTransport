<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Http\Requests\Driver\SubmitLocationRequest;
use App\Models\Trip;
use App\Support\TripDirection;
use App\Services\LocationIngestionService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Illuminate\Http\JsonResponse;

class TrackingController extends Controller
{
    public function show(Request $request): Response
    {
        $driver = $request->user()->driver;
        $assignment = $driver?->activeAssignment();
        $assignment?->load(["bus", "route"]);
        $activeTrip = $assignment?->activeTrip();

        return Inertia::render("Driver/Tracking", [
            "assignment" => $assignment,
            "activeTrip" => $activeTrip,
            "directionName" => $assignment ? TripDirection::name($assignment, $activeTrip) : null,
        ]);
    }

    public function start(Request $request): RedirectResponse
    {
        $driver = $request->user()->driver;
        $assignment = $driver?->activeAssignment();

        if (! $assignment) {
            throw ValidationException::withMessages(["assignment" => "You have no active assignment. Contact the administrator."]);
        }

        if ($assignment->activeTrip()) {
            return back()->with("toast", ["type" => "info", "message" => "A trip is already active."]);
        }

        Trip::create([
            "bus_assignment_id" => $assignment->id,
            "started_at" => now(),
            "status" => "ACTIVE",
            "start_latitude" => $request->input("latitude"),
            "start_longitude" => $request->input("longitude"),
        ]);

        return back()->with("toast", ["type" => "success", "message" => "Trip started. Tracking is now active."]);
    }

    public function stop(Request $request): RedirectResponse
    {
        $driver = $request->user()->driver;
        $assignment = $driver?->activeAssignment();
        $trip = $assignment?->activeTrip();

        if (! $trip) {
            return back()->with("toast", ["type" => "info", "message" => "No active trip to stop."]);
        }

        $trip->update([
            "status" => "COMPLETED",
            "ended_at" => now(),
            "end_latitude" => $request->input("latitude"),
            "end_longitude" => $request->input("longitude"),
        ]);

        return back()->with("toast", ["type" => "success", "message" => "Trip ended. Tracking stopped."]);
    }

    public function submitLocation(
        SubmitLocationRequest $request,
        LocationIngestionService $service
    ): RedirectResponse|JsonResponse {
        $driver = $request->user()->driver;

        if (! $driver) {
            throw ValidationException::withMessages([
                "driver" => "Your driver profile is unavailable.",
            ]);
        }

        $key = "gps-ingest:{$driver->id}";
        $limit = config("tracking.ingestion_rate_limit_per_minute");

        if (RateLimiter::tooManyAttempts($key, $limit)) {
            throw ValidationException::withMessages([
                "rate_limit" => "Too many location updates. Please slow down.",
            ]);
        }

        RateLimiter::hit($key, 60);

        $location = $service->ingest($driver, $request->validated());

        if ($request->expectsJson()) {
            return response()->json([
                "ok" => true,
                "recorded_at" => $location->recorded_at?->toIso8601String(),
            ]);
        }

        return back(303);
    }
}
