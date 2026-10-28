import { useEffect, useState } from "react";
import { Head } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHero from "@/Components/UI/PageHero";
import DataTable from "@/Components/UI/DataTable";
import SelectInput from "@/Components/UI/SelectInput";
import TextInput from "@/Components/UI/TextInput";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import SecondaryButton from "@/Components/UI/SecondaryButton";
import { Download, Printer, FileText } from "lucide-react";

const REPORTS = [
    {
        key: "monthly-bus-travel",
        label: "Monthly Bus Travel",
    },
    {
        key: "vehicle-location-history",
        label: "Vehicle Location History",
    },
    {
        key: "trip-history",
        label: "Trip History",
    },
    {
        key: "stale-inactive",
        label: "Stale/Inactive Vehicles",
    },
];

export default function Index({ buses, drivers, routes }) {
    const [activeReport, setActiveReport] = useState("monthly-bus-travel");
    const [filters, setFilters] = useState({
        month: new Date().toISOString().slice(0, 7),

        date_from: "",
        date_to: "",
        bus_id: "",
        driver_id: "",
        route_id: "",
    });
    const [rows, setRows] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const runReport = async () => {
        setLoading(true);
        const params = new URLSearchParams(
            Object.entries(filters).filter(([, v]) => v),
        );
        const res = await fetch(
            `/admin/reports/${activeReport}?${params.toString()}`,
        );
        const data = await res.json();
        setRows(data.rows?.data ?? data.rows ?? []);
        setSummary(data.summary ?? null);
        setLoading(false);
    };

    useEffect(() => {
        runReport();
    }, [activeReport]);

    const columnsFor = {
        "monthly-bus-travel": [
            {
                key: "bus_number",
                label: "Bus",
            },
            {
                key: "trip_count",
                label: "Trips This Month",
            },
            {
                key: "travel_status",
                label: "Travel Status",
                render: (row) => (
                    <span
                        className={
                            row.travel_status === "TRAVELED"
                                ? "font-medium text-app-success"
                                : "font-medium text-app-danger"
                        }
                    >
                        {row.travel_status === "TRAVELED"
                            ? "Traveled"
                            : "No Travel"}
                    </span>
                ),
            },
            {
                key: "reason",
                label: "No Travel Reason",
                render: (row) => {
                    if (row.trip_count > 0) {
                        return "—";
                    }

                    if (!row.reason) {
                        return (
                            <span className="text-app-danger">
                                Pending Driver Report
                            </span>
                        );
                    }

                    return (
                        <div>
                            <p className="font-medium text-app-text">
                                {row.reason}
                            </p>

                            {row.remarks && (
                                <p className="mt-1 text-xs text-app-muted">
                                    {row.remarks}
                                </p>
                            )}
                        </div>
                    );
                },
            },
            {
                key: "reported_by",
                label: "Reported By",
                render: (row) => row.reported_by ?? "—",
            },
        ],
        "vehicle-location-history": [
            { key: "bus", label: "Bus", render: (r) => r.bus?.bus_number },
            {
                key: "driver",
                label: "Driver",
                render: (r) => r.driver?.user?.full_name,
            },
            {
                key: "coords",
                label: "Coordinates",
                render: (r) => `${r.latitude}, ${r.longitude}`,
            },
            {
                key: "recorded_at",
                label: "Recorded At",
                render: (r) => new Date(r.recorded_at).toLocaleString(),
            },
        ],
        "trip-history": [
            {
                key: "driver",
                label: "Driver",
                render: (r) => r.bus_assignment?.driver?.user?.full_name,
            },
            {
                key: "bus",
                label: "Bus",
                render: (r) => r.bus_assignment?.bus?.bus_number,
            },
            {
                key: "route",
                label: "Route",
                render: (r) => r.bus_assignment?.route?.name ?? "—",
            },
            {
                key: "vehicle_locations_count",
                label: "GPS Points",
                render: (r) => r.vehicle_locations_count ?? 0,
            },
            { key: "status", label: "Status" },
            {
                key: "started_at",
                label: "Departure",
                render: (r) =>
                    r.started_at
                        ? new Date(r.started_at).toLocaleString()
                        : "-",
            },
            {
                key: "ended_at",
                label: "Arrival",
                render: (row) =>
                    row.ended_at
                        ? new Date(row.ended_at).toLocaleString()
                        : row.status === "ACTIVE"
                          ? "In transit"
                          : "—",
            },
        ],
        "stale-inactive": [
            { key: "bus_number", label: "Bus" },
            {
                key: "last_update",
                label: "Last Update",
                render: (r) => r.latest_location?.recorded_at ?? "Never",
            },
        ],
    };

    return (
        <AuthenticatedLayout>
            <Head title="Reports" />
            <PageHero
                eyebrow="Decision Support"
                title="Reports & Analytics"
                description="Vehicle location history, trip history, and stale/inactive vehicle reports."
            />

            <div className="mb-4 flex flex-wrap gap-2">
                {REPORTS.map((r) => (
                    <button
                        key={r.key}
                        onClick={() => setActiveReport(r.key)}
                        className={`rounded-control px-4 py-2 text-sm ${activeReport === r.key ? "bg-app-primary text-white" : "border border-app-border bg-app-surface text-app-text hover:bg-app-bg"}`}
                    >
                        {r.label}
                    </button>
                ))}
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3 rounded-card border border-app-border bg-app-surface p-4 sm:grid-cols-5">
                {activeReport === "monthly-bus-travel" && (
                    <TextInput
                        label="Month"
                        type="month"
                        value={filters.month}
                        onChange={(event) =>
                            setFilters({
                                ...filters,
                                month: event.target.value,
                            })
                        }
                    />
                )}
                {activeReport !== "monthly-bus-travel" && (
                    <>
                        <TextInput
                            label="From"
                            type="date"
                            value={filters.date_from}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    date_from: e.target.value,
                                })
                            }
                        />

                        <TextInput
                            label="To"
                            type="date"
                            value={filters.date_to}
                            onChange={(e) =>
                                setFilters({
                                    ...filters,
                                    date_to: e.target.value,
                                })
                            }
                        />
                    </>
                )}
                <SelectInput
                    label="Bus"
                    value={filters.bus_id}
                    onChange={(e) =>
                        setFilters({ ...filters, bus_id: e.target.value })
                    }
                >
                    <option value="">All</option>
                    {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.bus_number}
                        </option>
                    ))}
                </SelectInput>
                <SelectInput
                    label="Driver"
                    value={filters.driver_id}
                    onChange={(e) =>
                        setFilters({ ...filters, driver_id: e.target.value })
                    }
                >
                    <option value="">All</option>
                    {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.user?.full_name}
                        </option>
                    ))}
                </SelectInput>
                <div className="flex items-end gap-2">
                    <PrimaryButton onClick={runReport}>
                        {loading ? "Generating..." : "Generate Report"}
                    </PrimaryButton>
                    {activeReport === "vehicle-location-history" && (
                        <SecondaryButton
                            onClick={() =>
                                (window.location =
                                    "/admin/reports/vehicle-location-history/export?" +
                                    new URLSearchParams(
                                        Object.entries(filters).filter(
                                            ([, v]) => v,
                                        ),
                                    ).toString())
                            }
                        >
                            <Download size={15} /> Export CSV
                        </SecondaryButton>
                    )}
                    <SecondaryButton onClick={() => window.print()}>
                        <Printer size={15} /> Print
                    </SecondaryButton>
                </div>
            </div>

            {summary && activeReport === "monthly-bus-travel" && (
                <div className="mb-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="rounded-card border border-app-border bg-app-surface p-4">
                        <p className="text-xs text-app-muted">Total Trips</p>

                        <p className="mt-1 text-xl font-semibold text-app-text">
                            {summary.total_trips ?? 0}
                        </p>
                    </div>

                    <div className="rounded-card border border-app-border bg-app-surface p-4">
                        <p className="text-xs text-app-muted">Total Buses</p>

                        <p className="mt-1 text-xl font-semibold text-app-text">
                            {summary.total_buses ?? 0}
                        </p>
                    </div>

                    <div className="rounded-card border border-app-border bg-app-surface p-4">
                        <p className="text-xs text-app-muted">Buses Traveled</p>

                        <p className="mt-1 text-xl font-semibold text-app-success">
                            {summary.buses_traveled ?? 0}
                        </p>
                    </div>

                    <div className="rounded-card border border-app-border bg-app-surface p-4">
                        <p className="text-xs text-app-muted">No Travel</p>

                        <p className="mt-1 text-xl font-semibold text-app-danger">
                            {summary.buses_no_travel ?? 0}
                        </p>
                    </div>
                </div>
            )}

            <div className="mb-3 flex items-center gap-2 text-xs font-medium text-app-muted print:hidden">
                <FileText size={14} />
                Generated report results
            </div>

            <DataTable
                columns={columnsFor[activeReport]}
                rows={rows}
                emptyTitle={loading ? "Generating report..." : "No data for the selected filters"}
            />
        </AuthenticatedLayout>
    );
}
