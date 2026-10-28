// Dark "operations terminal" hero banner used at the top of every Admin
// content page, matching the approved reference design (Fleet Monitor /
// Assets & Inventory / Routes & Mapping style headers).
export default function PageHero({ eyebrow, title, description, action }) {
    return (
        <div className="mb-6 flex flex-col gap-4 rounded-hero bg-gradient-to-br from-terminal-bg to-terminal-surface p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
            <div>
                {eyebrow && (
                    <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-terminal-accent">
                        <span className="h-1.5 w-1.5 rounded-full bg-terminal-accent" />
                        {eyebrow}
                    </div>
                )}
                <h1 className="text-2xl font-bold text-terminal-text sm:text-3xl">{title}</h1>
                {description && <p className="mt-2 max-w-xl text-sm text-terminal-muted">{description}</p>}
            </div>
            {action && <div className="shrink-0">{action}</div>}
        </div>
    );
}
