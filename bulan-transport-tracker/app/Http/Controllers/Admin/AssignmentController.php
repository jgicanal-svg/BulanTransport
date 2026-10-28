<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreAssignmentRequest;
use App\Models\Bus;
use App\Models\BusAssignment;
use App\Models\Driver;
use App\Models\Route;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class AssignmentController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless(
            $request->user()->isAdmin(),
            403
        );

        $assignments = BusAssignment::with([
            'driver.user',
            'bus',
            'route',
        ])
            ->latest('assigned_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Admin/Assignments/Index',
            [
                'assignments' => $assignments,

                'drivers' => Driver::with('user')
                    ->where('status', 'ACTIVE')
                    ->get(),

                'buses' => Bus::where(
                    'status',
                    'ACTIVE'
                )->get(),

                /*
                |--------------------------------------------------------------------------
                | Route information automatically included
                |--------------------------------------------------------------------------
                |
                | Each route now contains:
                |
                | origin
                | origin_latitude
                | origin_longitude
                | destination
                | destination_latitude
                | destination_longitude
                | distance_km
                |
                */

                'routes' => Route::where(
                    'is_active',
                    true
                )
                    ->orderBy('name')
                    ->get(),
            ]
        );
    }


    /**
     * Archive the driver directly from an assignment row.
     *
     * This is the safe equivalent of the bug report's "Delete Driver"
     * action: historical assignment/trip rows are preserved while the driver
     * is soft-deleted and login access is disabled.
     */
    public function archiveDriver(
        Request $request,
        BusAssignment $assignment
    ): RedirectResponse {
        abort_unless($request->user()->isAdmin(), 403);

        $assignment->loadMissing(['driver.user']);

        if ($assignment->activeTrip()) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'End the active trip before deleting this driver.',
            ]);
        }

        $driver = $assignment->driver;

        if (! $driver) {
            return back()->with('toast', [
                'type' => 'error',
                'message' => 'The driver record is no longer available.',
            ]);
        }

        DB::transaction(function () use ($assignment, $driver) {
            if ($assignment->is_active) {
                $assignment->update([
                    'is_active' => false,
                    'ended_at' => now(),
                ]);
            }

            $driver->user?->update([
                'is_active' => false,
            ]);

            $driver->delete();
        });

        return back()->with('toast', [
            'type' => 'success',
            'message' => 'Driver archived and removed from active assignments.',
        ]);
    }

    /**
     * Prevent invalid overlapping active assignments: a driver or a bus can
     * only have ONE active assignment at a time.
     */
    public function store(
        StoreAssignmentRequest $request
    ): RedirectResponse {
        /*
        |--------------------------------------------------------------------------
        | Make sure selected records are actually available
        |--------------------------------------------------------------------------
        */

        $driver = Driver::with('user')
            ->where('status', 'ACTIVE')
            ->find($request->driver_id);

        if (! $driver) {
            throw ValidationException::withMessages([
                'driver_id' =>
                    'The selected driver is unavailable or inactive.',
            ]);
        }

        $bus = Bus::where(
            'status',
            'ACTIVE'
        )->find($request->bus_id);

        if (! $bus) {
            throw ValidationException::withMessages([
                'bus_id' =>
                    'The selected bus is unavailable or inactive.',
            ]);
        }

        $route = Route::where(
            'is_active',
            true
        )->find($request->route_id);

        if (! $route) {
            throw ValidationException::withMessages([
                'route_id' =>
                    'The selected route is unavailable or inactive.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent overlapping Driver assignment
        |--------------------------------------------------------------------------
        */

        $existingDriver =
            BusAssignment::where(
                'driver_id',
                $driver->id
            )
                ->where(
                    'is_active',
                    true
                )
                ->exists();

        if ($existingDriver) {
            throw ValidationException::withMessages([
                'driver_id' =>
                    'This driver already has an active assignment.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Prevent overlapping Bus assignment
        |--------------------------------------------------------------------------
        */

        $existingBus =
            BusAssignment::where(
                'bus_id',
                $bus->id
            )
                ->where(
                    'is_active',
                    true
                )
                ->exists();

        if ($existingBus) {
            throw ValidationException::withMessages([
                'bus_id' =>
                    'This bus already has an active assignment.',
            ]);
        }

        /*
        |--------------------------------------------------------------------------
        | Create Assignment
        |--------------------------------------------------------------------------
        |
        | The route relationship automatically gives this assignment:
        |
        | Starting location
        | Starting GPS
        | Destination GPS
        | Road distance
        |
        */

        DB::transaction(
            function () use (
                $driver,
                $bus,
                $route
            ) {
                BusAssignment::create([
                    'driver_id' =>
                        $driver->id,

                    'bus_id' =>
                        $bus->id,

                    'route_id' =>
                        $route->id,

                    'assigned_at' =>
                        now(),

                    'is_active' =>
                        true,
                ]);
            }
        );

        return back()->with(
            'toast',
            [
                'type' =>
                    'success',

                'message' =>
                    'Driver, bus, and route assigned successfully.',
            ]
        );
    }

    public function end(BusAssignment $assignment): RedirectResponse
    {
        abort_unless(request()->user()->isAdmin(), 403);

        if ($assignment->activeTrip()) {
            throw ValidationException::withMessages(["assignment" => "Cannot end an assignment with an active trip. End the trip first."]);
        }

        $assignment->update(["is_active" => false, "ended_at" => now()]);

        return back()->with("toast", ["type" => "success", "message" => "Assignment ended."]);
    }
}
