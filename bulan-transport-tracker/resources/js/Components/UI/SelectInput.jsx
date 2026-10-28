export default function SelectInput({ label, error, id, children, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-app-text">
                    {label}
                </label>
            )}
            <select
                id={id}
                {...props}
                className={`rounded-control border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20 ${error ? 'border-app-danger' : ''} ${className}`}
            >
                {children}
            </select>
            {error && <p className="text-xs text-app-danger">{error}</p>}
        </div>
    );
}
