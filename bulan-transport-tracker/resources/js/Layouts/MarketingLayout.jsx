import { Link } from "@inertiajs/react";
import { Truck, LogIn } from "lucide-react";
import ToastProvider from "@/Components/UI/ToastProvider";

// Public, no-auth marketing shell used only by the Home landing page.
// Distinct from CommuterLayout (used by the live-tracking page) because the
// marketing page needs a full nav + "Terminal Login" CTA, per the approved
// reference design.
export default function MarketingLayout({ children }) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-app-bg">
                <header className="sticky top-0 z-30 flex items-center justify-between border-b border-app-border bg-app-surface/90 px-6 py-3 backdrop-blur">
                    <Link href="/" className="flex items-center gap-2.5">
                        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-terminal-bg text-terminal-accent">
                            <img
                                src="/images/logo.jfif"
                                alt="Bulan Transco"
                                className="h-full w-full rounded-control object-cover"
                            />
                        </span>
                        <span>
                            <span className="block text-sm font-semibold leading-none text-app-text">
                                Bulan
                                <span className="text-app-primary">
                                    Transco.
                                </span>
                            </span>
                            <span className="mt-1 block text-[10px] uppercase tracking-wide text-app-muted">
                                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-app-success align-middle" />
                                Digital Fleet Intelligence
                            </span>
                        </span>
                    </Link>

                    <nav className="hidden items-center gap-8 text-xs font-semibold uppercase tracking-wide text-app-muted sm:flex">
                        <a href="#home" className="hover:text-app-text">
                            Home
                        </a>
                        <a href="#about" className="hover:text-app-text">
                            About
                        </a>
                        <a href="#contact" className="hover:text-app-text">
                            Contact
                        </a>
                    </nav>

                    <Link
                        href="/login"
                        className="flex items-center gap-2 rounded-control bg-terminal-bg px-4 py-2 text-xs font-semibold text-white hover:bg-terminal-surface"
                    >
                        <LogIn size={14} /> Terminal Login
                    </Link>
                </header>

                <main>{children}</main>

                <footer className="border-t border-app-border bg-app-surface px-6 py-6 text-center text-xs text-app-muted">
                    &copy; {new Date().getFullYear()} Bulan Transport
                    Cooperative. All rights reserved.
                </footer>
            </div>
        </ToastProvider>
    );
}
