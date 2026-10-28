import { Head, Link } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHero from "@/Components/UI/PageHero";
import StatCard from "@/Components/UI/StatCard";
import EmptyState from "@/Components/UI/EmptyState";
import {
    Bus,
    Route as RouteIcon,
    Users,
    Activity,
    AlertTriangle,
    Radio,
    TrendingUp,
    MapPin,
} from "lucide-react";
import { formatRelativeTime } from "@/Utils/tracking";

export default function Index({
    metrics = {},
    recentActivity = [],
    gpsActivity = [],
}) {
    const maximumGpsCount = Math.max(
        ...gpsActivity.map((item) => Number(item.count)),
        1,
    );

    const totalGpsUpdates = gpsActivity.reduce(
        (total, item) => total + Number(item.count),
        0,
    );

    return (
        <AuthenticatedLayout>
            <Head title="Dashboard" />

            <PageHero
                eyebrow="Fleet Intelligence: Verified"
                title="Command Center"
                description="Real-time overview of the Bulan Transport Cooperative fleet - live trips, GPS activity, and operational alerts."
            />

            <div className="mb-3 flex items-center justify-between">
                <div>
                    <h2 className="text-sm font-semibold text-app-text">Fleet Summary</h2>
                    <p className="text-xs text-app-muted">Current fleet and operational status at a glance.</p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 lg:grid-cols-7">
                <StatCard
                    label="Total Fleet"
                    value={metrics.total_buses ?? 0}
                    icon={Bus}
                    accent="primary"
                />

                <StatCard
                    label="Active Buses"
                    value={metrics.active_buses ?? 0}
                    icon={Bus}
                    accent="primary"
                />

                <StatCard
                    label="Live Trips"
                    value={metrics.live_trips ?? 0}
                    icon={Activity}
                    accent="accent"
                />

                <StatCard
                    label="Stale/Inactive"
                    value={metrics.stale_inactive_buses ?? 0}
                    icon={AlertTriangle}
                    accent="warn"
                />

                <StatCard
                    label="Active Drivers"
                    value={metrics.active_drivers ?? 0}
                    icon={Users}
                    accent="primary"
                />

                <StatCard
                    label="Routes"
                    value={metrics.routes ?? 0}
                    icon={RouteIcon}
                    accent="accent"
                />

                <StatCard
                    label="GPS Updates Today"
                    value={metrics.gps_updates_today ?? 0}
                    icon={Radio}
                    accent="primary"
                />
            </div>

            <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
                <section className="self-start rounded-card border border-app-border bg-app-surface p-5 xl:col-span-2">
                    <div className="mb-6 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                            <span className="flex h-10 w-10 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                                <TrendingUp size={19} />
                            </span>

                            <div>
                                <h2 className="text-sm font-semibold text-app-text">
                                    GPS Activity
                                </h2>

                                <p className="text-xs text-app-muted">
                                    Location updates during the last seven days
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-2xl font-bold text-app-text">
                                {totalGpsUpdates.toLocaleString()}
                            </p>

                            <p className="text-[10px] font-semibold uppercase tracking-wide text-app-muted">
                                Total updates
                            </p>
                        </div>
                    </div>

                    <div className="flex h-64 items-end gap-2 border-b border-app-border px-1 sm:gap-4">
                        {gpsActivity.map((item) => {
                            const count = Number(item.count);

                            const height =
                                count === 0
                                    ? 3
                                    : Math.max(
                                          (count / maximumGpsCount) * 100,
                                          8,
                                      );

                            return (
                                <div
                                    key={item.date}
                                    className="group flex h-full flex-1 flex-col items-center justify-end"
                                >
                                    <span className="mb-2 text-xs font-semibold text-app-text opacity-0 transition group-hover:opacity-100">
                                        {count.toLocaleString()}
                                    </span>

                                    <div
                                        className="w-full max-w-14 rounded-t-lg bg-gradient-to-t from-app-primary to-app-accent transition hover:opacity-80"
                                        style={{ height: `${height}%` }}
                                        title={`${item.label}: ${count} GPS updates`}
                                    />
                                </div>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex gap-2 sm:gap-4">
                        {gpsActivity.map((item) => (
                            <div
                                key={item.date}
                                className="flex-1 text-center text-[10px] text-app-muted sm:text-xs"
                            >
                                {item.label}
                            </div>
                        ))}
                    </div>

                    <div className="mt-5 flex items-center justify-between rounded-control bg-app-bg px-4 py-3">
                        <div>
                            <p className="text-xs font-semibold text-app-text">
                                Live fleet telemetry
                            </p>

                            <p className="text-[11px] text-app-muted">
                                View individual buses and their current
                                locations.
                            </p>
                        </div>

                        <Link
                            href="/admin/live-tracking"
                            className="flex items-center gap-1.5 text-xs font-semibold text-app-primary hover:underline"
                        >
                            <MapPin size={14} />
                            Open Monitoring
                        </Link>
                    </div>
                </section>

                <section className="rounded-card border border-app-border bg-app-surface p-5">
                    <div className="mb-4 flex items-center justify-between">
                        <div>
                            <h2 className="text-sm font-semibold text-app-text">
                                Recent Tracking Activity
                            </h2>

                            <p className="mt-1 text-xs text-app-muted">
                                Latest fleet GPS updates
                            </p>
                        </div>

                        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-app-success/10 text-app-success">
                            <Radio size={17} />
                        </span>
                    </div>

                    {recentActivity.length === 0 ? (
                        <EmptyState title="No recent GPS activity" />
                    ) : (
                        <ul className="flex flex-col divide-y divide-app-border">
                            {recentActivity.map((point) => (
                                <li
                                    key={point.id}
                                    className="flex items-center gap-3 py-3 first:pt-0 last:pb-0"
                                >
                                    <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                                        <Bus size={15} />

                                        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-app-surface bg-app-success" />
                                    </span>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-xs font-semibold text-app-text">
                                            {point.bus?.bus_number ??
                                                "Unknown bus"}
                                        </p>

                                        <p className="truncate text-[11px] text-app-muted">
                                            {point.driver?.user?.full_name ??
                                                "Unknown driver"}
                                        </p>
                                    </div>

                                    <span className="shrink-0 text-[10px] text-app-muted">
                                        {formatRelativeTime(point.received_at)}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>
            </div>
        </AuthenticatedLayout>
    );
}
