import { useState } from 'react';
import { Head, Link, router } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import PageHero from '@/Components/UI/PageHero';
import DataTable from '@/Components/UI/DataTable';
import ActionDropdown from '@/Components/UI/ActionDropdown';
import ConfirmModal from '@/Components/UI/ConfirmModal';
import Modal from '@/Components/UI/Modal';
import { Eye, ArchiveRestore, Trash2, ArrowLeft } from 'lucide-react';

export default function Archived({ drivers }) {
    const [viewDriver, setViewDriver] = useState(null);
    const [restoreDriver, setRestoreDriver] = useState(null);
    const [deleteDriver, setDeleteDriver] = useState(null);

    const columns = [
        { key: 'name', label: 'Name', render: (d) => d.user?.full_name },
        { key: 'email', label: 'Email', render: (d) => d.user?.email },
        { key: 'employee_code', label: 'Employee Code' },
        {
            key: 'actions', label: 'Actions', render: (d) => (
                <ActionDropdown items={[
                    { label: 'View', icon: Eye, onClick: () => setViewDriver(d) },
                    { label: 'Restore', icon: ArchiveRestore, onClick: () => setRestoreDriver(d) },
                    { label: 'Delete Permanently', icon: Trash2, danger: true, onClick: () => setDeleteDriver(d) },
                ]} />
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Archived Drivers" />
            <PageHero eyebrow="Personnel Registry: Archive" title="Archived Drivers" description="Restore a driver to reinstate their account, or permanently delete it." />
            <Link href="/admin/drivers" className="mb-4 inline-flex items-center gap-1 text-sm text-app-primary hover:underline"><ArrowLeft size={15} /> Back to Driver Management</Link>
            <DataTable columns={columns} rows={drivers.data} paginator={drivers} emptyTitle="No archived drivers" />

            {viewDriver && (
                <Modal show={!!viewDriver} onClose={() => setViewDriver(null)} title="Driver Details">
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div><dt className="text-app-muted">Name</dt><dd className="text-app-text">{viewDriver.user.full_name}</dd></div>
                        <div><dt className="text-app-muted">Email</dt><dd className="text-app-text">{viewDriver.user.email}</dd></div>
                    </dl>
                </Modal>
            )}

            <ConfirmModal
                show={!!restoreDriver}
                onClose={() => setRestoreDriver(null)}
                onConfirm={() => router.patch(`/admin/drivers/${restoreDriver.id}/restore`, {}, { onSuccess: () => setRestoreDriver(null) })}
                title="Restore Driver"
                message={`Restore ${restoreDriver?.user?.full_name} to active drivers?`}
                confirmLabel="Restore"
            />

            <ConfirmModal
                show={!!deleteDriver}
                onClose={() => setDeleteDriver(null)}
                onConfirm={() => router.delete(`/admin/drivers/${deleteDriver.id}/force-delete`, { onSuccess: () => setDeleteDriver(null) })}
                title="Permanently Delete Driver"
                message="This action cannot be undone. The driver's account and records will be permanently removed."
                confirmLabel="Delete Permanently"
                variant="danger"
            />
        </AuthenticatedLayout>
    );
}
