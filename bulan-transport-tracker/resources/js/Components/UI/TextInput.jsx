import { forwardRef } from 'react';

const TextInput = forwardRef(function TextInput({ label, error, className = '', id, ...props }, ref) {
    return (
        <div className="flex flex-col gap-1.5">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-app-text">
                    {label}
                </label>
            )}
            <input
                ref={ref}
                id={id}
                {...props}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`rounded-control border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text placeholder:text-app-muted focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20 ${error ? 'border-app-danger' : ''} ${className}`}
            />
            {error && (
                <p id={`${id}-error`} className="text-xs text-app-danger">
                    {error}
                </p>
            )}
        </div>
    );
});

export default TextInput;
