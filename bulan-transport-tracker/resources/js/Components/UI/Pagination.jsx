import { Link } from '@inertiajs/react';

// Expects a Laravel paginator object ({ links, from, to, total, ... }).
export default function Pagination({ meta }) {
    if (!meta || meta.links?.length <= 3) return null;

    return (
        <div className="flex flex-col items-center justify-between gap-3 border-t border-app-border px-4 py-3 sm:flex-row">
            <p className="text-xs text-app-muted">
                Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total ?? 0}
            </p>
            <nav className="flex flex-wrap gap-1" aria-label="Pagination">
                {meta.links.map((link, i) => (
                    <Link
                        key={i}
                        href={link.url || '#'}
                        preserveScroll
                        aria-current={link.active ? 'page' : undefined}
                        className={`min-w-[32px] rounded-control px-2 py-1 text-center text-xs ${
                            link.active
                                ? 'bg-app-primary text-white'
                                : link.url
                                  ? 'text-app-text hover:bg-app-bg'
                                  : 'cursor-not-allowed text-app-muted'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </nav>
        </div>
    );
}
