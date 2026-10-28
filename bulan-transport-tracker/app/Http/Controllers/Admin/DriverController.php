<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreDriverRequest;
use App\Http\Requests\Admin\UpdateDriverRequest;
use App\Models\Driver;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Inertia\Inertia;
use Inertia\Response;
use App\Enums\UserRole;

class DriverController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize("viewAny", Driver::class);

        $drivers = Driver::with("user")
            ->whereHas("user")
            ->when($request->search, function ($query, $search) {
                $query->whereHas("user", function ($q) use ($search) {
                    $q->where("first_name", "like", "%{$search}%")
                        ->orWhere("last_name", "like", "%{$search}%")
                        ->orWhere("email", "like", "%{$search}%");
                });
            })
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render("Admin/Drivers/Index", [
            "drivers" => $drivers,
            "filters" => $request->only("search"),
        ]);
    }

    public function archived(Request $request): Response
    {
        $this->authorize("viewAny", Driver::class);

        $drivers = Driver::onlyTrashed()->with("user")
            ->when($request->search, function ($query, $search) {
                $query->whereHas("user", function ($q) use ($search) {
                    $q->where("first_name", "like", "%{$search}%")->orWhere("last_name", "like", "%{$search}%");
                });
            })
            ->latest("deleted_at")
            ->paginate(10)
            ->withQueryString();

        return Inertia::render("Admin/Drivers/Archived", [
            "drivers" => $drivers,
            "filters" => $request->only("search"),
        ]);
    }

    public function store(StoreDriverRequest $request): RedirectResponse
    {
        DB::transaction(function () use ($request) {
            $user = User::create([
                "first_name" => $request->first_name,
                "middle_name" => $request->middle_name,
                "last_name" => $request->last_name,
                "email" => $request->email,
                "contact_number" => $request->contact_number,
                "password" => Hash::make($request->password),
                "role" => UserRole::DRIVER,
                "is_active" => true,
            ]);

            Driver::create([
                "user_id" => $user->id,
                "employee_code" => $request->employee_code,
                "license_number" => $request->license_number,
                "license_expiry" => $request->license_expiry,
                "status" => $request->status,
            ]);
        });

        return back()->with("toast", ["type" => "success", "message" => "Driver created successfully."]);
    }

    public function update(UpdateDriverRequest $request, Driver $driver): RedirectResponse
    {
        DB::transaction(function () use ($request, $driver) {
            $driver->user->update([
                "first_name" => $request->first_name,
                "middle_name" => $request->middle_name,
                "last_name" => $request->last_name,
                "email" => $request->email,
                "contact_number" => $request->contact_number,
            ]);

            $driver->update([
                "employee_code" => $request->employee_code,
                "license_number" => $request->license_number,
                "license_expiry" => $request->license_expiry,
                "status" => $request->status,
            ]);

            // Keep authentication access synchronized with the operational
            // driver status. An INACTIVE driver must not be able to log in.
            $driver->user->update([
                "is_active" => $request->status === "ACTIVE",
            ]);
        });

        return back()->with("toast", ["type" => "success", "message" => "Driver updated successfully."]);
    }

    public function archive(Driver $driver): RedirectResponse
    {
        $this->authorize("archive", $driver);

        $activeAssignment = $driver->activeAssignment();

        if ($activeAssignment?->activeTrip()) {
            return back()->with("toast", [
                "type" => "error",
                "message" => "This driver cannot be archived while an active trip is running. End the trip first.",
            ]);
        }

        DB::transaction(function () use ($driver, $activeAssignment) {
            if ($activeAssignment) {
                $activeAssignment->update([
                    "is_active" => false,
                    "ended_at" => now(),
                ]);
            }

            $driver->user?->update(["is_active" => false]);
            $driver->delete();
        });

        return back()->with("toast", ["type" => "success", "message" => "Driver archived and login access disabled."]);
    }

    public function restore(int $driverId): RedirectResponse
    {
        $driver = Driver::onlyTrashed()->findOrFail($driverId);
        $this->authorize("restore", $driver);

        $driver->restore();

        $driver->user?->update([
            "is_active" => $driver->status->value === "ACTIVE",
        ]);

        return back()->with("toast", ["type" => "success", "message" => "Driver restored."]);
    }

    public function forceDelete(int $driverId): RedirectResponse
    {
        $driver = Driver::onlyTrashed()->findOrFail($driverId);
        $this->authorize("forceDelete", $driver);

        DB::transaction(function () use ($driver) {
            $userId = $driver->user_id;
            $driver->forceDelete();
            User::withTrashed()->where("id", $userId)->forceDelete();
        });

        return back()->with("toast", ["type" => "success", "message" => "Driver permanently deleted."]);
    }
}
