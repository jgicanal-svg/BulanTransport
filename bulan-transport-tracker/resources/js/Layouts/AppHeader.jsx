import { Menu } from 'lucide-react';

// Slim mobile-only bar; branding and account/logout now live in the
// terminal sidebar per the approved reference design.
export default function AppHeader({ onMenuClick }) {
    return (
        <header className="sticky top-0 z-30 flex h-14 items-center border-b border-app-border bg-app-surface px-4 lg:hidden">
            <button onClick={onMenuClick} className="text-app-muted hover:text-app-text" aria-label="Open menu">
                <Menu size={20} />
            </button>
            <span className="ml-3 text-sm font-semibold text-app-text">Bulan<span className="text-app-primary">Transco.</span></span>
        </header>
    );
}
