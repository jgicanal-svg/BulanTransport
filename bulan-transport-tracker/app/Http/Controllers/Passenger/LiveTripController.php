<?php

namespace App\Http\Controllers\Passenger;

use App\Http\Controllers\Controller;
use App\Models\Route;
use Inertia\Inertia;
use Inertia\Response;

class LiveTripController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('Passenger/LiveTrip', [
            'routes' => Route::query()
                ->where('is_active', true)
                ->with('stops')
                ->get(),
        ]);
    }
}