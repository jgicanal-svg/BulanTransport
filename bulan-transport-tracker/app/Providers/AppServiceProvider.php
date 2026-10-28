<?php

namespace App\Providers;

use App\Models\Bus;
use App\Models\Driver;
use App\Models\Route;
use App\Policies\BusPolicy;
use App\Policies\DriverPolicy;
use App\Policies\RoutePolicy;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        Gate::policy(Driver::class, DriverPolicy::class);
        Gate::policy(Bus::class, BusPolicy::class);
        Gate::policy(Route::class, RoutePolicy::class);
    }
}