import { useEffect, useRef, useState } from "react";

import { Head } from "@inertiajs/react";

import CommuterLayout from "@/Layouts/CommuterLayout";
import MapPanel from "@/Components/Map/MapPanel";

import {
    Search,
    Activity,
    AlertTriangle,
    Clock,
    History,
    X,
    Bus,
    UserRound,
    Route as RouteIcon,
    MapPin,
} from "lucide-react";

const STATUS_PILL = {
    LIVE: "bg-emerald-500/15 text-emerald-300",
    STALE: "bg-amber-500/15 text-amber-300",
    INACTIVE: "bg-slate-500/15 text-slate-400",
};

const STATUS_LABEL = {
    LIVE: "MOVING",
    STALE: "STOPPED",
    INACTIVE: "OFFLINE",
};

function normalizeStatus(status) {
    const value = String(status ?? "").toUpperCase();

    if (value === "LIVE" || value === "MOVING") {
        return "LIVE";
    }

    if (value === "STALE" || value === "STOPPED") {
        return "STALE";
    }

    return "INACTIVE";
}

function formatRelativeTime(value) {
    if (!value) {
        return "No recent update";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "No recent update";
    }

    const seconds = Math.max(
        0,
        Math.floor((Date.now() - date.getTime()) / 1000),
    );

    if (seconds < 10) {
        return "Just now";
    }

    if (seconds < 60) {
        return `${seconds}s ago`;
    }

    const minutes = Math.floor(seconds / 60);

    if (minutes < 60) {
        return `${minutes}m ago`;
    }

    const hours = Math.floor(minutes / 60);

    if (hours < 24) {
        return `${hours}h ago`;
    }

    return `${Math.floor(hours / 24)}d ago`;
}

export default function LiveBuses({ routes }) {
    const [buses, setBuses] = useState([]);

    const [search, setSearch] = useState("");

    const [selectedBusNumber, setSelectedBusNumber] = useState(null);

    const [connected, setConnected] = useState(false);

    const pollingRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | LOAD LIVE LOCATIONS
    |--------------------------------------------------------------------------
    */

    const fetchLocations = async () => {
        try {
            const response = await fetch("/api/commuter/latest-locations", {
                headers: {
                    Accept: "application/json",
                },
                cache: "no-store",
            });

            if (!response.ok) {
                throw new Error("Unable to retrieve current bus locations.");
            }

            const data = await response.json();

            const locations = (data.locations ?? []).map((bus) => ({
                ...bus,

                /*
                 * MapPanel needs a stable marker key.
                 * We use bus number publicly instead of
                 * exposing internal bus IDs.
                 */
                bus_id: bus.bus_number,

                bus_number: bus.bus_number ?? "Unknown Bus",

                driver_name: bus.driver_name ?? "Driver unavailable",

                route_id: bus.route_id ?? null,

                route: bus.route ?? "Route unavailable",

                latitude: Number(bus.latitude),

                longitude: Number(bus.longitude),

                status: normalizeStatus(bus.status),

                last_update: bus.last_update,
            }));

            setBuses(locations);
        } catch (error) {
            console.error("Public tracking error:", error);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REVERB + POLLING
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchLocations();

        if (window.Echo) {
            window.Echo.channel("fleet-tracking").listen(
                ".VehicleLocationUpdated",
                () => {
                    setConnected(true);

                    fetchLocations();
                },
            );
        }

        pollingRef.current = window.setInterval(fetchLocations, 5000);

        return () => {
            if (pollingRef.current) {
                window.clearInterval(pollingRef.current);
            }

            window.Echo?.leaveChannel("fleet-tracking");
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const filteredBuses = buses.filter((bus) => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            bus.bus_number?.toLowerCase().includes(query) ||
            bus.route?.toLowerCase().includes(query) ||
            bus.driver_name?.toLowerCase().includes(query)
        );
    });

    /*
    |--------------------------------------------------------------------------
    | SELECTED BUS
    |--------------------------------------------------------------------------
    */

    const selectedBus =
        buses.find((bus) => bus.bus_number === selectedBusNumber) ?? null;

    /*
    |--------------------------------------------------------------------------
    | SELECTED ROUTE
    |--------------------------------------------------------------------------
    */

    const selectedRoutes = selectedBus
        ? routes.filter((route) => {
              if (
                  selectedBus.route_id &&
                  String(route.id) === String(selectedBus.route_id)
              ) {
                  return true;
              }

              return (
                  route.name?.trim().toLowerCase() ===
                  selectedBus.route?.trim().toLowerCase()
              );
          })
        : [];

    const toggleSelectedBus = (busNumber) => {
        setSelectedBusNumber((current) =>
            current === busNumber ? null : busNumber,
        );
    };

    return (
        <CommuterLayout title="Live Bus Tracking">
            <Head title="Live Buses" />

            <div className="relative w-full lg:left-1/2 lg:w-[calc(100vw-2rem)] lg:-translate-x-1/2">
                <div className="min-h-0 lg:h-[calc(100vh-7.5rem)] lg:min-h-[620px] lg:overflow-hidden">
                    <div className="flex min-h-0 flex-col gap-4 lg:h-full lg:flex-row">
                        {/* ================================
                            FLEET PANEL
                        ================================= */}

                        <aside className="flex h-[360px] w-full shrink-0 flex-col overflow-hidden rounded-[24px] bg-[#081120] p-4 sm:h-[400px] lg:h-full lg:w-80">
                            <div className="mb-4 flex items-center justify-between px-1">
                                <div>
                                    <h2 className="text-base font-semibold text-white">
                                        Fleet Monitor
                                    </h2>

                                    <p className="flex items-center gap-1.5 text-[11px] text-blue-400">
                                        <span
                                            className={`h-1.5 w-1.5 rounded-full ${
                                                connected
                                                    ? "bg-emerald-400"
                                                    : "bg-blue-400"
                                            }`}
                                        />

                                        {connected
                                            ? "Live WebSocket Connected"
                                            : "Global Telemetry Live"}
                                    </p>
                                </div>

                                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#101c30] text-blue-400">
                                    <Activity size={17} />
                                </span>
                            </div>

                            {/* Search */}

                            <div className="relative mb-3">
                                <Search
                                    size={14}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Search bus or route..."
                                    className="w-full rounded-lg border border-slate-700 bg-[#101c30] py-2.5 pl-9 pr-3 text-xs text-white placeholder:text-slate-500 focus:border-blue-500 focus:outline-none"
                                />
                            </div>

                            {/* Bus list */}

                            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                                {filteredBuses.length === 0 ? (
                                    <div className="flex h-full items-center justify-center px-5 text-center">
                                        <div>
                                            <p className="text-sm font-medium text-white">
                                                No active buses right now
                                            </p>

                                            <p className="mt-2 text-xs leading-5 text-slate-500">
                                                Buses appear after a Driver
                                                starts a trip.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    filteredBuses.map((bus) => {
                                        const selected =
                                            selectedBusNumber ===
                                            bus.bus_number;

                                        return (
                                            <button
                                                type="button"
                                                key={bus.bus_number}
                                                onClick={() =>
                                                    toggleSelectedBus(
                                                        bus.bus_number,
                                                    )
                                                }
                                                className={`block w-full rounded-xl border p-3 text-left transition ${
                                                    selected
                                                        ? "border-violet-400 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg"
                                                        : "border-slate-700 bg-[#101c30] hover:border-blue-500/60"
                                                }`}
                                            >
                                                <div className="mb-1 flex items-center justify-between">
                                                    <span
                                                        className={`text-sm font-semibold ${
                                                            selected
                                                                ? "text-white"
                                                                : "text-slate-100"
                                                        }`}
                                                    >
                                                        {bus.bus_number}
                                                    </span>

                                                    {bus.status !== "LIVE" && (
                                                        <AlertTriangle
                                                            size={14}
                                                            className={
                                                                selected
                                                                    ? "text-amber-200"
                                                                    : "text-amber-400"
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <span
                                                    className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                        selected
                                                            ? "bg-white/15 text-white"
                                                            : STATUS_PILL[
                                                                  bus.status
                                                              ]
                                                    }`}
                                                >
                                                    {STATUS_LABEL[bus.status]}
                                                </span>

                                                <p
                                                    className={`mt-2 text-[11px] ${
                                                        selected
                                                            ? "text-white/85"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    Driver:{" "}
                                                    {bus.driver_name.toUpperCase()}
                                                </p>

                                                <p
                                                    className={`mt-1 line-clamp-2 text-[11px] ${
                                                        selected
                                                            ? "text-white/70"
                                                            : "text-slate-500"
                                                    }`}
                                                >
                                                    Route: {bus.route}
                                                </p>

                                                <div className="mt-3 flex items-center justify-between">
                                                    <span
                                                        className={`flex items-center gap-1 text-[10px] ${
                                                            selected
                                                                ? "text-white/75"
                                                                : "text-slate-500"
                                                        }`}
                                                    >
                                                        <Clock size={11} />

                                                        {formatRelativeTime(
                                                            bus.last_update,
                                                        )}
                                                    </span>

                                                    <span
                                                        className={`rounded-lg p-1.5 ${
                                                            selected
                                                                ? "bg-white/15 text-white"
                                                                : "bg-[#081120] text-slate-500"
                                                        }`}
                                                    >
                                                        <History size={13} />
                                                    </span>
                                                </div>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </aside>

                        {/* ================================
                            LIVE MAP
                        ================================= */}

                        <main className="relative h-[65vh] min-h-[460px] min-w-0 w-full overflow-hidden rounded-2xl sm:min-h-[520px] lg:h-auto lg:min-h-0 lg:flex-1">
                            {/*
                                ORIGINAL MapPanel.
                                No changes required.
                            */}

                            <MapPanel
                                height="100%"
                                routes={selectedRoutes}
                                vehicles={filteredBuses}
                                selectedVehicle={selectedBus}
                                onMarkerClick={(bus) =>
                                    toggleSelectedBus(bus.bus_number)
                                }
                                fitToRoutes={selectedRoutes.length > 0}
                                autoFollow={false}
                                showRoutes={selectedRoutes.length > 0}
                            />

                            {/* ============================
                                SELECTED BUS PANEL
                            ============================= */}

                            {selectedBus && (
                                <div className="absolute left-2 right-2 top-2 z-[600] max-h-[calc(100%-4rem)] overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-xl sm:left-auto sm:right-4 sm:top-4 sm:w-80">
                                    {/* Header */}

                                    <div className="flex items-center justify-between bg-[#081120] px-4 py-3">
                                        <div>
                                            <p className="text-[10px] uppercase tracking-wider text-blue-400">
                                                Selected Bus
                                            </p>

                                            <h3 className="text-base font-semibold text-white">
                                                {selectedBus.bus_number}
                                            </h3>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setSelectedBusNumber(null)
                                            }
                                            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-[#101c30] hover:text-white"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>

                                    {/* Details */}

                                    <div className="space-y-4 p-4">
                                        {/* Status */}

                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">
                                                Status
                                            </span>

                                            <span
                                                className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                    selectedBus.status ===
                                                    "LIVE"
                                                        ? "bg-emerald-50 text-emerald-600"
                                                        : selectedBus.status ===
                                                            "STALE"
                                                          ? "bg-amber-50 text-amber-600"
                                                          : "bg-slate-100 text-slate-500"
                                                }`}
                                            >
                                                {
                                                    STATUS_LABEL[
                                                        selectedBus.status
                                                    ]
                                                }
                                            </span>
                                        </div>

                                        {/* Bus */}

                                        <div className="flex items-start gap-3">
                                            <Bus
                                                size={16}
                                                className="mt-0.5 shrink-0 text-blue-600"
                                            />

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Bus
                                                </p>

                                                <p className="text-sm font-medium text-slate-900">
                                                    {selectedBus.bus_number}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Driver */}

                                        <div className="flex items-start gap-3">
                                            <UserRound
                                                size={16}
                                                className="mt-0.5 shrink-0 text-blue-600"
                                            />

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Driver
                                                </p>

                                                <p className="text-sm font-medium text-slate-900">
                                                    {selectedBus.driver_name}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Route */}

                                        <div className="flex items-start gap-3">
                                            <RouteIcon
                                                size={16}
                                                className="mt-0.5 shrink-0 text-blue-600"
                                            />

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Route
                                                </p>

                                                <p className="text-sm font-medium text-slate-900">
                                                    {selectedBus.route}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Location */}

                                        <div className="flex items-start gap-3">
                                            <MapPin
                                                size={16}
                                                className="mt-0.5 shrink-0 text-red-500"
                                            />

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Current GPS
                                                </p>

                                                <p className="text-sm font-medium text-slate-900">
                                                    {selectedBus.latitude.toFixed(
                                                        6,
                                                    )}
                                                    ,{" "}
                                                    {selectedBus.longitude.toFixed(
                                                        6,
                                                    )}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Last update */}

                                        <div className="flex items-start gap-3">
                                            <Clock
                                                size={16}
                                                className="mt-0.5 shrink-0 text-blue-600"
                                            />

                                            <div>
                                                <p className="text-xs text-slate-500">
                                                    Last Update
                                                </p>

                                                <p className="text-sm font-medium text-slate-900">
                                                    {formatRelativeTime(
                                                        selectedBus.last_update,
                                                    )}
                                                </p>

                                                {selectedBus.last_update && (
                                                    <p className="mt-0.5 text-[11px] text-slate-500">
                                                        {new Date(
                                                            selectedBus.last_update,
                                                        ).toLocaleString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Connection Indicator */}

                            <div className="pointer-events-none absolute bottom-3 left-3 max-w-[calc(100%-1.5rem)] rounded-lg bg-[#081120]/90 px-3 py-2 text-[10px] text-slate-300 shadow-lg backdrop-blur sm:bottom-4 sm:left-4 sm:text-[11px]">
                                {connected
                                    ? "Live updates through Reverb"
                                    : "Polling every 15 seconds"}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </CommuterLayout>
    );
}
