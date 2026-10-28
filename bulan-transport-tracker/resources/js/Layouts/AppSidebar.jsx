import { Link, usePage, router } from "@inertiajs/react";
import {
    LayoutDashboard,
    Bus as BusIcon,
    Route as RouteIcon,
    Users,
    MapPin,
    FileBarChart,
    LogOut,
    X,
    ClipboardList,
    History,
} from "lucide-react";

import { useState } from "react";
import ConfirmModal from "@/Components/UI/ConfirmModal";

const NAV = [
    {
        label: "Dashboard",
        href: "/admin/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Vehicle Management",
        href: "/admin/buses",
        icon: BusIcon,
    },
    {
        label: "Driver Management",
        href: "/admin/drivers",
        icon: Users,
    },
    {
        label: "Route Management",
        href: "/admin/routes",
        icon: RouteIcon,
    },
    {
        label: "Assignments",
        href: "/admin/assignments",
        icon: ClipboardList,
    },
    {
        label: "Live Monitoring",
        href: "/admin/live-tracking",
        icon: MapPin,
    },
    {
        label: "Trips",
        href: "/admin/trips",
        icon: ClipboardList,
    },
    {
        label: "Tracking History",
        href: "/admin/tracking-history",
        icon: History,
    },
    {
        label: "Reports",
        href: "/admin/reports",
        icon: FileBarChart,
    },
];

function SidebarContent({ onClose }) {
    const { url } = usePage();
    const [confirmLogout, setConfirmLogout] = useState(false);

    return (
        <div className="flex h-full flex-col bg-terminal-bg px-3 py-5 text-terminal-text">
            {/* Brand */}
            <div className="mb-8 flex items-center justify-between px-2">
                <Link
                    href="/admin/dashboard"
                    className="flex items-center gap-2"
                >
                    <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-control bg-terminal-bg">
                        <img
                            src="/images/logo.jfif"
                            alt="Bulan Transco"
                            className="h-full w-full object-cover"
                        />
                    </span>

                    <span>
                        <span className="block text-sm font-semibold leading-none">
                            Bulan
                            <span className="text-terminal-accent">
                                Transco.
                            </span>
                        </span>

                        <span className="mt-1 block text-[10px] uppercase tracking-wide text-terminal-muted">
                            Digital Fleet Intelligence
                        </span>
                    </span>
                </Link>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-terminal-muted hover:text-terminal-text lg:hidden"
                        aria-label="Close menu"
                    >
                        <X size={18} />
                    </button>
                )}
            </div>

            {/* Navigation Label */}
            <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-terminal-muted">
                Navigation Menu
            </p>

            {/* Navigation */}
            <nav className="flex flex-1 flex-col gap-1">
                {NAV.map((item) => {
                    const active = url.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 rounded-control px-3 py-2.5 text-sm transition ${
                                active
                                    ? "bg-terminal-accent font-medium text-white shadow-floating"
                                    : "text-terminal-muted hover:bg-terminal-surface hover:text-terminal-text"
                            }`}
                        >
                            <Icon size={17} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            {/* Account Section */}
            <div className="mt-4 border-t border-terminal-border pt-4">
                <p className="mb-2 px-3 text-[10px] font-semibold uppercase tracking-wider text-terminal-muted">
                    Account
                </p>

                <button
                    type="button"
                    onClick={() => setConfirmLogout(true)}
                    className="flex w-full items-center gap-3 rounded-control px-3 py-2.5 text-left text-sm text-app-danger transition hover:bg-terminal-surface"
                >
                    <LogOut size={17} />
                    Logout Session
                </button>

                {/* System Status */}
                <div className="mt-4 flex items-center gap-2 rounded-control border border-terminal-border bg-terminal-surface px-3 py-2.5">
                    <span className="h-2 w-2 shrink-0 rounded-full bg-app-success" />

                    <div className="text-[11px] leading-tight">
                        <p className="font-semibold text-terminal-text">
                            System Online
                        </p>

                        <p className="text-terminal-muted">
                            Bulan Transco Cluster
                        </p>
                    </div>
                </div>
            </div>

            {/* Logout Confirmation */}
            <ConfirmModal
                show={confirmLogout}
                onClose={() => setConfirmLogout(false)}
                onConfirm={() => router.post("/logout")}
                title="Confirm Logout"
                message="Are you sure you want to end this terminal session?"
                confirmLabel="Logout"
                variant="danger"
            />
        </div>
    );
}

export default function AppSidebar({ mobileOpen, onClose }) {
    return (
        <>
            {/* Desktop Sidebar */}
            <aside className="hidden w-64 shrink-0 lg:block">
                <SidebarContent />
            </aside>

            {/* Mobile Sidebar */}
            {mobileOpen && (
                <div className="fixed inset-0 z-50 lg:hidden">
                    <div
                        className="absolute inset-0 bg-black/40"
                        onClick={onClose}
                    />

                    <aside className="absolute left-0 top-0 h-full w-64 shadow-floating">
                        <SidebarContent onClose={onClose} />
                    </aside>
                </div>
            )}
        </>
    );
}
