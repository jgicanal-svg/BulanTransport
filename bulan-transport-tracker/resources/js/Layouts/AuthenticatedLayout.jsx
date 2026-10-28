import { useState } from 'react';
import AppSidebar from './AppSidebar';
import AppHeader from './AppHeader';
import ToastProvider from '@/Components/UI/ToastProvider';

export default function AuthenticatedLayout({ title, children }) {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <ToastProvider>
            <div className="flex min-h-screen bg-app-bg">
                <AppSidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
                <div className="flex min-h-screen flex-1 flex-col">
                    <AppHeader onMenuClick={() => setMobileOpen(true)} />
                    <main className="flex-1 p-4 sm:p-6">{children}</main>
                </div>
            </div>
        </ToastProvider>
    );
}
