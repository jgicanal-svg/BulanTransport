const STYLES = {
    LIVE: 'bg-app-success/10 text-app-success border-app-success/30',
    ACTIVE: 'bg-app-success/10 text-app-success border-app-success/30',
    STALE: 'bg-app-warn/10 text-app-warn border-app-warn/30',
    PENDING: 'bg-app-warn/10 text-app-warn border-app-warn/30',
    INACTIVE: 'bg-app-muted/10 text-app-muted border-app-muted/30',
    MAINTENANCE: 'bg-app-warn/10 text-app-warn border-app-warn/30',
    COMPLETED: 'bg-app-primary/10 text-app-primary border-app-primary/30',
    CANCELLED: 'bg-app-danger/10 text-app-danger border-app-danger/30',
};

export default function StatusBadge({ status }) {
    const style = STYLES[status] ?? STYLES.INACTIVE;
    return (
        <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
            {status}
        </span>
    );
}
