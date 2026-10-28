import { Link } from '@inertiajs/react';
import { Truck } from 'lucide-react';
import ToastProvider from '@/Components/UI/ToastProvider';

// Public, no-auth layout for the commuter live-tracking page (distinct from
// MarketingLayout, which is used only by the Home landing page).
export default function CommuterLayout({ title, children }) {
    return (
        <ToastProvider>
            <div className="min-h-screen bg-app-bg">
                <header className="flex items-center justify-between border-b border-app-border bg-terminal-bg px-4 py-3 text-white">
                    <Link href="/" className="flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-control bg-terminal-accent/20 text-terminal-accent">
                            <Truck size={16} />
                        </span>
                        <div>
                            <p className="text-[10px] text-white/50">Bulan Transport Cooperative</p>
                            <h1 className="text-sm font-semibold">{title}</h1>
                        </div>
                    </Link>
                </header>
                <main className="mx-auto max-w-xl p-4">{children}</main>
            </div>
        </ToastProvider>
    );
}
