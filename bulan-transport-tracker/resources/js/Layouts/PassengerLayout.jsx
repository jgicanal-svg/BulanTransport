import { useState } from "react";
import { Link, router, usePage } from "@inertiajs/react";
import { LayoutDashboard, Map, LogOut, Menu, Truck, X } from "lucide-react";
import ToastProvider from "@/Components/UI/ToastProvider";
import ConfirmModal from "@/Components/UI/ConfirmModal";

const navigation = [
    {
        label: "Dashboard",
        href: "/passenger/dashboard",
        icon: LayoutDashboard,
    },
    {
        label: "Live Trip",
        href: "/passenger/live-trip",
        icon: Map,
    },
];

function PassengerSidebar({ onClose }) {
    const { url } = usePage();
    const [confirmLogout, setConfirmLogout] = useState(false);

    return (
        <div className="flex h-full flex-col bg-[#050b1d] px-4 py-6 text-white">
            <div className="mb-8 flex items-center justify-between">
                <Link
                    href="/passenger/dashboard"
                    className="flex items-center gap-3"
                >
                    <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-control bg-terminal-bg">
                        <img
                            src="/images/logo.jfif"
                            alt="Bulan Transco"
                            className="h-full w-full object-cover"
                        />
                    </span>    

                    <span>
                        <span className="block text-sm font-semibold">
                            Bulan
                            <span className="text-blue-400">Transco.</span>
                        </span>

                        <span className="block text-[9px] uppercase tracking-wider text-slate-500">
                            Passenger Portal
                        </span>
                    </span>
                </Link>

                {onClose && (
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-slate-500 hover:text-white lg:hidden"
                        aria-label="Close navigation"
                    >
                        <X size={19} />
                    </button>
                )}
            </div>

            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                Navigation Menu
            </p>

            <nav className="flex flex-1 flex-col gap-2">
                {navigation.map((item) => {
                    const active = url.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                                active
                                    ? "bg-blue-600 font-semibold text-white shadow-lg shadow-blue-600/20"
                                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                            }`}
                        >
                            <Icon size={18} />
                            {item.label}
                        </Link>
                    );
                })}
            </nav>

            <div className="border-t border-slate-800 pt-5">
                <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-500">
                    Account
                </p>

                <button
                    type="button"
                    onClick={() => setConfirmLogout(true)}
                    className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-medium text-red-400 hover:bg-red-500/10"
                >
                    <LogOut size={18} />
                    Logout Session
                </button>

                <div className="mt-5 rounded-xl border border-slate-800 bg-[#0d162a] px-4 py-3">
                    <div className="flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-emerald-400" />

                        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-300">
                            System Online
                        </p>
                    </div>

                    <p className="mt-2 text-[10px] leading-4 text-slate-500">
                        Bulan Transco Live Tracking
                    </p>
                </div>
            </div>

            <ConfirmModal
                show={confirmLogout}
                onClose={() => setConfirmLogout(false)}
                onConfirm={() => router.post("/logout")}
                title="Confirm Logout"
                message="Are you sure you want to log out of your passenger account?"
                confirmLabel="Logout"
                variant="danger"
            />
        </div>
    );
}

export default function PassengerLayout({ children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-[#f5f7fb]">
                <aside className="hidden w-72 shrink-0 lg:block">
                    <PassengerSidebar />
                </aside>

                {mobileOpen && (
                    <div className="fixed inset-0 z-50 lg:hidden">
                        <button
                            type="button"
                            aria-label="Close navigation overlay"
                            className="absolute inset-0 bg-black/50"
                            onClick={() => setMobileOpen(false)}
                        />

                        <aside className="absolute inset-y-0 left-0 w-72 shadow-2xl">
                            <PassengerSidebar
                                onClose={() => setMobileOpen(false)}
                            />
                        </aside>
                    </div>
                )}

                <div className="min-w-0 flex-1">
                    <header className="sticky top-0 z-30 flex h-14 items-center border-b border-slate-200 bg-white px-4 lg:hidden">
                        <button
                            type="button"
                            onClick={() => setMobileOpen(true)}
                            className="text-slate-600"
                            aria-label="Open navigation"
                        >
                            <Menu size={21} />
                        </button>

                        <span className="ml-3 text-sm font-semibold text-slate-900">
                            Bulan
                            <span className="text-blue-600">Transco.</span>
                        </span>
                    </header>

                    <main className="min-h-screen p-4 sm:p-6 lg:p-8">
                        {children}
                    </main>
                </div>
            </div>
        </ToastProvider>
    );
}
