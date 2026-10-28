export default function StatCard({ label, value, icon: Icon, onClick, accent = 'primary' }) {
    const accentColor = {
        primary: 'text-app-primary bg-app-primary/10',
        accent: 'text-app-accent bg-app-accent/10',
        warn: 'text-app-warn bg-app-warn/10',
        danger: 'text-app-danger bg-app-danger/10',
    }[accent];

    return (
        <button
            onClick={onClick}
            className="flex items-center gap-4 rounded-card border border-app-border bg-app-surface p-4 text-left transition hover:shadow-floating focus:outline-none focus:ring-2 focus:ring-app-primary/30"
        >
            {Icon && (
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${accentColor}`}>
                    <Icon size={20} />
                </span>
            )}
            <span>
                <span className="block text-2xl font-semibold text-app-text">{value}</span>
                <span className="block text-xs text-app-muted">{label}</span>
            </span>
        </button>
    );
}
