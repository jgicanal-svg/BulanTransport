import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/UI/PageHero';
import DataTable from '@/Components/UI/DataTable';
import ActionDropdown from '@/Components/UI/ActionDropdown';
import ConfirmModal from '@/Components/UI/ConfirmModal';
import { ArchiveRestore, Trash2, ArrowLeft } from 'lucide-react';

export default function Archived({ routes }) {
    const [restoreRoute, setRestoreRoute] = useState(null);
    const [deleteRoute, setDeleteRoute] = useState(null);

    const columns = [
        { key: 'name', label: 'Route Name' },
        { key: 'code', label: 'Code' },
        {
            key: 'actions', label: 'Actions', render: (r) => (
                <ActionDropdown items={[
                    { label: 'Restore', icon: ArchiveRestore, onClick: () => setRestoreRoute(r) },
                    { label: 'Delete Permanently', icon: Trash2, danger: true, onClick: () => setDeleteRoute(r) },
                ]} />
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Archived Routes" />
            <PageHero eyebrow="Network Topology: Archive" title="Archived Routes" description="Restore a route to reinstate it, or permanently delete it." />
            <Link href="/admin/routes" className="mb-4 inline-flex items-center gap-1 text-sm text-app-primary hover:underline"><ArrowLeft size={15} /> Back to Route Management</Link>
            <DataTable columns={columns} rows={routes.data} paginator={routes} emptyTitle="No archived routes" />

            <ConfirmModal show={!!restoreRoute} onClose={() => setRestoreRoute(null)} confirmLabel="Restore" title="Restore Route"
                message={`Restore route "${restoreRoute?.name}"?`}
                onConfirm={() => router.patch(`/admin/routes/${restoreRoute.id}/restore`, {}, { onSuccess: () => setRestoreRoute(null) })} />

            <ConfirmModal show={!!deleteRoute} onClose={() => setDeleteRoute(null)} variant="danger" confirmLabel="Delete Permanently" title="Permanently Delete Route"
                message="This action cannot be undone."
                onConfirm={() => router.delete(`/admin/routes/${deleteRoute.id}/force-delete`, { onSuccess: () => setDeleteRoute(null) })} />
        </AuthenticatedLayout>
    );
}
