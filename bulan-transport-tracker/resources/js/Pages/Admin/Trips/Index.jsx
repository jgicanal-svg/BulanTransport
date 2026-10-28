import { Head } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHero from "@/Components/UI/PageHero";
import DataTable from "@/Components/UI/DataTable";
import StatusBadge from "@/Components/UI/StatusBadge";

export default function Index({ trips, summary = {} }) {
    const columns = [
        {
            key: "driver",
            label: "Driver",
            render: (trip) =>
                trip.bus_assignment?.driver?.user?.full_name ?? "—",
        },
        {
            key: "bus",
            label: "Bus",
            render: (trip) => trip.bus_assignment?.bus?.bus_number ?? "—",
        },
        {
            key: "route",
            label: "Route",
            render: (trip) => {
                const route = trip.bus_assignment?.route;

                return (
                    <div>
                        <p className="font-medium text-app-text">
                            {route?.name ?? "—"}
                        </p>

                        {route?.distance_km && (
                            <p className="mt-0.5 text-xs text-app-muted">
                                {route.distance_km} km
                            </p>
                        )}
                    </div>
                );
            },
        },
        {
            key: "trip_date",
            label: "Trip Date",
            render: (trip) =>
                trip.started_at
                    ? new Date(trip.started_at).toLocaleDateString()
                    : "—",
        },
        {
            key: "vehicle_locations_count",
            label: "GPS Points",
            render: (trip) => trip.vehicle_locations_count ?? 0,
        },
        {
            key: "started_at",
            label: "Departure",
            render: (trip) =>
                trip.started_at
                    ? new Date(trip.started_at).toLocaleString()
                    : "—",
        },
        {
            key: "ended_at",
            label: "Arrival",
            render: (trip) =>
                trip.ended_at
                    ? new Date(trip.ended_at).toLocaleString()
                    : trip.status === "ACTIVE"
                      ? "In transit"
                      : "—",
        },
        {
            key: "status",
            label: "Status",
            render: (trip) => <StatusBadge status={trip.status} />,
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Trips" />

            <PageHero
                eyebrow="Operations Log"
                title="Trip Records"
                description="Monitor fleet departures, arrivals, routes, and trip status."
            />

            <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-card border border-app-border bg-app-surface p-4">
                    <p className="text-xs text-app-muted">Fleet Units</p>
                    <p className="mt-1 text-xl font-semibold text-app-text">{summary.fleet_total ?? 0}</p>
                </div>
                <div className="rounded-card border border-app-border bg-app-surface p-4">
                    <p className="text-xs text-app-muted">Total Trips</p>
                    <p className="mt-1 text-xl font-semibold text-app-text">{summary.total ?? 0}</p>
                </div>
                <div className="rounded-card border border-app-border bg-app-surface p-4">
                    <p className="text-xs text-app-muted">Completed</p>
                    <p className="mt-1 text-xl font-semibold text-app-success">{summary.completed ?? 0}</p>
                </div>
                <div className="rounded-card border border-app-border bg-app-surface p-4">
                    <p className="text-xs text-app-muted">Active</p>
                    <p className="mt-1 text-xl font-semibold text-app-primary">{summary.active ?? 0}</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                rows={trips.data}
                paginator={trips}
                emptyTitle="No trips found"
            />
        </AuthenticatedLayout>
    );
}
