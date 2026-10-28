import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import {
    ArrowLeft,
    Eye,
    RotateCcw,
    Search,
    Trash2,
    UserRound,
} from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHero from "@/Components/UI/PageHero";
import DataTable from "@/Components/UI/DataTable";
import ActionDropdown from "@/Components/UI/ActionDropdown";
import ConfirmModal from "@/Components/UI/ConfirmModal";
import Modal from "@/Components/UI/Modal";

export default function Archived({ passengers, filters }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [viewPassenger, setViewPassenger] = useState(null);
    const [restorePassenger, setRestorePassenger] = useState(null);
    const [deletePassenger, setDeletePassenger] = useState(null);

    const submitSearch = (event) => {
        event.preventDefault();

        router.get(
            "/admin/passengers/archived",
            { search },
            {
                preserveState: true,
                replace: true,
            },
        );
    };

    const columns = [
        {
            key: "passenger",
            label: "Passenger Details",
            render: (passenger) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app-muted/10 text-app-muted">
                        <UserRound size={16} />
                    </span>

                    <div>
                        <p className="font-medium text-app-text">
                            {passenger.full_name}
                        </p>

                        <p className="text-xs text-app-muted">
                            {passenger.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "contact_number",
            label: "Contact Number",
            render: (passenger) => passenger.contact_number ?? "-",
        },
        {
            key: "deleted_at",
            label: "Archived",
            render: (passenger) =>
                new Date(passenger.deleted_at).toLocaleString(),
        },
        {
            key: "actions",
            label: "Actions",
            render: (passenger) => (
                <ActionDropdown
                    items={[
                        {
                            label: "View",
                            icon: Eye,
                            onClick: () => setViewPassenger(passenger),
                        },
                        {
                            label: "Restore",
                            icon: RotateCcw,
                            onClick: () => setRestorePassenger(passenger),
                        },
                        {
                            label: "Permanently Delete",
                            icon: Trash2,
                            danger: true,
                            onClick: () => setDeletePassenger(passenger),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Archived Passengers" />

            <PageHero
                eyebrow="Archived Records"
                title="Archived Passenger Accounts"
                description="Restore archived passengers or permanently delete their accounts."
            />

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={submitSearch} className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted"
                    />

                    <input
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                        placeholder="Search archived passengers..."
                        className="w-72 rounded-control border border-app-border bg-app-surface py-2 pl-9 pr-3 text-sm focus:border-app-primary focus:outline-none"
                    />
                </form>

                <Link
                    href="/admin/passengers"
                    className="inline-flex items-center gap-2 rounded-control border border-app-border bg-app-surface px-4 py-2 text-sm text-app-text hover:bg-app-bg"
                >
                    <ArrowLeft size={15} />
                    Passenger Accounts
                </Link>
            </div>

            <DataTable
                columns={columns}
                rows={passengers.data}
                paginator={passengers}
                emptyTitle="No archived passenger accounts"
            />

            {viewPassenger && (
                <Modal
                    show={!!viewPassenger}
                    onClose={() => setViewPassenger(null)}
                    title="Archived Passenger Details"
                >
                    <dl className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                        <Detail
                            label="Full Name"
                            value={viewPassenger.full_name}
                        />

                        <Detail
                            label="Email Address"
                            value={viewPassenger.email}
                        />

                        <Detail
                            label="Contact Number"
                            value={viewPassenger.contact_number ?? "-"}
                        />

                        <Detail
                            label="Archived At"
                            value={new Date(
                                viewPassenger.deleted_at,
                            ).toLocaleString()}
                        />
                    </dl>
                </Modal>
            )}

            <ConfirmModal
                show={!!restorePassenger}
                onClose={() => setRestorePassenger(null)}
                onConfirm={() =>
                    router.patch(
                        `/admin/passengers/${restorePassenger.id}/restore`,
                        {},
                        {
                            onSuccess: () => setRestorePassenger(null),
                        },
                    )
                }
                title="Restore Passenger"
                message={`Restore ${restorePassenger?.full_name}? They will be allowed to log in again.`}
                confirmLabel="Restore"
            />

            <ConfirmModal
                show={!!deletePassenger}
                onClose={() => setDeletePassenger(null)}
                onConfirm={() =>
                    router.delete(
                        `/admin/passengers/${deletePassenger.id}/force-delete`,
                        {
                            onSuccess: () => setDeletePassenger(null),
                        },
                    )
                }
                title="Permanently Delete Passenger"
                message={`Permanently delete ${deletePassenger?.full_name}? This action cannot be undone.`}
                confirmLabel="Delete Permanently"
                variant="danger"
            />
        </AuthenticatedLayout>
    );
}

function Detail({ label, value }) {
    return (
        <div>
            <dt className="text-app-muted">{label}</dt>
            <dd className="mt-1 break-words font-medium text-app-text">
                {value}
            </dd>
        </div>
    );
}
