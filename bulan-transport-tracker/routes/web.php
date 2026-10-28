<?php

use App\Http\Controllers\Admin\AssignmentController;
use App\Http\Controllers\Admin\BusController;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Admin\DriverController;
use App\Http\Controllers\Admin\LiveTrackingController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\RouteController;
use App\Http\Controllers\Admin\TrackingHistoryController;
use App\Http\Controllers\Admin\TripController;
use App\Http\Controllers\Commuter\HomeController as CommuterHomeController;
use App\Http\Controllers\Commuter\TrackingController as CommuterTrackingController;
use App\Http\Controllers\Driver\AssignmentController as DriverAssignmentController;
use App\Http\Controllers\Driver\TrackingController as DriverTrackingController;
use App\Http\Controllers\Passenger\DashboardController as PassengerDashboardController;
use App\Http\Controllers\Passenger\LiveTripController as PassengerLiveTripController;
use App\Http\Controllers\Admin\PassengerController;
use Illuminate\Support\Facades\Route;

// ---------------------------------------------------------------------
// Public marketing home + Commuter live tracking (no login required)
// Objective 2.1 / 2.2
// ---------------------------------------------------------------------
Route::get("/", [CommuterHomeController::class, "index"])->name("commuter.home");
Route::get("/live-buses", [CommuterTrackingController::class, "index"])->name("commuter.live-buses");
Route::get("/api/commuter/latest-locations", [CommuterTrackingController::class, "latestLocations"])->name("commuter.latest-locations");

// ---------------------------------------------------------------------
// Authenticated shared dashboard redirect (Breeze default landing)
// ---------------------------------------------------------------------
Route::get('/dashboard', function () {
    $user = request()->user();

    if ($user->isAdmin()) {
        return redirect()->route('admin.dashboard');
    }

    if ($user->isDriver()) {
        return redirect()->route('driver.assignment.show');
    }

    if ($user->isPassenger()) {
        return redirect()->route('passenger.dashboard');
    }

    abort(403, 'Your account role is not authorized.');
})->middleware(['auth', 'verified'])->name('dashboard');

// ---------------------------------------------------------------------
// ADMIN routes
// ---------------------------------------------------------------------
Route::middleware(["auth", "role:ADMIN"])->prefix("admin")->name("admin.")->group(function () {
    Route::get("/dashboard", [DashboardController::class, "index"])->name("dashboard");

    Route::get("/drivers", [DriverController::class, "index"])->name("drivers.index");
    Route::get("/drivers/archived", [DriverController::class, "archived"])->name("drivers.archived");
    Route::post("/drivers", [DriverController::class, "store"])->name("drivers.store");
    Route::put("/drivers/{driver}", [DriverController::class, "update"])->name("drivers.update");
    Route::patch("/drivers/{driver}/archive", [DriverController::class, "archive"])->name("drivers.archive");
    Route::patch("/drivers/{driverId}/restore", [DriverController::class, "restore"])->name("drivers.restore");
    Route::delete("/drivers/{driverId}/force-delete", [DriverController::class, "forceDelete"])->name("drivers.force-delete");

    Route::get("/buses", [BusController::class, "index"])->name("buses.index");
    Route::get("/buses/archived", [BusController::class, "archived"])->name("buses.archived");
    Route::get("/buses/export", [BusController::class, "exportCsv"])->name("buses.export");
    Route::post("/buses", [BusController::class, "store"])->name("buses.store");
    Route::put("/buses/{bus}", [BusController::class, "update"])->name("buses.update");
    Route::patch("/buses/{bus}/archive", [BusController::class, "archive"])->name("buses.archive");
    Route::patch("/buses/{busId}/restore", [BusController::class, "restore"])->name("buses.restore");
    Route::delete("/buses/{busId}/force-delete", [BusController::class, "forceDelete"])->name("buses.force-delete");

    Route::get("/routes", [RouteController::class, "index"])->name("routes.index");
    Route::get("/routes/archived", [RouteController::class, "archived"])->name("routes.archived");
    Route::post("/routes", [RouteController::class, "store"])->name("routes.store");
    Route::put("/routes/{route}", [RouteController::class, "update"])->name("routes.update");
    Route::patch("/routes/{route}/archive", [RouteController::class, "archive"])->name("routes.archive");
    Route::patch("/routes/{routeId}/restore", [RouteController::class, "restore"])->name("routes.restore");
    Route::delete("/routes/{routeId}/force-delete", [RouteController::class, "forceDelete"])->name("routes.force-delete");

    Route::get(
        '/passengers',
        [PassengerController::class, 'index']
    )->name('passengers.index');

    Route::get(
        '/passengers/archived',
        [PassengerController::class, 'archived']
    )->name('passengers.archived');

    Route::patch(
        '/passengers/{passenger}/archive',
        [PassengerController::class, 'archive']
    )->name('passengers.archive');

    Route::patch(
        '/passengers/{passengerId}/restore',
        [PassengerController::class, 'restore']
    )->name('passengers.restore');

    Route::delete(
        '/passengers/{passengerId}/force-delete',
        [PassengerController::class, 'forceDelete']
    )->name('passengers.force-delete');

    Route::get("/assignments", [AssignmentController::class, "index"])->name("assignments.index");
    Route::post("/assignments", [AssignmentController::class, "store"])->name("assignments.store");
    Route::patch("/assignments/{assignment}/end", [AssignmentController::class, "end"])->name("assignments.end");
    Route::patch("/assignments/{assignment}/archive-driver", [AssignmentController::class, "archiveDriver"])->name("assignments.archive-driver");

    Route::get("/trips", [TripController::class, "index"])->name("trips.index");

    Route::get("/live-tracking", [LiveTrackingController::class, "index"])->name("live-tracking.index");
    Route::get("/api/live-tracking/latest-locations", [LiveTrackingController::class, "latestLocations"])->name("live-tracking.latest-locations");

    Route::get("/tracking-history", [TrackingHistoryController::class, "index"])->name("tracking-history.index");

    Route::get(
        '/reports/monthly-bus-travel',
        [ReportController::class, 'monthlyBusTravel']
    )->name('reports.monthly-bus-travel');

    Route::get("/reports", [ReportController::class, "index"])->name("reports.index");
    Route::get("/reports/vehicle-location-history", [ReportController::class, "vehicleLocationHistory"])->name("reports.vehicle-location-history");
    Route::get("/reports/trip-history", [ReportController::class, "tripHistory"])->name("reports.trip-history");
    Route::get("/reports/stale-inactive", [ReportController::class, "staleInactive"])->name("reports.stale-inactive");
    Route::get("/reports/vehicle-location-history/export", [ReportController::class, "exportVehicleLocationHistory"])->name("reports.vehicle-location-history.export");
});

// ---------------------------------------------------------------------
// DRIVER routes
// ---------------------------------------------------------------------
Route::middleware(["auth", "role:DRIVER"])->prefix("driver")->name("driver.")->group(function () {
    Route::get("/assignment", [DriverAssignmentController::class, "show"])->name("assignment.show");
    Route::get("/tracking", [DriverTrackingController::class, "show"])->name("tracking.show");
    Route::post("/tracking/start", [DriverTrackingController::class, "start"])->name("tracking.start");
    Route::post("/tracking/stop", [DriverTrackingController::class, "stop"])->name("tracking.stop");
    Route::post("/tracking/location", [DriverTrackingController::class, "submitLocation"])
        ->middleware("throttle:120,1")
        ->name("tracking.location");
    Route::post(
    '/assignment/no-travel-report',
    [DriverAssignmentController::class, 'storeNoTravelReport']
)->name('assignment.no-travel-report');
});

// ---------------------------------------------------------------------
// PASSENGER routes
// ---------------------------------------------------------------------
Route::middleware([
    'auth',
    'verified',
    'role:PASSENGER',
])
    ->prefix('passenger')
    ->name('passenger.')
    ->group(function () {
        Route::get(
            '/dashboard',
            [PassengerDashboardController::class, 'index']
        )->name('dashboard');

        Route::get(
            '/live-trip',
            [PassengerLiveTripController::class, 'index']
        )->name('live-trip');
    });

require __DIR__."/auth.php";
