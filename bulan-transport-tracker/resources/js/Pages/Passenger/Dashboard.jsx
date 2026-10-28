import { Head, Link } from "@inertiajs/react";
import PassengerLayout from "@/Layouts/PassengerLayout";
import { Activity, Bell, Bus, Clock, Map, Send, Wifi } from "lucide-react";
import { formatRelativeTime } from "@/Utils/tracking";

function DashboardCard({
    href,
    icon: Icon,
    title,
    description,
    accent = "primary",
}) {
    const accents = {
        primary: "bg-app-primary/10 text-app-primary",
        success: "bg-app-success/10 text-app-success",
        warn: "bg-app-warn/10 text-app-warn",
        accent: "bg-app-accent/10 text-app-accent",
    };

    return (
        <Link
            href={href}
            className="group flex min-h-48 flex-col justify-between rounded-card border border-app-border bg-app-surface p-6 shadow-sm transition hover:-translate-y-1 hover:border-app-primary/40 hover:shadow-floating"
        >
            <span
                className={`flex h-12 w-12 items-center justify-center rounded-control ${accents[accent]}`}
            >
                <Icon size={21} />
            </span>

            <div>
                <h2 className="text-lg font-bold text-app-text transition group-hover:text-app-primary">
                    {title}
                </h2>

                <p className="mt-1 text-sm text-app-muted">{description}</p>
            </div>
        </Link>
    );
}

export default function Dashboard({
    metrics = {},
    nearbyBuses = [],
    passenger = {},
}) {
    const passengerName = passenger.name ?? "Passenger";
    const firstName = passengerName.split(" ")[0];

    return (
        <PassengerLayout>
            <Head title="Passenger Dashboard" />

            <section className="mb-8">
                <p className="text-sm font-medium text-app-primary">
                    Welcome, {firstName}
                </p>

                <h1 className="mt-1 text-4xl font-extrabold text-app-text">
                    Safe Travels!
                </h1>

                <p className="mt-2 text-app-muted">
                    Where are we heading today?
                </p>
            </section>

            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <Link
                    href="/passenger/live-trip"
                    className="group flex min-h-48 flex-col justify-between rounded-card bg-terminal-bg p-6 text-white shadow-floating transition hover:-translate-y-1"
                >
                    <span className="flex h-12 w-12 items-center justify-center rounded-control bg-white/10 text-terminal-accent">
                        <Map size={22} />
                    </span>

                    <div className="flex items-end justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Live Map</h2>

                            <p className="mt-1 text-xs font-semibold uppercase tracking-wider text-terminal-muted">
                                Real-time GPS tracking
                            </p>
                        </div>

                        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-app-primary transition group-hover:scale-110">
                            <Send size={17} />
                        </span>
                    </div>
                </Link>

                <DashboardCard
                    href="/passenger/live-trip"
                    icon={Bus}
                    title="Active Buses"
                    description={`${metrics.active_buses ?? 0} buses currently available`}
                    accent="success"
                />

                <DashboardCard
                    href="/passenger/live-trip"
                    icon={Activity}
                    title="Live Trips"
                    description={`${metrics.live_trips ?? 0} trips currently in progress`}
                    accent="warn"
                />

                <DashboardCard
                    href="/passenger/live-trip"
                    icon={Wifi}
                    title="Network Status"
                    description={
                        metrics.network_online === false
                            ? "Telemetry service unavailable"
                            : "Fleet telemetry is online"
                    }
                    accent="accent"
                />
            </section>

            <section className="mt-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-app-text">
                                Nearby Buses
                            </h2>

                            <p className="text-xs text-app-muted">
                                Recently active buses and current routes
                            </p>
                        </div>

                        <Link
                            href="/passenger/live-trip"
                            className="text-xs font-semibold text-app-primary hover:underline"
                        >
                            View live map
                        </Link>
                    </div>

                    {nearbyBuses.length === 0 ? (
                        <div className="rounded-card border border-app-border bg-app-surface p-8 text-center">
                            <Bus size={28} className="mx-auto text-app-muted" />

                            <p className="mt-3 text-sm font-semibold text-app-text">
                                No active buses right now
                            </p>

                            <p className="mt-1 text-xs text-app-muted">
                                Buses appear after a driver starts a trip.
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {nearbyBuses.map((bus, index) => (
                                <Link
                                    key={bus.bus_id ?? bus.bus_number ?? index}
                                    href="/passenger/live-trip"
                                    className="group flex items-center gap-4 rounded-card border border-app-border bg-app-surface p-4 transition hover:border-app-primary/40 hover:shadow-sm"
                                >
                                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                                        <Bus size={19} />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold text-app-text group-hover:text-app-primary">
                                            {bus.bus_number ?? "Unknown bus"}
                                        </p>

                                        <p className="truncate text-xs text-app-muted">
                                            {bus.route ?? "No assigned route"}
                                        </p>

                                        <p className="mt-1 text-[11px] text-app-muted">
                                            Driver:{" "}
                                            {bus.driver_name ??
                                                "Driver unavailable"}
                                        </p>
                                    </div>

                                    <div className="shrink-0 text-right">
                                        <span className="inline-flex rounded-full bg-app-success/10 px-2 py-1 text-[10px] font-semibold text-app-success">
                                            ACTIVE
                                        </span>

                                        <p className="mt-2 flex items-center justify-end gap-1 text-[10px] text-app-muted">
                                            <Clock size={11} />

                                            {formatRelativeTime(
                                                bus.recorded_at ??
                                                    bus.last_update,
                                            )}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                <aside>
                    <h2 className="mb-4 text-lg font-bold text-app-text">
                        Operational Status
                    </h2>

                    <div className="rounded-card border border-app-warn/30 bg-app-warn/10 p-5">
                        <div className="flex items-start gap-3">
                            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-app-warn/15 text-app-warn">
                                <Bell size={16} />
                            </span>

                            <div>
                                <p className="text-sm font-semibold text-app-text">
                                    Check live bus status
                                </p>

                                <p className="mt-1 text-xs leading-5 text-app-muted">
                                    Bus locations and availability depend on
                                    active driver tracking.
                                </p>
                            </div>
                        </div>

                        <Link
                            href="/passenger/live-trip"
                            className="mt-5 block rounded-control bg-app-primary px-4 py-2.5 text-center text-xs font-semibold text-white hover:bg-app-primary/90"
                        >
                            Open Live Tracking
                        </Link>
                    </div>
                </aside>
            </section>
        </PassengerLayout>
    );
}
