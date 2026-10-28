<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreRouteRequest;
use App\Http\Requests\Admin\UpdateRouteRequest;
use App\Models\Route;
use App\Services\RoadRoutingService;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;
use RuntimeException;

class RouteController extends Controller
{
    public function __construct(
        private readonly RoadRoutingService $roadRoutingService
    ) {
    }

    public function index(Request $request): Response
    {
        $this->authorize(
            'viewAny',
            Route::class
        );

        $routes = Route::query()
            ->with('stops')
            ->withCount([
                'stops',

                'assignments as active_fleet_count' =>
                    fn ($query) =>
                        $query->where(
                            'is_active',
                            true
                        ),
            ])
            ->when(
                $request->search,
                function ($query, $search) {
                    $query->where(
                        function ($routeQuery) use ($search) {
                            $routeQuery
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'code',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'origin',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'destination',
                                    'like',
                                    "%{$search}%"
                                );
                        }
                    );
                }
            )
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Admin/Routes/Index',
            [
                'routes' => $routes,

                'filters' =>
                    $request->only('search'),
            ]
        );
    }

    public function archived(Request $request): Response
    {
        $this->authorize(
            'viewAny',
            Route::class
        );

        $routes = Route::onlyTrashed()
            ->when(
                $request->search,
                function ($query, $search) {
                    $query->where(
                        function ($routeQuery) use ($search) {
                            $routeQuery
                                ->where(
                                    'name',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'code',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'origin',
                                    'like',
                                    "%{$search}%"
                                )
                                ->orWhere(
                                    'destination',
                                    'like',
                                    "%{$search}%"
                                );
                        }
                    );
                }
            )
            ->latest('deleted_at')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render(
            'Admin/Routes/Archived',
            [
                'routes' => $routes,

                'filters' =>
                    $request->only('search'),
            ]
        );
    }

    public function store(
        StoreRouteRequest $request
    ): RedirectResponse {
        $validated =
            $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Prepare route stops as routing waypoints
        |--------------------------------------------------------------------------
        */

        $routingStops =
            collect(
                $validated['stops'] ?? []
            )
                ->sortBy('stop_order')
                ->map(
                    fn ($stop) => [
                        'latitude' =>
                            (float) $stop['latitude'],

                        'longitude' =>
                            (float) $stop['longitude'],
                    ]
                )
                ->values()
                ->all();

        /*
        |--------------------------------------------------------------------------
        | Calculate actual road-path distance + geometry
        |--------------------------------------------------------------------------
        */

        try {
            $roadRoute =
                $this->roadRoutingService->calculate(
                    (float) $validated['origin_latitude'],
                    (float) $validated['origin_longitude'],
                    (float) $validated['destination_latitude'],
                    (float) $validated['destination_longitude'],
                    $routingStops
                );
        } catch (RuntimeException $exception) {
            return back()
                ->withInput()
                ->withErrors([
                    'destination_latitude' =>
                        $exception->getMessage(),
                ]);
        }

        DB::transaction(
            function () use (
                $validated,
                $roadRoute
            ) {
                $stops =
                    $validated['stops'] ?? [];

                unset(
                    $validated['stops']
                );

                /*
                |--------------------------------------------------------------------------
                | Automatically generated values
                |--------------------------------------------------------------------------
                */

                $validated['distance_km'] =
                    $roadRoute['distance_km'];

                $validated['geometry'] =
                    $roadRoute['geometry'];

                /*
                |--------------------------------------------------------------------------
                | Create Route
                |--------------------------------------------------------------------------
                */

                $route =
                    Route::create(
                        $validated
                    );

                /*
                |--------------------------------------------------------------------------
                | Save Stops
                |--------------------------------------------------------------------------
                */

                foreach (
                    $stops as $stop
                ) {
                    $route
                        ->stops()
                        ->create($stop);
                }
            }
        );

        return back()->with(
            'toast',
            [
                'type' => 'success',

                'message' =>
                    'Route created successfully. Road distance was calculated automatically.',
            ]
        );
    }

    public function update(
        UpdateRouteRequest $request,
        Route $route
    ): RedirectResponse {
        $validated =
            $request->validated();

        /*
        |--------------------------------------------------------------------------
        | Prepare routing waypoints
        |--------------------------------------------------------------------------
        */

        $routingStops =
            collect(
                $validated['stops'] ?? []
            )
                ->sortBy('stop_order')
                ->map(
                    fn ($stop) => [
                        'latitude' =>
                            (float) $stop['latitude'],

                        'longitude' =>
                            (float) $stop['longitude'],
                    ]
                )
                ->values()
                ->all();

        /*
        |--------------------------------------------------------------------------
        | Recalculate road path
        |--------------------------------------------------------------------------
        */

        try {
            $roadRoute =
                $this->roadRoutingService->calculate(
                    (float) $validated['origin_latitude'],
                    (float) $validated['origin_longitude'],
                    (float) $validated['destination_latitude'],
                    (float) $validated['destination_longitude'],
                    $routingStops
                );
        } catch (RuntimeException $exception) {
            return back()
                ->withInput()
                ->withErrors([
                    'destination_latitude' =>
                        $exception->getMessage(),
                ]);
        }

        DB::transaction(
            function () use (
                $validated,
                $roadRoute,
                $route
            ) {
                $stopsProvided =
                    array_key_exists(
                        'stops',
                        $validated
                    );

                $stops =
                    $validated['stops'] ?? [];

                unset(
                    $validated['stops']
                );

                /*
                |--------------------------------------------------------------------------
                | Replace calculated route information
                |--------------------------------------------------------------------------
                */

                $validated['distance_km'] =
                    $roadRoute['distance_km'];

                $validated['geometry'] =
                    $roadRoute['geometry'];

                $route->update(
                    $validated
                );

                /*
                |--------------------------------------------------------------------------
                | Replace stops
                |--------------------------------------------------------------------------
                */

                if ($stopsProvided) {
                    $route
                        ->stops()
                        ->delete();

                    foreach (
                        $stops as $stop
                    ) {
                        $route
                            ->stops()
                            ->create($stop);
                    }
                }
            }
        );

        return back()->with(
            'toast',
            [
                'type' => 'success',

                'message' =>
                    'Route updated successfully. Road distance was recalculated automatically.',
            ]
        );
    }

    public function archive(
        Route $route
    ): RedirectResponse {
        $this->authorize(
            'archive',
            $route
        );

        $route->delete();

        return back()->with(
            'toast',
            [
                'type' => 'success',
                'message' =>
                    'Route archived.',
            ]
        );
    }

    public function restore(
        int $routeId
    ): RedirectResponse {
        $route =
            Route::onlyTrashed()
                ->findOrFail(
                    $routeId
                );

        $this->authorize(
            'restore',
            $route
        );

        $route->restore();

        return back()->with(
            'toast',
            [
                'type' => 'success',
                'message' =>
                    'Route restored.',
            ]
        );
    }

    public function forceDelete(
        int $routeId
    ): RedirectResponse {
        $route =
            Route::onlyTrashed()
                ->findOrFail(
                    $routeId
                );

        $this->authorize(
            'forceDelete',
            $route
        );

        $route->forceDelete();

        return back()->with(
            'toast',
            [
                'type' => 'success',
                'message' =>
                    'Route permanently deleted.',
            ]
        );
    }
}