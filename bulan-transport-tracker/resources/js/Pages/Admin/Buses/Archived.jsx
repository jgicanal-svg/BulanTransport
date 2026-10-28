import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/UI/PageHero';
import DataTable from '@/Components/UI/DataTable';
import ActionDropdown from '@/Components/UI/ActionDropdown';
import ConfirmModal from '@/Components/UI/ConfirmModal';
import { ArchiveRestore, Trash2, ArrowLeft } from 'lucide-react';

export default function Archived({ buses }) {
    const [restoreBus, setRestoreBus] = useState(null);
    const [deleteBus, setDeleteBus] = useState(null);

    const columns = [
        { key: 'bus_number', label: 'Bus Number' },
        { key: 'plate_number', label: 'Plate Number' },
        {
            key: 'actions', label: 'Actions', render: (b) => (
                <ActionDropdown items={[
                    { label: 'Restore', icon: ArchiveRestore, onClick: () => setRestoreBus(b) },
                    { label: 'Delete Permanently', icon: Trash2, danger: true, onClick: () => setDeleteBus(b) },
                ]} />
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Archived Buses" />
            <PageHero eyebrow="Fleet Integrity: Archive" title="Archived Vehicle Units" description="Restore a unit to return it to active inventory, or permanently delete it." />
            <Link href="/admin/buses" className="mb-4 inline-flex items-center gap-1 text-sm text-app-primary hover:underline"><ArrowLeft size={15} /> Back to Vehicle Management</Link>
            <DataTable columns={columns} rows={buses.data} paginator={buses} emptyTitle="No archived buses" />

            <ConfirmModal show={!!restoreBus} onClose={() => setRestoreBus(null)} confirmLabel="Restore" title="Restore Bus"
                message={`Restore bus ${restoreBus?.bus_number}?`}
                onConfirm={() => router.patch(`/admin/buses/${restoreBus.id}/restore`, {}, { onSuccess: () => setRestoreBus(null) })} />

            <ConfirmModal show={!!deleteBus} onClose={() => setDeleteBus(null)} variant="danger" confirmLabel="Delete Permanently" title="Permanently Delete Bus"
                message="This action cannot be undone."
                onConfirm={() => router.delete(`/admin/buses/${deleteBus.id}/force-delete`, { onSuccess: () => setDeleteBus(null) })} />
        </AuthenticatedLayout>
    );
}
