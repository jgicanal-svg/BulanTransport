<?php

namespace App\Http\Controllers\Commuter;

use App\Http\Controllers\Controller;
use App\Models\Bus;
use App\Models\Route;
use Inertia\Inertia;
use Inertia\Response;

class HomeController extends Controller
{
    /**
     * Public marketing/informational landing page. Fares shown here are
     * informational only (no payment/checkout flow) - electronic fare
     * collection remains explicitly out of scope per SCOPE_GUARDRAILS.md.
     */
    public function index(): Response
    {
        return Inertia::render("Commuter/Home", [
            "stats" => [
                "active_fleet" => Bus::where("status", "ACTIVE")->count(),
                "routes" => Route::where("is_active", true)->count(),
            ],
        ]);
    }
}
