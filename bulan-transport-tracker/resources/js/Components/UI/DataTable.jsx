import EmptyState from './EmptyState';
import Pagination from './Pagination';

// Generic admin table shell: 10-rows-per-page pagination is enforced
// server-side (see controllers ->paginate(10)); this component just renders
// whatever page of data it's given. Actions column is always last.
export default function DataTable({ columns, rows, paginator, emptyTitle = 'No records found' }) {
    if (!rows || rows.length === 0) {
        return <EmptyState title={emptyTitle} />;
    }

    return (
        <div className="overflow-hidden rounded-card border border-app-border bg-app-surface">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="border-b border-app-border bg-app-bg/60 text-xs uppercase tracking-wide text-app-muted">
                            {columns.map((col) => (
                                <th key={col.key} className="px-4 py-3 font-medium">
                                    {col.label}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={row.id ?? i} className="border-b border-app-border last:border-0 hover:bg-app-bg/40">
                                {columns.map((col) => (
                                    <td key={col.key} className="px-4 py-3 align-middle text-app-text">
                                        {col.render ? col.render(row) : row[col.key]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {paginator && <Pagination meta={paginator} />}
        </div>
    );
}
