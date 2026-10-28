import { useEffect, useMemo, useRef, useState } from "react";
import { Head } from "@inertiajs/react";
import { Activity, AlertTriangle, Bus, Clock, Search } from "lucide-react";
import PassengerLayout from "@/Layouts/PassengerLayout";
import MapPanel from "@/Components/Map/MapPanel";
import { formatRelativeTime } from "@/Utils/tracking";

const STATUS_CLASSES = {
    LIVE: "bg-emerald-50 text-emerald-600",
    STALE: "bg-amber-50 text-amber-600",
    INACTIVE: "bg-slate-100 text-slate-500",
};

const STATUS_LABELS = {
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

export default function LiveTrip({ routes }) {
    const [buses, setBuses] = useState([]);
    const [search, setSearch] = useState("");
    const [selectedBusNumber, setSelectedBusNumber] = useState(null);
    const [connected, setConnected] = useState(false);

    const pollingRef = useRef(null);

    const fetchLocations = async () => {
        try {
            const response = await fetch("/api/commuter/latest-locations", {
                headers: {
                    Accept: "application/json",
                },
            });

            if (!response.ok) {
                throw new Error("Unable to load live trips.");
            }

            const data = await response.json();

            setBuses(
                (data.locations ?? []).map((location) => ({
                    ...location,
                    bus_id: location.bus_id ?? location.bus_number,
                    bus_number: location.bus_number ?? "Unknown Bus",
                    driver_name: location.driver_name ?? "Driver unavailable",
                    route: location.route ?? "Route unavailable",
                    latitude: Number(location.latitude),
                    longitude: Number(location.longitude),
                    status: normalizeStatus(location.status),
                    last_update: location.last_update ?? location.recorded_at,
                })),
            );
        } catch (error) {
            // The next polling interval retries automatically.
        }
    };

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

        pollingRef.current = window.setInterval(fetchLocations, 15000);

        return () => {
            if (pollingRef.current) {
                window.clearInterval(pollingRef.current);
            }

            window.Echo?.leaveChannel("fleet-tracking");
        };
    }, []);

    const filteredBuses = useMemo(() => {
        const query = search.trim().toLowerCase();

        if (!query) {
            return buses;
        }

        return buses.filter((bus) => {
            return (
                bus.bus_number?.toLowerCase().includes(query) ||
                bus.route?.toLowerCase().includes(query) ||
                bus.driver_name?.toLowerCase().includes(query)
            );
        });
    }, [buses, search]);

    const selectedBus =
        buses.find((bus) => bus.bus_number === selectedBusNumber) ?? null;

    const selectedRoutes = selectedBus
        ? routes.filter((route) => {
              return (
                  route.name?.trim().toLowerCase() ===
                  selectedBus.route?.trim().toLowerCase()
              );
          })
        : [];

    const selectBus = (busNumber) => {
        setSelectedBusNumber((current) =>
            current === busNumber ? null : busNumber,
        );
    };

    return (
        <PassengerLayout>
            <Head title="Live Trip" />

            <div className="mx-auto max-w-[1600px]">
                <div className="mb-5">
                    <h1 className="text-3xl font-bold text-slate-950">
                        Live Trip
                    </h1>

                    <p className="mt-1 text-sm text-slate-500">
                        Select a bus to view its current route and location.
                    </p>
                </div>

                <div className="h-[calc(100vh-9rem)] min-h-[620px] overflow-hidden">
                    <div className="flex h-full flex-col gap-4 xl:flex-row">
                        <aside className="flex h-[320px] w-full shrink-0 flex-col overflow-hidden rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm xl:h-full xl:w-80">
                            <div className="mb-4 flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold text-slate-900">
                                        Active Fleet
                                    </h2>

                                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                                        {buses.length} vehicles online
                                    </p>
                                </div>

                                <span className="flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-1 text-[9px] font-semibold text-emerald-600">
                                    <Activity size={10} />

                                    {connected ? "Live" : "Syncing"}
                                </span>
                            </div>

                            <div className="relative mb-4">
                                <Search
                                    size={15}
                                    className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                />

                                <input
                                    value={search}
                                    onChange={(event) =>
                                        setSearch(event.target.value)
                                    }
                                    placeholder="Filter buses or drivers..."
                                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-xs outline-none focus:border-blue-500"
                                />
                            </div>

                            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
                                {filteredBuses.length === 0 ? (
                                    <div className="flex h-full items-center justify-center text-center">
                                        <div>
                                            <Bus
                                                size={25}
                                                className="mx-auto text-slate-300"
                                            />

                                            <p className="mt-2 text-sm font-semibold text-slate-600">
                                                No active buses
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
                                                key={bus.bus_id}
                                                onClick={() =>
                                                    selectBus(bus.bus_number)
                                                }
                                                className={`block w-full rounded-2xl border p-4 text-left transition ${
                                                    selected
                                                        ? "border-blue-500 bg-blue-600 text-white shadow-lg"
                                                        : "border-slate-200 bg-white hover:border-blue-300"
                                                }`}
                                            >
                                                <div className="flex items-center justify-between">
                                                    <p className="font-bold">
                                                        {bus.bus_number}
                                                    </p>

                                                    {bus.status !== "LIVE" && (
                                                        <AlertTriangle
                                                            size={14}
                                                            className={
                                                                selected
                                                                    ? "text-amber-200"
                                                                    : "text-amber-500"
                                                            }
                                                        />
                                                    )}
                                                </div>

                                                <span
                                                    className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-[9px] font-semibold ${
                                                        selected
                                                            ? "bg-white/15 text-white"
                                                            : STATUS_CLASSES[
                                                                  bus.status
                                                              ]
                                                    }`}
                                                >
                                                    {STATUS_LABELS[bus.status]}
                                                </span>

                                                <p
                                                    className={`mt-3 truncate text-[10px] ${
                                                        selected
                                                            ? "text-white/80"
                                                            : "text-slate-500"
                                                    }`}
                                                >
                                                    Driver: {bus.driver_name}
                                                </p>

                                                <p
                                                    className={`mt-1 truncate text-[10px] ${
                                                        selected
                                                            ? "text-white/70"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    {bus.route}
                                                </p>

                                                <p
                                                    className={`mt-3 flex items-center gap-1 text-[9px] ${
                                                        selected
                                                            ? "text-white/70"
                                                            : "text-slate-400"
                                                    }`}
                                                >
                                                    <Clock size={10} />

                                                    {formatRelativeTime(
                                                        bus.last_update,
                                                    )}
                                                </p>
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        </aside>

                        <main className="relative min-h-[400px] min-w-0 flex-1 overflow-hidden rounded-[28px] border border-slate-200 bg-white shadow-sm">
                            <MapPanel
                                height="100%"
                                routes={selectedRoutes}
                                vehicles={filteredBuses}
                                selectedVehicle={selectedBus}
                                onMarkerClick={(bus) =>
                                    selectBus(bus.bus_number)
                                }
                                fitToRoutes={selectedRoutes.length > 0}
                                autoFollow={false}
                                showRoutes={selectedRoutes.length > 0}
                            />

                            <div className="pointer-events-none absolute right-4 top-4 rounded-xl bg-white/95 px-4 py-3 text-[10px] font-semibold text-slate-600 shadow-lg backdrop-blur">
                                <div className="space-y-2">
                                    <Legend
                                        color="bg-emerald-500"
                                        label="Moving"
                                    />
                                    <Legend
                                        color="bg-amber-500"
                                        label="Stopped"
                                    />
                                    <Legend
                                        color="bg-slate-500"
                                        label="Offline"
                                    />
                                </div>
                            </div>

                            <div className="pointer-events-none absolute bottom-4 left-4 rounded-xl bg-[#050b1d]/90 px-3 py-2 text-[10px] text-white shadow-lg backdrop-blur">
                                {connected
                                    ? "Live connection active"
                                    : "Refreshing every 15 seconds"}
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </PassengerLayout>
    );
}

function Legend({ color, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${color}`} />
            <span className="uppercase tracking-wider">{label}</span>
        </div>
    );
}
