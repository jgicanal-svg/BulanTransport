import { useState } from "react";
import { Head, router } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHero from "@/Components/UI/PageHero";
import DataTable from "@/Components/UI/DataTable";
import SelectInput from "@/Components/UI/SelectInput";
import TextInput from "@/Components/UI/TextInput";
import PrimaryButton from "@/Components/UI/PrimaryButton";

import { Bus, Navigation, CircleOff } from "lucide-react";

function formatAccuracy(value) {
    if (value === null || value === undefined || value === "") {
        return "—";
    }

    const meters = Number(value);

    if (!Number.isFinite(meters)) {
        return "—";
    }

    if (meters >= 1000) {
        return `${(meters / 1000).toFixed(2)} km`;
    }

    return `${meters.toFixed(1)} m`;
}

export default function Index({ points, filters, buses, drivers, summary }) {
    const [form, setForm] = useState({
        date_from: filters.date_from ?? "",

        date_to: filters.date_to ?? "",

        bus_id: filters.bus_id ?? "",

        driver_id: filters.driver_id ?? "",
    });

    const applyFilters = (event) => {
        event.preventDefault();

        router.get("/admin/tracking-history", form, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const columns = [
        {
            key: "bus",
            label: "Bus",
            render: (point) => point.bus?.bus_number ?? "—",
        },
        {
            key: "driver",
            label: "Driver",
            render: (point) => point.driver?.user?.full_name ?? "—",
        },
        {
            key: "route",
            label: "Route",
            render: (point) => point.trip?.bus_assignment?.route?.name ?? "—",
        },
        {
            key: "trip_status",
            label: "Trip Status",
            render: (point) => point.trip?.status ?? "—",
        },
        {
            key: "coords",
            label: "Coordinates",
            render: (point) => (
                <span className="text-xs">
                    {point.latitude}, {point.longitude}
                </span>
            ),
        },
        {
            key: "accuracy",
            label: "Accuracy",
            render: (point) => formatAccuracy(point.accuracy),
        },
        {
            key: "recorded_at",
            label: "Recorded At",
            render: (point) =>
                point.recorded_at
                    ? new Date(point.recorded_at).toLocaleString()
                    : "—",
        },
        {
            key: "received_at",
            label: "Received At",
            render: (point) =>
                point.received_at
                    ? new Date(point.received_at).toLocaleString()
                    : "—",
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Tracking History" />

            <PageHero
                eyebrow="Trip Telemetry Records"
                title="Tracking History"
                description="GPS history recorded from buses operating on trips."
            />

            {/* SUMMARY */}
            <div className="mb-5 grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div className="rounded-card border border-app-border bg-app-surface p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                            <Bus size={18} />
                        </span>

                        <div>
                            <p className="text-xs text-app-muted">
                                Total Buses
                            </p>

                            <p className="text-xl font-semibold text-app-text">
                                {summary?.total_buses ?? 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-card border border-app-border bg-app-surface p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-control bg-app-success/10 text-app-success">
                            <Navigation size={18} />
                        </span>

                        <div>
                            <p className="text-xs text-app-muted">
                                Buses on Trips
                            </p>

                            <p className="text-xl font-semibold text-app-success">
                                {summary?.buses_on_trips ?? 0}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-card border border-app-border bg-app-surface p-4">
                    <div className="flex items-center gap-3">
                        <span className="flex h-10 w-10 items-center justify-center rounded-control bg-app-bg text-app-muted">
                            <CircleOff size={18} />
                        </span>

                        <div>
                            <p className="text-xs text-app-muted">Not Active</p>

                            <p className="text-xl font-semibold text-app-text">
                                {summary?.inactive_buses ?? 0}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* FILTERS */}
            <form
                onSubmit={applyFilters}
                className="mb-4 grid grid-cols-2 gap-3 rounded-card border border-app-border bg-app-surface p-4 sm:grid-cols-4"
            >
                <TextInput
                    label="From"
                    type="date"
                    value={form.date_from}
                    onChange={(event) =>
                        setForm({
                            ...form,
                            date_from: event.target.value,
                        })
                    }
                />

                <TextInput
                    label="To"
                    type="date"
                    value={form.date_to}
                    onChange={(event) =>
                        setForm({
                            ...form,
                            date_to: event.target.value,
                        })
                    }
                />

                <SelectInput
                    label="Bus"
                    value={form.bus_id}
                    onChange={(event) =>
                        setForm({
                            ...form,
                            bus_id: event.target.value,
                        })
                    }
                >
                    <option value="">All buses</option>

                    {buses.map((bus) => (
                        <option key={bus.id} value={bus.id}>
                            {bus.bus_number}
                        </option>
                    ))}
                </SelectInput>

                <SelectInput
                    label="Driver"
                    value={form.driver_id}
                    onChange={(event) =>
                        setForm({
                            ...form,
                            driver_id: event.target.value,
                        })
                    }
                >
                    <option value="">All drivers</option>

                    {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>
                            {driver.user?.full_name ?? "Driver"}
                        </option>
                    ))}
                </SelectInput>

                <div className="col-span-2 sm:col-span-4">
                    <PrimaryButton type="submit">Apply Filters</PrimaryButton>
                </div>
            </form>

            <DataTable
                columns={columns}
                rows={points.data}
                paginator={points}
                emptyTitle="No trip tracking history for the selected filters"
            />
        </AuthenticatedLayout>
    );
}
