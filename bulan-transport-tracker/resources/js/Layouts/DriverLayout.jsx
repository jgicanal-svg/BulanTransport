import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import { LogOut, Truck } from 'lucide-react';
import ToastProvider from '@/Components/UI/ToastProvider';
import ConfirmModal from '@/Components/UI/ConfirmModal';

export default function DriverLayout({ title, children }) {
    const { auth } = usePage().props;
    const [confirmLogout, setConfirmLogout] = useState(false);

    return (
        <ToastProvider>
            <div className="min-h-screen bg-app-bg">
                <header className="sticky top-0 z-30 flex items-center justify-between border-b border-terminal-border bg-terminal-bg px-4 py-3 text-white">
                    <div className="min-w-0 flex items-center gap-2.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-control bg-terminal-accent/20 text-terminal-accent">
                            <Truck size={16} />
                        </span>
                        <div className="min-w-0">
                            <p className="truncate text-[10px] text-terminal-muted">
                                Bulan<span className="text-terminal-accent">Transco.</span>
                                <span className="hidden sm:inline"> · Driver Terminal</span>
                            </p>
                            <h1 className="truncate text-sm font-semibold">{title}</h1>
                        </div>
                    </div>
                    <button onClick={() => setConfirmLogout(true)} aria-label="Logout" className="rounded-control p-2 text-terminal-muted hover:bg-terminal-surface hover:text-white">
                        <LogOut size={18} />
                    </button>
                </header>
                <main className="mx-auto w-full max-w-md px-3 py-4 sm:px-4">{children}</main>

                <ConfirmModal
                    show={confirmLogout}
                    onClose={() => setConfirmLogout(false)}
                    onConfirm={() => router.post('/logout')}
                    title="Confirm Logout"
                    message="Are you sure you want to log out? Any active tracking will stop."
                    confirmLabel="Logout"
                    variant="danger"
                />
            </div>
        </ToastProvider>
    );
}
