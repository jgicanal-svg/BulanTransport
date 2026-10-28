<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Http\Requests\Admin\StoreBusRequest;
use App\Http\Requests\Admin\UpdateBusRequest;
use App\Models\Bus;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\DB;

class BusController extends Controller
{
    public function index(Request $request): Response
    {
        $this->authorize("viewAny", Bus::class);

        $buses = Bus::query()
            ->when($request->search, fn ($q, $s) => $q->where("bus_number", "like", "%{$s}%")->orWhere("plate_number", "like", "%{$s}%"))
            ->when($request->status, fn ($q, $s) => $q->where("status", $s))
            ->latest()
            ->paginate(10)
            ->withQueryString();

        return Inertia::render("Admin/Buses/Index", [
            "buses" => $buses,
            "filters" => $request->only("search", "status"),
        ]);
    }

    public function archived(Request $request): Response
    {
        $this->authorize("viewAny", Bus::class);

        $buses = Bus::onlyTrashed()
            ->when($request->search, fn ($q, $s) => $q->where("bus_number", "like", "%{$s}%"))
            ->latest("deleted_at")
            ->paginate(10)
            ->withQueryString();

        return Inertia::render("Admin/Buses/Archived", [
            "buses" => $buses,
            "filters" => $request->only("search"),
        ]);
    }

    public function store(StoreBusRequest $request): RedirectResponse
    {
        Bus::create($request->validated());

        return back()->with("toast", ["type" => "success", "message" => "Bus created successfully."]);
    }

    public function update(UpdateBusRequest $request, Bus $bus): RedirectResponse
    {
        $bus->update($request->validated());

        return back()->with("toast", ["type" => "success", "message" => "Bus updated successfully."]);
    }

    public function archive(Bus $bus): RedirectResponse
    {
        $this->authorize("archive", $bus);

        $activeAssignment = $bus->activeAssignment();

        if ($activeAssignment?->activeTrip()) {
            return back()->with("toast", [
                "type" => "error",
                "message" => "This vehicle is currently in use on an active trip. End the trip before archiving it.",
            ]);
        }

        DB::transaction(function () use ($bus, $activeAssignment) {
            if ($activeAssignment) {
                $activeAssignment->update([
                    "is_active" => false,
                    "ended_at" => now(),
                ]);
            }

            $bus->delete();
        });

        return back()->with("toast", ["type" => "success", "message" => "Bus archived."]);
    }

    public function restore(int $busId): RedirectResponse
    {
        $bus = Bus::onlyTrashed()->findOrFail($busId);
        $this->authorize("restore", $bus);
        $bus->restore();

        return back()->with("toast", ["type" => "success", "message" => "Bus restored."]);
    }

    public function forceDelete(int $busId): RedirectResponse
    {
        $bus = Bus::onlyTrashed()->findOrFail($busId);
        $this->authorize("forceDelete", $bus);

        if ($bus->assignments()->whereHas("trips", fn ($query) => $query->where("status", "ACTIVE"))->exists()) {
            return back()->with("toast", [
                "type" => "error",
                "message" => "This vehicle still has an active trip and cannot be permanently deleted.",
            ]);
        }

        $bus->forceDelete();

        return back()->with("toast", ["type" => "success", "message" => "Bus permanently deleted."]);
    }

    public function exportCsv(Request $request): StreamedResponse
    {
        $this->authorize("viewAny", Bus::class);

        return response()->streamDownload(function () {
            $out = fopen("php://output", "w");
            fputcsv($out, ["Bus Number", "Plate Number", "Device Code", "Model", "Capacity", "Status"]);

            Bus::orderBy("bus_number")->chunk(200, function ($rows) use ($out) {
                foreach ($rows as $bus) {
                    fputcsv($out, [$bus->bus_number, $bus->plate_number, $bus->device_code, $bus->model, $bus->capacity, $bus->status->value]);
                }
            });

            fclose($out);
        }, "fleet-inventory.csv");
    }
}
