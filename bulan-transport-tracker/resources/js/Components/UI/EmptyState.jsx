import { Inbox } from 'lucide-react';

export default function EmptyState({ title = 'No records found', description, icon: Icon = Inbox }) {
    return (
        <div className="flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-app-border py-12 text-center">
            <Icon size={28} className="text-app-muted" />
            <p className="text-sm font-medium text-app-text">{title}</p>
            {description && <p className="max-w-sm text-xs text-app-muted">{description}</p>}
        </div>
    );
}
