import { useEffect, useRef, useState } from "react";
import { Head } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import MapPanel from "@/Components/Map/MapPanel";

import {
    Search,
    Activity,
    AlertTriangle,
    Clock,
    History,
    X,
    MapPin,
    Bus,
    UserRound,
    Route as RouteIcon,
} from "lucide-react";

import { formatRelativeTime, deriveStatus } from "@/Utils/tracking";

const STATUS_PILL = {
    LIVE: "bg-app-success/10 text-app-success",
    STALE: "bg-app-warn/10 text-app-warn",
    INACTIVE: "bg-app-muted/10 text-app-muted",
};

const STATUS_LABEL = {
    LIVE: "MOVING",
    STALE: "STOPPED",
    INACTIVE: "OFFLINE",
};

export default function Index({ routes }) {
    const [vehicles, setVehicles] = useState([]);

    const [thresholds, setThresholds] = useState({
        live_seconds: 60,
        stale_seconds: 180,
        inactive_seconds: 600,
    });

    const [search, setSearch] = useState("");

    const [connected, setConnected] = useState(false);

    const [selectedBusId, setSelectedBusId] = useState(null);

    /*
    |--------------------------------------------------------------------------
    | CHECKPOINT NOTIFICATION
    |--------------------------------------------------------------------------
    */

    const [checkpointNotification, setCheckpointNotification] = useState(null);

    const checkpointTimerRef = useRef(null);

    const pollRef = useRef(null);

    /*
    |--------------------------------------------------------------------------
    | LOAD LATEST LOCATIONS
    |--------------------------------------------------------------------------
    */

    const fetchLatest = async () => {
        try {
            const response = await fetch(
                "/admin/api/live-tracking/latest-locations",
                {
                    headers: {
                        Accept: "application/json",
                    },
                },
            );

            if (!response.ok) {
                throw new Error("Unable to retrieve live locations.");
            }

            const data = await response.json();

            setThresholds(data.thresholds);

            setVehicles(
                data.locations.map((location) => ({
                    bus_id: location.bus_id,

                    bus_number: location.bus?.bus_number ?? "Unknown Bus",

                    plate_number: location.bus?.plate_number ?? "N/A",

                    device_code: location.bus?.device_code ?? "N/A",

                    driver_name: location.driver?.user
                        ? `${location.driver.user.first_name} ${location.driver.user.last_name}`
                        : null,

                    route_id: location.trip?.bus_assignment?.route?.id ?? null,

                    route:
                        location.direction_name ?? location.trip?.bus_assignment?.route?.name ??
                        "No assigned route",

                    latitude: Number(location.latitude),

                    longitude: Number(location.longitude),

                    status: deriveStatus(location.recorded_at, data.thresholds),

                    last_update: location.recorded_at,
                })),
            );
        } catch (error) {
            console.error("Live tracking polling error:", error);
        }
    };

    /*
    |--------------------------------------------------------------------------
    | REVERB + POLLING
    |--------------------------------------------------------------------------
    */

    useEffect(() => {
        fetchLatest();

        if (window.Echo) {
            const channel = window.Echo.channel("fleet-tracking");

            /*
            |--------------------------------------------------------------------------
            | Normal GPS Update
            |--------------------------------------------------------------------------
            */

            channel.listen(".VehicleLocationUpdated", () => {
                setConnected(true);

                fetchLatest();
            });

            /*
            |--------------------------------------------------------------------------
            | MUNICIPALITY / CHECKPOINT EVENT
            |--------------------------------------------------------------------------
            */

            channel.listen(".BusCheckpointReached", (event) => {
                setConnected(true);

                /*
                 * Replace an existing checkpoint
                 * notification if another arrives.
                 */
                if (checkpointTimerRef.current) {
                    window.clearTimeout(checkpointTimerRef.current);
                }

                setCheckpointNotification(event);

                /*
                 * Auto-hide after 8 seconds.
                 */
                checkpointTimerRef.current = window.setTimeout(() => {
                    setCheckpointNotification(null);
                }, 8000);
            });
        }

        /*
        |--------------------------------------------------------------------------
        | WebSocket fallback
        |--------------------------------------------------------------------------
        */

        pollRef.current = window.setInterval(fetchLatest, 5000);

        return () => {
            if (pollRef.current) {
                window.clearInterval(pollRef.current);
            }

            if (checkpointTimerRef.current) {
                window.clearTimeout(checkpointTimerRef.current);
            }

            window.Echo?.leaveChannel("fleet-tracking");
        };
    }, []);

    /*
    |--------------------------------------------------------------------------
    | SEARCH
    |--------------------------------------------------------------------------
    */

    const filteredVehicles = vehicles.filter((vehicle) => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return true;
        }

        return (
            vehicle.bus_number?.toLowerCase().includes(query) ||
            vehicle.driver_name?.toLowerCase().includes(query) ||
            vehicle.plate_number?.toLowerCase().includes(query)
        );
    });

    /*
    |--------------------------------------------------------------------------
    | SELECTED BUS
    |--------------------------------------------------------------------------
    */

    const selectedVehicle =
        vehicles.find((vehicle) => vehicle.bus_id === selectedBusId) ?? null;

    /*
    |--------------------------------------------------------------------------
    | SELECTED ROUTE
    |--------------------------------------------------------------------------
    */

    const selectedRoutes = selectedVehicle
        ? routes.filter((route) => {
              if (
                  selectedVehicle.route_id &&
                  String(route.id) === String(selectedVehicle.route_id)
              ) {
                  return true;
              }

              return (
                  route.name?.trim().toLowerCase() ===
                  selectedVehicle.route?.trim().toLowerCase()
              );
          })
        : [];

    /*
    |--------------------------------------------------------------------------
    | MARKER / CARD CLICK
    |--------------------------------------------------------------------------
    */

    const toggleSelectedBus = (busId) => {
        setSelectedBusId((current) => (current === busId ? null : busId));
    };

    return (
        <AuthenticatedLayout>
            <Head title="Live Monitoring" />

            <div className="h-[calc(100vh-3rem)] min-h-[620px] overflow-hidden">
                <div className="flex h-full gap-4">
                    {/* =====================================================
                        LEFT FLEET PANEL
                    ===================================================== */}

                    <aside className="flex h-full w-80 shrink-0 flex-col overflow-hidden rounded-hero bg-terminal-bg p-4">
                        <div className="mb-4 flex items-center justify-between px-1">
                            <div>
                                <h2 className="text-base font-semibold text-terminal-text">
                                    Fleet Monitor
                                </h2>

                                <p className="flex items-center gap-1.5 text-[11px] text-terminal-accent">
                                    <span
                                        className={`h-1.5 w-1.5 rounded-full ${
                                            connected
                                                ? "bg-app-success"
                                                : "bg-terminal-accent"
                                        }`}
                                    />

                                    {connected
                                        ? "Live WebSocket Connected"
                                        : "Global Telemetry Live"}
                                </p>
                            </div>

                            <span className="flex h-9 w-9 items-center justify-center rounded-control bg-terminal-surface text-terminal-accent">
                                <Activity size={17} />
                            </span>
                        </div>

                        {/* Search */}

                        <div className="relative mb-3">
                            <Search
                                size={14}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-terminal-muted"
                            />

                            <input
                                value={search}
                                onChange={(event) =>
                                    setSearch(event.target.value)
                                }
                                placeholder="Intercept bus telemetry..."
                                className="w-full rounded-control border border-terminal-border bg-terminal-surface py-2.5 pl-9 pr-3 text-xs text-terminal-text placeholder:text-terminal-muted focus:border-terminal-accent focus:outline-none"
                            />
                        </div>

                        {/* Vehicle Cards */}

                        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pr-1">
                            {filteredVehicles.length === 0 ? (
                                <div className="flex h-full items-center justify-center px-4 text-center">
                                    <div>
                                        <p className="text-sm font-medium text-terminal-text">
                                            No active buses
                                        </p>

                                        <p className="mt-1 text-xs text-terminal-muted">
                                            A bus will appear after a Driver
                                            starts tracking.
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                filteredVehicles.map((vehicle) => {
                                    const selected =
                                        selectedBusId === vehicle.bus_id;

                                    return (
                                        <button
                                            type="button"
                                            key={vehicle.bus_id}
                                            onClick={() =>
                                                toggleSelectedBus(
                                                    vehicle.bus_id,
                                                )
                                            }
                                            className={`block w-full rounded-control border p-3 text-left transition ${
                                                selected
                                                    ? "border-indigo-400 bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg"
                                                    : "border-terminal-border bg-terminal-surface hover:border-terminal-accent/50"
                                            }`}
                                        >
                                            <div className="mb-1 flex items-center justify-between">
                                                <span
                                                    className={`text-sm font-semibold ${
                                                        selected
                                                            ? "text-white"
                                                            : "text-terminal-text"
                                                    }`}
                                                >
                                                    {vehicle.bus_number}
                                                </span>

                                                {vehicle.status !== "LIVE" && (
                                                    <AlertTriangle
                                                        size={14}
                                                        className={
                                                            selected
                                                                ? "text-amber-200"
                                                                : "text-app-warn"
                                                        }
                                                    />
                                                )}
                                            </div>

                                            <span
                                                className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                                                    selected
                                                        ? "bg-white/15 text-white"
                                                        : STATUS_PILL[
                                                              vehicle.status
                                                          ]
                                                }`}
                                            >
                                                {STATUS_LABEL[vehicle.status]}
                                            </span>

                                            <p
                                                className={`mt-2 text-[11px] ${
                                                    selected
                                                        ? "text-white/85"
                                                        : "text-terminal-muted"
                                                }`}
                                            >
                                                Driver:{" "}
                                                {vehicle.driver_name?.toUpperCase() ??
                                                    "UNASSIGNED"}
                                            </p>

                                            <div className="mt-3 flex items-center justify-between gap-2">
                                                <span
                                                    className={`flex items-center gap-1 text-[10px] ${
                                                        selected
                                                            ? "text-white/75"
                                                            : "text-terminal-muted"
                                                    }`}
                                                >
                                                    <Clock size={11} />

                                                    {formatRelativeTime(
                                                        vehicle.last_update,
                                                    )}
                                                </span>

                                                <span
                                                    className={`rounded-control p-1.5 ${
                                                        selected
                                                            ? "bg-white/15 text-white"
                                                            : "bg-terminal-bg text-terminal-muted"
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

                    {/* =====================================================
                        MAP
                    ===================================================== */}

                    <main className="relative min-w-0 flex-1 overflow-hidden rounded-card">
                        {/*
                            IMPORTANT:

                            This still uses your ORIGINAL MapPanel.
                            No modifications are required in MapPanel.jsx.
                        */}

                        <MapPanel
                            height="100%"
                            routes={selectedRoutes}
                            vehicles={filteredVehicles}
                            selectedVehicle={selectedVehicle}
                            onMarkerClick={(vehicle) =>
                                toggleSelectedBus(vehicle.bus_id)
                            }
                            fitToRoutes={selectedRoutes.length > 0}
                            autoFollow={false}
                            showRoutes={selectedRoutes.length > 0}
                        />

                        {/* =================================================
                            CHECKPOINT NOTIFICATION
                        ================================================= */}

                        {checkpointNotification && (
                            <div className="absolute right-4 top-4 z-[700] w-80 overflow-hidden rounded-card border border-app-success/30 bg-app-surface shadow-floating">
                                <div className="border-b border-app-success/20 bg-app-success/10 px-4 py-3">
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex items-start gap-3">
                                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-app-success/15 text-app-success">
                                                <MapPin size={18} />
                                            </span>

                                            <div>
                                                <p className="text-[10px] font-semibold uppercase tracking-wider text-app-success">
                                                    Checkpoint Reached
                                                </p>

                                                <p className="mt-0.5 text-sm font-semibold text-app-text">
                                                    {
                                                        checkpointNotification.bus_number
                                                    }{" "}
                                                    reached{" "}
                                                    {
                                                        checkpointNotification.checkpoint
                                                    }
                                                </p>
                                            </div>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() =>
                                                setCheckpointNotification(null)
                                            }
                                            className="text-app-muted transition hover:text-app-text"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-2 px-4 py-3">
                                    <p className="text-xs text-app-muted">
                                        Driver:{" "}
                                        <span className="font-medium text-app-text">
                                            {checkpointNotification.driver_name}
                                        </span>
                                    </p>

                                    <p className="text-xs text-app-muted">
                                        Distance from checkpoint:{" "}
                                        <span className="font-medium text-app-text">
                                            {checkpointNotification.distance_km}{" "}
                                            km
                                        </span>
                                    </p>

                                    <p className="text-[11px] text-app-muted">
                                        GPS: {checkpointNotification.latitude},{" "}
                                        {checkpointNotification.longitude}
                                    </p>

                                    {checkpointNotification.recorded_at && (
                                        <p className="text-[11px] text-app-muted">
                                            {new Date(
                                                checkpointNotification.recorded_at,
                                            ).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* =================================================
                            SELECTED VEHICLE PANEL
                        ================================================= */}

                        {selectedVehicle && (
                            <div
                                className={`absolute right-4 z-[600] w-80 overflow-hidden rounded-card border border-app-border bg-app-surface shadow-floating transition-all ${
                                    checkpointNotification ? "top-56" : "top-4"
                                }`}
                            >
                                {/* Header */}

                                <div className="flex items-center justify-between border-b border-app-border bg-terminal-bg px-4 py-3">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-terminal-accent">
                                            Selected Vehicle
                                        </p>

                                        <h3 className="text-base font-semibold text-white">
                                            {selectedVehicle.bus_number}
                                        </h3>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={() => setSelectedBusId(null)}
                                        className="rounded-control p-1.5 text-terminal-muted transition hover:bg-terminal-surface hover:text-white"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>

                                {/* Details */}

                                <div className="space-y-4 p-4">
                                    {/* Status */}

                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-app-muted">
                                            Status
                                        </span>

                                        <span
                                            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                                                STATUS_PILL[
                                                    selectedVehicle.status
                                                ]
                                            }`}
                                        >
                                            {
                                                STATUS_LABEL[
                                                    selectedVehicle.status
                                                ]
                                            }
                                        </span>
                                    </div>

                                    {/* Bus */}

                                    <div className="flex items-start gap-3">
                                        <Bus
                                            size={16}
                                            className="mt-0.5 shrink-0 text-app-primary"
                                        />

                                        <div>
                                            <p className="text-xs text-app-muted">
                                                Bus
                                            </p>

                                            <p className="text-sm font-medium text-app-text">
                                                {selectedVehicle.bus_number}
                                            </p>

                                            <p className="text-[11px] text-app-muted">
                                                Plate:{" "}
                                                {selectedVehicle.plate_number}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Driver */}

                                    <div className="flex items-start gap-3">
                                        <UserRound
                                            size={16}
                                            className="mt-0.5 shrink-0 text-app-primary"
                                        />

                                        <div>
                                            <p className="text-xs text-app-muted">
                                                Driver
                                            </p>

                                            <p className="text-sm font-medium text-app-text">
                                                {selectedVehicle.driver_name ??
                                                    "Unassigned"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Route */}

                                    <div className="flex items-start gap-3">
                                        <RouteIcon
                                            size={16}
                                            className="mt-0.5 shrink-0 text-app-primary"
                                        />

                                        <div>
                                            <p className="text-xs text-app-muted">
                                                Assigned Route
                                            </p>

                                            <p className="text-sm font-medium text-app-text">
                                                {selectedVehicle.route}
                                            </p>
                                        </div>
                                    </div>

                                    {/* GPS */}

                                    <div className="flex items-start gap-3">
                                        <MapPin
                                            size={16}
                                            className="mt-0.5 shrink-0 text-app-danger"
                                        />

                                        <div>
                                            <p className="text-xs text-app-muted">
                                                Current GPS Coordinates
                                            </p>

                                            <p className="text-sm font-medium text-app-text">
                                                {selectedVehicle.latitude.toFixed(
                                                    6,
                                                )}
                                                ,{" "}
                                                {selectedVehicle.longitude.toFixed(
                                                    6,
                                                )}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Time */}

                                    <div className="flex items-start gap-3">
                                        <Clock
                                            size={16}
                                            className="mt-0.5 shrink-0 text-app-primary"
                                        />

                                        <div>
                                            <p className="text-xs text-app-muted">
                                                Last GPS Update
                                            </p>

                                            <p className="text-sm font-medium text-app-text">
                                                {formatRelativeTime(
                                                    selectedVehicle.last_update,
                                                )}
                                            </p>

                                            <p className="mt-0.5 text-[11px] text-app-muted">
                                                {selectedVehicle.last_update
                                                    ? new Date(
                                                          selectedVehicle.last_update,
                                                      ).toLocaleString()
                                                    : "N/A"}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Connection Status */}

                        <div className="pointer-events-none absolute bottom-4 left-4 rounded-control bg-terminal-bg/90 px-3 py-2 text-[11px] text-terminal-muted shadow-floating backdrop-blur">
                            {connected
                                ? "Live updates through Reverb"
                                : "Polling every 15 seconds"}
                        </div>
                    </main>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
