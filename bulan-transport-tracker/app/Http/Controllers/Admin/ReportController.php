<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Driver;
use App\Models\Route;
use App\Models\Trip;
use App\Models\VehicleLocation;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use App\Models\BusNoTravelReport;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request): Response
    {
        abort_unless($request->user()->isAdmin(), 403);

        return Inertia::render("Admin/Reports/Index", [
            "buses" => Bus::orderBy("bus_number")->get(),
            "drivers" => Driver::with("user")->get(),
            "routes" => Route::get(),
        ]);
    }

    public function vehicleLocationHistory(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $query = $this->scopedLocationQuery($request);

        return response()->json([
            "rows" => $query->latest("recorded_at")->paginate(10)->withQueryString(),
            "summary" => ["total_points" => (clone $query)->count()],
        ]);
    }

    public function tripHistory(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $query = Trip::with(["busAssignment.driver.user", "busAssignment.bus", "busAssignment.route"])
            ->withCount("vehicleLocations")
            ->when($request->date_from, fn ($q, $v) => $q->whereDate("started_at", ">=", $v))
            ->when($request->date_to, fn ($q, $v) => $q->whereDate("started_at", "<=", $v))
            ->when($request->status, fn ($q, $v) => $q->where("status", $v));

        return response()->json([
            "rows" => $query->latest("started_at")->paginate(10)->withQueryString(),
            "summary" => ["total_trips" => (clone $query)->count()],
        ]);
    }

    public function staleInactive(Request $request)
    {
        abort_unless($request->user()->isAdmin(), 403);

        $inactiveSeconds = config("tracking.inactive_threshold_seconds");

        $buses = Bus::with("latestLocation")
            ->where(function ($q) use ($inactiveSeconds) {
                $q->whereDoesntHave("latestLocation")
                    ->orWhereHas("latestLocation", fn ($q2) => $q2->where("recorded_at", "<", now()->subSeconds($inactiveSeconds)));
            })
            ->paginate(10);

        return response()->json(["rows" => $buses]);
    }

    public function monthlyBusTravel(Request $request)
    {
        abort_unless(
            $request->user()->isAdmin(),
            403
        );

        /*
        |--------------------------------------------------------------------------
        | Selected Month
        |--------------------------------------------------------------------------
        */

        $monthValue =
            $request->input(
                'month',
                now()->format('Y-m')
            );

        try {
            $selectedMonth =
                Carbon::createFromFormat(
                    'Y-m',
                    $monthValue
                )->startOfMonth();
        } catch (\Throwable $exception) {
            $selectedMonth =
                now()->startOfMonth();
        }

        $start =
            $selectedMonth->copy()->startOfMonth();

        $end =
            $selectedMonth->copy()->endOfMonth();

        /*
        |--------------------------------------------------------------------------
        | Load all buses
        |--------------------------------------------------------------------------
        */

        $buses = Bus::query()
            ->when(
                $request->bus_id,
                fn ($query, $busId) =>
                    $query->where('id', $busId)
            )
            ->orderBy('bus_number')
            ->get();

        /*
        |--------------------------------------------------------------------------
        | Build report
        |--------------------------------------------------------------------------
        */

        $rows = $buses->map(
            function ($bus) use (
                $start,
                $end,
                $selectedMonth
            ) {
                /*
                |--------------------------------------------------------------------------
                | Count trips of this bus for selected month
                |--------------------------------------------------------------------------
                */

                $tripCount =
                    Trip::whereHas(
                        'busAssignment',
                        fn ($query) =>
                            $query->where(
                                'bus_id',
                                $bus->id
                            )
                    )
                        ->whereBetween(
                            'started_at',
                            [
                                $start,
                                $end,
                            ]
                        )
                        ->count();

                /*
                |--------------------------------------------------------------------------
                | No Travel Reason
                |--------------------------------------------------------------------------
                */

                $noTravel =
                    BusNoTravelReport::with(
                        'driver.user'
                    )
                        ->where(
                            'bus_id',
                            $bus->id
                        )
                        ->where(
                            'month',
                            $selectedMonth->month
                        )
                        ->where(
                            'year',
                            $selectedMonth->year
                        )
                        ->first();

                return [
                    'bus_id' =>
                        $bus->id,

                    'bus_number' =>
                        $bus->bus_number,

                    'trip_count' =>
                        $tripCount,

                    'travel_status' =>
                        $tripCount > 0
                            ? 'TRAVELED'
                            : 'NO_TRAVEL',

                    'reason' =>
                        $noTravel?->reason,

                    'remarks' =>
                        $noTravel?->remarks,

                    'reported_by' =>
                        $noTravel?->driver?->user?->full_name,

                    'reason_status' =>
                        $tripCount > 0
                            ? 'NOT_REQUIRED'
                            : ($noTravel
                                ? 'SUBMITTED'
                                : 'PENDING'),
                ];
            }
        );

        return response()->json([
            'rows' => $rows->values(),

            'summary' => [
                'total_buses' =>
                    $rows->count(),

                'buses_traveled' =>
                    $rows
                        ->where(
                            'trip_count',
                            '>',
                            0
                        )
                        ->count(),

                'buses_no_travel' =>
                    $rows
                        ->where(
                            'trip_count',
                            0
                        )
                        ->count(),

                'total_trips' =>
                    $rows->sum(
                        'trip_count'
                    ),

                'month' =>
                    $selectedMonth->format(
                        'F Y'
                    ),
            ],
        ]);
    }

    public function exportVehicleLocationHistory(Request $request): StreamedResponse
    {
        abort_unless($request->user()->isAdmin(), 403);

        $query = $this->scopedLocationQuery($request);

        return response()->streamDownload(function () use ($query) {
            $out = fopen("php://output", "w");
            fputcsv($out, ["Bus", "Driver", "Route", "Latitude", "Longitude", "Accuracy (m)", "Recorded At", "Received At"]);

            $query->orderBy("recorded_at")->chunk(500, function ($rows) use ($out) {
                foreach ($rows as $row) {
                    fputcsv($out, [
                        $row->bus?->bus_number,
                        $row->driver?->user?->full_name,
                        $row->trip?->busAssignment?->route?->name,
                        $row->latitude,
                        $row->longitude,
                        $row->accuracy,
                        $row->recorded_at,
                        $row->received_at,
                    ]);
                }
            });

            fclose($out);
        }, "vehicle-location-history.csv");
    }

    private function scopedLocationQuery(Request $request)
    {
        return VehicleLocation::with(["bus", "driver.user", "trip.busAssignment.route"])
            ->when($request->date_from, fn ($q, $v) => $q->whereDate("recorded_at", ">=", $v))
            ->when($request->date_to, fn ($q, $v) => $q->whereDate("recorded_at", "<=", $v))
            ->when($request->bus_id, fn ($q, $v) => $q->where("bus_id", $v))
            ->when($request->driver_id, fn ($q, $v) => $q->where("driver_id", $v))
            ->when($request->route_id, fn ($q, $v) => $q->whereHas("trip.busAssignment", fn ($q2) => $q2->where("route_id", $v)));
    }
}
