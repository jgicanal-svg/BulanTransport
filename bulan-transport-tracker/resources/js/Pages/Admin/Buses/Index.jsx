import { useState } from "react";
import { Head, Link, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHero from "@/Components/UI/PageHero";
import DataTable from "@/Components/UI/DataTable";
import ActionDropdown from "@/Components/UI/ActionDropdown";
import StatusBadge from "@/Components/UI/StatusBadge";
import FormModal from "@/Components/UI/FormModal";
import ConfirmModal from "@/Components/UI/ConfirmModal";
import Modal from "@/Components/UI/Modal";
import TextInput from "@/Components/UI/TextInput";
import SelectInput from "@/Components/UI/SelectInput";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import SecondaryButton from "@/Components/UI/SecondaryButton";
import {
    Plus,
    Eye,
    Pencil,
    Archive,
    Search,
    Download,
    Bus as BusIcon,
} from "lucide-react";

export default function Index({ buses, filters }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [createOpen, setCreateOpen] = useState(false);
    const [editBus, setEditBus] = useState(null);
    const [viewBus, setViewBus] = useState(null);
    const [archiveBus, setArchiveBus] = useState(null);

    const createForm = useForm({
        bus_number: "",
        plate_number: "",
        device_code: "",
        model: "",
        capacity: "",
        status: "ACTIVE",
        notes: "",
    });
    const editForm = useForm({
        bus_number: "",
        plate_number: "",
        device_code: "",
        model: "",
        capacity: "",
        status: "ACTIVE",
        notes: "",
    });

    const openEdit = (bus) => {
        editForm.setData({
            bus_number: bus.bus_number,
            plate_number: bus.plate_number,
            device_code: bus.device_code ?? "",
            model: bus.model ?? "",
            capacity: bus.capacity ?? "",
            status: bus.status,
            notes: bus.notes ?? "",
        });
        setEditBus(bus);
    };

    const columns = [
        {
            key: "bus_details",
            label: "Bus Details",
            render: (b) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                        <BusIcon size={16} />
                    </span>
                    <div>
                        <p className="font-medium text-app-text">
                            {b.bus_number}
                        </p>
                        <p className="text-xs text-app-muted">
                            {b.plate_number}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "device_code",
            label: "Device Code",
            render: (b) =>
                b.device_code ? (
                    <span className="rounded-control bg-app-primary/10 px-2 py-1 font-mono text-xs font-semibold text-app-primary">
                        {b.device_code}
                    </span>
                ) : (
                    <span className="text-xs text-app-muted">—</span>
                ),
        },
        { key: "model", label: "Model" },
        {
            key: "status",
            label: "Status",
            render: (b) => <StatusBadge status={b.status} />,
        },
        {
            key: "actions",
            label: "Actions",
            render: (b) => (
                <ActionDropdown
                    items={[
                        {
                            label: "View",
                            icon: Eye,
                            onClick: () => setViewBus(b),
                        },
                        {
                            label: "Edit",
                            icon: Pencil,
                            onClick: () => openEdit(b),
                        },
                        {
                            label: "Archive",
                            icon: Archive,
                            danger: true,
                            onClick: () => setArchiveBus(b),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Vehicle Management" />

            <PageHero
                eyebrow="Fleet Integrity: Verified"
                title="Assets & Inventory"
                description="Comprehensive database of transport units, device pairing codes, and registered drivers."
                action={
                    <PrimaryButton onClick={() => setCreateOpen(true)}>
                        <Plus size={16} /> Add Unit
                    </PrimaryButton>
                }
            />

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        router.get(
                            "/admin/buses",
                            { search },
                            { preserveState: true },
                        );
                    }}
                    className="relative"
                >
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by plate number, bus number..."
                        className="w-72 rounded-control border border-app-border bg-app-surface py-2 pl-9 pr-3 text-sm focus:border-app-primary focus:outline-none"
                    />
                </form>
                <div className="flex gap-2">
                    <Link
                        href="/admin/buses/archived"
                        className="rounded-control border border-app-border bg-app-surface px-4 py-2 text-sm hover:bg-app-bg"
                    >
                        Archived
                    </Link>
                    <SecondaryButton
                        onClick={() =>
                            (window.location = "/admin/buses/export")
                        }
                    >
                        <Download size={15} /> Export CSV
                    </SecondaryButton>
                </div>
            </div>

            <DataTable
                columns={columns}
                rows={buses.data}
                paginator={buses}
                emptyTitle="No buses found"
            />

            <FormModal
                show={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Add Vehicle Unit"
                processing={createForm.processing}
                onSubmit={(e) => {
                    e.preventDefault();
                    createForm.post("/admin/buses", {
                        onSuccess: () => {
                            setCreateOpen(false);
                            createForm.reset();
                        },
                    });
                }}
            >
                <TextInput
                    label="Bus Number"
                    value={createForm.data.bus_number}
                    onChange={(e) =>
                        createForm.setData("bus_number", e.target.value)
                    }
                    error={createForm.errors.bus_number}
                    required
                />
                <TextInput
                    label="Plate Number"
                    value={createForm.data.plate_number}
                    onChange={(e) =>
                        createForm.setData("plate_number", e.target.value)
                    }
                    error={createForm.errors.plate_number}
                    required
                />
                <TextInput
                    label="Device Code (optional)"
                    value={createForm.data.device_code}
                    onChange={(e) =>
                        createForm.setData("device_code", e.target.value)
                    }
                    error={createForm.errors.device_code}
                    placeholder="e.g. BTR-1000"
                />
                <TextInput
                    label="Model"
                    value={createForm.data.model}
                    onChange={(e) =>
                        createForm.setData("model", e.target.value)
                    }
                    error={createForm.errors.model}
                />
                <div className="grid grid-cols-2 gap-4">
                    <TextInput
                        label="Capacity"
                        type="number"
                        value={createForm.data.capacity}
                        onChange={(e) =>
                            createForm.setData("capacity", e.target.value)
                        }
                        error={createForm.errors.capacity}
                    />
                    <SelectInput
                        label="Status"
                        value={createForm.data.status}
                        onChange={(e) =>
                            createForm.setData("status", e.target.value)
                        }
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="MAINTENANCE">Maintenance</option>
                    </SelectInput>
                </div>
            </FormModal>

            {editBus && (
                <FormModal
                    show={!!editBus}
                    onClose={() => setEditBus(null)}
                    title="Edit Vehicle Unit"
                    processing={editForm.processing}
                    onSubmit={(e) => {
                        e.preventDefault();
                        editForm.put(`/admin/buses/${editBus.id}`, {
                            onSuccess: () => setEditBus(null),
                        });
                    }}
                >
                    <TextInput
                        label="Bus Number"
                        value={editForm.data.bus_number}
                        onChange={(e) =>
                            editForm.setData("bus_number", e.target.value)
                        }
                        error={editForm.errors.bus_number}
                        required
                    />
                    <TextInput
                        label="Plate Number"
                        value={editForm.data.plate_number}
                        onChange={(e) =>
                            editForm.setData("plate_number", e.target.value)
                        }
                        error={editForm.errors.plate_number}
                        required
                    />
                    <TextInput
                        label="Device Code"
                        value={editForm.data.device_code}
                        onChange={(e) =>
                            editForm.setData("device_code", e.target.value)
                        }
                        error={editForm.errors.device_code}
                    />
                    <TextInput
                        label="Model"
                        value={editForm.data.model}
                        onChange={(e) =>
                            editForm.setData("model", e.target.value)
                        }
                        error={editForm.errors.model}
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            label="Capacity"
                            type="number"
                            value={editForm.data.capacity}
                            onChange={(e) =>
                                editForm.setData("capacity", e.target.value)
                            }
                            error={editForm.errors.capacity}
                        />
                        <SelectInput
                            label="Status"
                            value={editForm.data.status}
                            onChange={(e) =>
                                editForm.setData("status", e.target.value)
                            }
                        >
                            <option value="ACTIVE">Active</option>
                            <option value="INACTIVE">Inactive</option>
                            <option value="MAINTENANCE">Maintenance</option>
                        </SelectInput>
                    </div>
                </FormModal>
            )}

            {viewBus && (
                <Modal
                    show={!!viewBus}
                    onClose={() => setViewBus(null)}
                    title="Bus Details"
                >
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-app-muted">Bus Number</dt>
                            <dd className="text-app-text">
                                {viewBus.bus_number}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Plate Number</dt>
                            <dd className="text-app-text">
                                {viewBus.plate_number}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Device Code</dt>
                            <dd className="text-app-text">
                                {viewBus.device_code ?? "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Model</dt>
                            <dd className="text-app-text">
                                {viewBus.model ?? "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Capacity</dt>
                            <dd className="text-app-text">
                                {viewBus.capacity ?? "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Status</dt>
                            <dd>
                                <StatusBadge status={viewBus.status} />
                            </dd>
                        </div>
                    </dl>
                </Modal>
            )}

            <ConfirmModal
                show={!!archiveBus}
                onClose={() => setArchiveBus(null)}
                variant="danger"
                confirmLabel="Archive"
                title="Archive Bus"
                message={`Archive bus ${archiveBus?.bus_number}?`}
                onConfirm={() =>
                    router.patch(
                        `/admin/buses/${archiveBus.id}/archive`,
                        {},
                        { onSuccess: () => setArchiveBus(null) },
                    )
                }
            />
        </AuthenticatedLayout>
    );
}
