<?php

namespace App\Http\Controllers\Driver;

use App\Http\Controllers\Controller;
use App\Models\BusWeeklyReport;
use App\Models\Trip;
use App\Support\TripDirection;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function show(Request $request): Response
    {
        $driver = $request->user()->driver;
        $assignment = $driver?->activeAssignment();
        $assignment?->load(['bus', 'route']);
        $activeTrip = $assignment?->activeTrip();
        $weekStart = now()->startOfWeek();
        $weekEnd = $weekStart->copy()->endOfWeek();

        $weeklyTripCount = 0;
        $weeklyReport = null;
        if ($assignment) {
            $weeklyTripCount = Trip::whereHas('busAssignment', fn ($query) =>
                $query->where('bus_id', $assignment->bus_id))
                ->whereBetween('started_at', [$weekStart, $weekEnd])->count();
            $weeklyReport = BusWeeklyReport::where('bus_id', $assignment->bus_id)
                ->where('driver_id', $driver->id)
                ->where('iso_year', $weekStart->isoWeekYear)
                ->where('iso_week', $weekStart->isoWeek)
                ->first();
        }

        return Inertia::render('Driver/MyAssignment', [
            'assignment' => $assignment,
            'activeTrip' => $activeTrip,
            'directionName' => $assignment ? TripDirection::name($assignment, $activeTrip) : null,
            'weeklyTripCount' => $weeklyTripCount,
            'weeklyReport' => $weeklyReport,
            'reportWeek' => $weekStart->format('M j').' - '.$weekEnd->format('M j, Y'),
        ]);
    }

    public function storeNoTravelReport(Request $request): RedirectResponse
    {
        $driver = $request->user()->driver;
        $assignment = $driver?->activeAssignment();
        if (! $assignment) {
            throw ValidationException::withMessages(['reason' => 'You do not have an active bus assignment.']);
        }

        $validated = $request->validate([
            'reason' => ['required', Rule::in([
                'Trips Operated Normally', 'Vehicle Maintenance', 'Mechanical Issue',
                'No Assignment', 'Driver Unavailable', 'Route Suspended',
                'Weather / Road Condition', 'Other',
            ])],
            'remarks' => ['nullable', 'string', 'max:1000'],
        ]);
        if ($validated['reason'] === 'Other' && blank($validated['remarks'] ?? null)) {
            throw ValidationException::withMessages(['remarks' => 'Please provide an explanation when selecting Other.']);
        }

        $weekStart = now()->startOfWeek();
        BusWeeklyReport::updateOrCreate([
            'bus_id' => $assignment->bus_id,
            'driver_id' => $driver->id,
            'iso_year' => $weekStart->isoWeekYear,
            'iso_week' => $weekStart->isoWeek,
        ], [
            'reason' => $validated['reason'],
            'remarks' => $validated['remarks'] ?? null,
        ]);

        return back()->with('toast', ['type' => 'success', 'message' => 'Weekly report saved successfully.']);
    }
}
