export default function SecondaryButton({ className = '', disabled, children, ...props }) {
    return (
        <button
            {...props}
            disabled={disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-control border border-app-border bg-app-surface px-4 py-2 text-sm font-medium text-app-text transition hover:bg-app-bg focus:outline-none focus:ring-2 focus:ring-app-primary/30 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        >
            {children}
        </button>
    );
}
