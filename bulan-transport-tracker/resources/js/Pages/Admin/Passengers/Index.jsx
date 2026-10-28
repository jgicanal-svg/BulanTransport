import { useState } from "react";
import { Head, Link, router } from "@inertiajs/react";
import { Archive, Eye, Search, UserRound } from "lucide-react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHero from "@/Components/UI/PageHero";
import DataTable from "@/Components/UI/DataTable";
import ActionDropdown from "@/Components/UI/ActionDropdown";
import ConfirmModal from "@/Components/UI/ConfirmModal";
import Modal from "@/Components/UI/Modal";
import StatusBadge from "@/Components/UI/StatusBadge";

export default function Index({ passengers, filters }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [viewPassenger, setViewPassenger] = useState(null);
    const [archivePassenger, setArchivePassenger] = useState(null);

    const submitSearch = (event) => {
        event.preventDefault();

        router.get(
            "/admin/passengers",
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
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app-primary/10 text-app-primary">
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
            key: "created_at",
            label: "Registered",
            render: (passenger) =>
                new Date(passenger.created_at).toLocaleDateString(),
        },
        {
            key: "status",
            label: "Status",
            render: (passenger) => (
                <StatusBadge
                    status={passenger.is_active ? "ACTIVE" : "INACTIVE"}
                />
            ),
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
                            label: "Archive",
                            icon: Archive,
                            danger: true,
                            onClick: () => setArchivePassenger(passenger),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Passenger Accounts" />

            <PageHero
                eyebrow="Account Registry"
                title="Passenger Accounts"
                description="View and manage passenger accounts created through public registration."
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
                        placeholder="Search passengers..."
                        className="w-72 rounded-control border border-app-border bg-app-surface py-2 pl-9 pr-3 text-sm focus:border-app-primary focus:outline-none"
                    />
                </form>

                <Link
                    href="/admin/passengers/archived"
                    className="rounded-control border border-app-border bg-app-surface px-4 py-2 text-sm text-app-text hover:bg-app-bg"
                >
                    Archived Accounts
                </Link>
            </div>

            <DataTable
                columns={columns}
                rows={passengers.data}
                paginator={passengers}
                emptyTitle="No passenger accounts found"
            />

            {viewPassenger && (
                <Modal
                    show={!!viewPassenger}
                    onClose={() => setViewPassenger(null)}
                    title="Passenger Details"
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

                        <Detail label="Role" value="Passenger" />

                        <Detail
                            label="Status"
                            value={
                                viewPassenger.is_active ? "Active" : "Inactive"
                            }
                        />

                        <Detail
                            label="Registered"
                            value={new Date(
                                viewPassenger.created_at,
                            ).toLocaleString()}
                        />
                    </dl>
                </Modal>
            )}

            <ConfirmModal
                show={!!archivePassenger}
                onClose={() => setArchivePassenger(null)}
                onConfirm={() =>
                    router.patch(
                        `/admin/passengers/${archivePassenger.id}/archive`,
                        {},
                        {
                            onSuccess: () => setArchivePassenger(null),
                        },
                    )
                }
                title="Archive Passenger"
                message={`Archive ${archivePassenger?.full_name}? This account will no longer be able to log in.`}
                confirmLabel="Archive"
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
