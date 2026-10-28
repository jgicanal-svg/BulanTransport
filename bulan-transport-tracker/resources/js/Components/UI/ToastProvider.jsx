import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { usePage } from '@inertiajs/react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

const ToastContext = createContext(null);

const ICONS = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
};

const COLORS = {
    success: 'border-app-success/30 text-app-success',
    error: 'border-app-danger/30 text-app-danger',
    warning: 'border-app-warn/40 text-app-warn',
    info: 'border-app-primary/30 text-app-primary',
};

export function useToast() {
    const ctx = useContext(ToastContext);
    if (!ctx) throw new Error('useToast must be used within ToastProvider');
    return ctx;
}

// Single global provider mounted once at the root layout. Consumes Laravel
// flash("toast") once per Inertia navigation via a change-detecting effect,
// so re-renders never duplicate the same flash toast.
export default function ToastProvider({ children }) {
    const { props } = usePage();
    const [toasts, setToasts] = useState([]);
    const [lastFlashKey, setLastFlashKey] = useState(null);

    const push = useCallback((toast) => {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
        setToasts((prev) => [...prev, { id, ...toast }]);
        window.setTimeout(() => dismiss(id), 5000);
    }, []);

    const dismiss = useCallback((id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
    }, []);

    useEffect(() => {
        const flash = props.flash?.toast ?? props.toast;
        if (!flash) return;
        const key = `${flash.type}:${flash.message}:${props.ziggyTimestamp ?? Date.now()}`;
        if (key === lastFlashKey) return;
        setLastFlashKey(key);
        push(flash);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [props.flash, props.toast]);

    return (
        <ToastContext.Provider value={{ push, dismiss }}>
            {children}
            <div
                aria-live="polite"
                className="fixed z-[100] flex flex-col gap-2 bottom-4 right-4 left-4 sm:left-auto sm:w-96"
            >
                {toasts.map((toast) => {
                    const Icon = ICONS[toast.type] ?? Info;
                    return (
                        <div
                            key={toast.id}
                            role="status"
                            className={`flex items-start gap-3 rounded-control border bg-app-surface px-4 py-3 shadow-floating ${COLORS[toast.type] ?? COLORS.info}`}
                        >
                            <Icon size={18} className="mt-0.5 shrink-0" />
                            <p className="flex-1 text-sm text-app-text">{toast.message}</p>
                            <button
                                onClick={() => dismiss(toast.id)}
                                aria-label="Dismiss notification"
                                className="text-app-muted hover:text-app-text"
                            >
                                <X size={16} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </ToastContext.Provider>
    );
}
