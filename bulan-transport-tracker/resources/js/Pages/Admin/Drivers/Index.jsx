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
import PhoneInput from "@/Components/UI/PhoneInput";
import PasswordInput from "@/Components/UI/PasswordInput";
import SelectInput from "@/Components/UI/SelectInput";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import { Plus, Eye, Pencil, Archive, Search, UserRound } from "lucide-react";

const sanitizeName = (value) => {
    return value.replace(/[^\p{L}\s]/gu, "");
};

// Driver accounts are created ONLY here by an authenticated admin - there is
// no public self-registration in this build (see routes/auth.php).
export default function Index({ drivers, filters }) {
    const [search, setSearch] = useState(filters.search ?? "");
    const [createOpen, setCreateOpen] = useState(false);
    const [editDriver, setEditDriver] = useState(null);
    const [viewDriver, setViewDriver] = useState(null);
    const [archiveDriver, setArchiveDriver] = useState(null);

    const createForm = useForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        password: "",
        password_confirmation: "",
        employee_code: "",
        license_number: "",
        license_expiry: "",
        status: "ACTIVE",
    });

    const editForm = useForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        employee_code: "",
        license_number: "",
        license_expiry: "",
        status: "ACTIVE",
    });

    const submitSearch = (e) => {
        e.preventDefault();
        router.get("/admin/drivers", { search }, { preserveState: true });
    };

    const openEdit = (driver) => {
        editForm.setData({
            first_name: driver.user.first_name,
            middle_name: driver.user.middle_name ?? "",
            last_name: driver.user.last_name,
            email: driver.user.email,
            contact_number: driver.user.contact_number ?? "",
            employee_code: driver.employee_code ?? "",
            license_number: driver.license_number ?? "",
            license_expiry: driver.license_expiry ?? "",
            status: driver.status,
        });
        setEditDriver(driver);
    };

    const submitCreate = (e) => {
        e.preventDefault();

        createForm.post("/admin/drivers", {
            preserveScroll: true,

            onSuccess: () => {
                setCreateOpen(false);
                createForm.reset();
            },
        });
    };

    const submitEdit = (e) => {
        e.preventDefault();

        editForm.put(`/admin/drivers/${editDriver.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setEditDriver(null);
            },
        });
    };

    const columns = [
        {
            key: "name",
            label: "Driver Details",
            render: (d) => (
                <div className="flex items-center gap-3">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full bg-app-accent/10 text-app-accent">
                        <UserRound size={16} />
                    </span>
                    <div>
                        <p className="font-medium text-app-text">
                            {d.user?.full_name}
                        </p>
                        <p className="text-xs text-app-muted">
                            {d.user?.email}
                        </p>
                    </div>
                </div>
            ),
        },
        {
            key: "contact",
            label: "Contact",
            render: (d) => d.user?.contact_number,
        },
        { key: "employee_code", label: "Employee Code" },
        {
            key: "status",
            label: "Status",
            render: (d) => <StatusBadge status={d.status} />,
        },
        {
            key: "actions",
            label: "Actions",
            render: (d) => (
                <ActionDropdown
                    items={[
                        {
                            label: "View",
                            icon: Eye,
                            onClick: () => setViewDriver(d),
                        },
                        {
                            label: "Edit",
                            icon: Pencil,
                            onClick: () => openEdit(d),
                        },
                        {
                            label: "Archive",
                            icon: Archive,
                            danger: true,
                            onClick: () => setArchiveDriver(d),
                        },
                    ]}
                />
            ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Driver Management" />

            <PageHero
                eyebrow="Personnel Registry: Verified"
                title="Driver Management"
                description="Register and manage cooperative drivers. Driver accounts are created here only - there is no public sign-up."
                action={
                    <PrimaryButton onClick={() => setCreateOpen(true)}>
                        <Plus size={16} /> Add Driver
                    </PrimaryButton>
                }
            />

            <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <form onSubmit={submitSearch} className="relative">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search drivers..."
                        className="w-72 rounded-control border border-app-border bg-app-surface py-2 pl-9 pr-3 text-sm focus:border-app-primary focus:outline-none"
                    />
                </form>
                <Link
                    href="/admin/drivers/archived"
                    className="rounded-control border border-app-border bg-app-surface px-4 py-2 text-sm text-app-text hover:bg-app-bg"
                >
                    Archived
                </Link>
            </div>

            <DataTable
                columns={columns}
                rows={drivers.data}
                paginator={drivers}
                emptyTitle="No drivers found"
            />

            <FormModal
                show={createOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={submitCreate}
                title="Add Driver Account"
                processing={createForm.processing}
                size="lg"
            >
                <div className="grid grid-cols-2 gap-4">
                    <TextInput
                        label="First Name"
                        value={createForm.data.first_name}
                        onChange={(e) =>
                            createForm.setData(
                                "first_name",
                                sanitizeName(e.target.value),
                            )
                        }
                        error={createForm.errors.first_name}
                        required
                    />
                    <TextInput
                        label="Last Name"
                        value={createForm.data.last_name}
                        onChange={(e) =>
                            createForm.setData(
                                "last_name",
                                sanitizeName(e.target.value),
                            )
                        }
                        error={createForm.errors.last_name}
                        required
                    />
                </div>
                <TextInput
                    label="Middle Name"
                    value={createForm.data.middle_name}
                    onChange={(e) =>
                        createForm.setData(
                            "middle_name",
                            sanitizeName(e.target.value),
                        )
                    }
                    error={createForm.errors.middle_name}
                />
                <TextInput
                    label="Email"
                    type="email"
                    value={createForm.data.email}
                    onChange={(e) =>
                        createForm.setData("email", e.target.value)
                    }
                    error={createForm.errors.email}
                    required
                />
                <PhoneInput
                    label="Contact Number"
                    value={createForm.data.contact_number}
                    onChange={(v) => createForm.setData("contact_number", v)}
                    error={createForm.errors.contact_number}
                    required
                />
                <div className="grid grid-cols-2 gap-4">
                    <PasswordInput
                        label="Password"
                        value={createForm.data.password}
                        onChange={(e) =>
                            createForm.setData("password", e.target.value)
                        }
                        error={createForm.errors.password}
                        required
                    />

                    <PasswordInput
                        label="Confirm Password"
                        value={createForm.data.password_confirmation}
                        onChange={(e) =>
                            createForm.setData(
                                "password_confirmation",
                                e.target.value,
                            )
                        }
                        error={createForm.errors.password_confirmation}
                        required
                    />

                    <p className="col-span-2 -mt-2 text-[11px] text-app-muted">
                        Password must be at least 8 characters and contain both
                        letters and numbers.
                    </p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TextInput
                        label="Employee Code"
                        value={createForm.data.employee_code}
                        onChange={(e) =>
                            createForm.setData("employee_code", e.target.value)
                        }
                        error={createForm.errors.employee_code}
                    />
                    <TextInput
                        label="License Number"
                        value={createForm.data.license_number}
                        onChange={(e) =>
                            createForm.setData("license_number", e.target.value)
                        }
                        error={createForm.errors.license_number}
                    />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <TextInput
                        label="License Expiry"
                        type="date"
                        value={createForm.data.license_expiry}
                        onChange={(e) =>
                            createForm.setData("license_expiry", e.target.value)
                        }
                        error={createForm.errors.license_expiry}
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
                    </SelectInput>
                </div>
            </FormModal>

            {editDriver && (
                <FormModal
                    show={!!editDriver}
                    onClose={() => setEditDriver(null)}
                    onSubmit={submitEdit}
                    title="Edit Driver"
                    processing={editForm.processing}
                    size="lg"
                >
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            label="First Name"
                            value={editForm.data.first_name}
                            onChange={(e) =>
                                editForm.setData(
                                    "first_name",
                                    sanitizeName(e.target.value),
                                )
                            }
                            error={editForm.errors.first_name}
                            required
                        />
                        <TextInput
                            label="Last Name"
                            value={editForm.data.last_name}
                            onChange={(e) =>
                                editForm.setData(
                                    "last_name",
                                    sanitizeName(e.target.value),
                                )
                            }
                            error={editForm.errors.last_name}
                            required
                        />
                    </div>
                    <TextInput
                        label="Middle Name"
                        value={editForm.data.middle_name}
                        onChange={(e) =>
                            editForm.setData(
                                "middle_name",
                                sanitizeName(e.target.value),
                            )
                        }
                        error={editForm.errors.middle_name}
                    />
                    <TextInput
                        label="Email"
                        type="email"
                        value={editForm.data.email}
                        onChange={(e) =>
                            editForm.setData("email", e.target.value)
                        }
                        error={editForm.errors.email}
                        required
                    />
                    <PhoneInput
                        label="Contact Number"
                        value={editForm.data.contact_number}
                        onChange={(v) => editForm.setData("contact_number", v)}
                        error={editForm.errors.contact_number}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <TextInput
                            label="Employee Code"
                            value={editForm.data.employee_code}
                            onChange={(e) =>
                                editForm.setData(
                                    "employee_code",
                                    e.target.value,
                                )
                            }
                            error={editForm.errors.employee_code}
                        />
                        <TextInput
                            label="License Number"
                            value={editForm.data.license_number}
                            onChange={(e) =>
                                editForm.setData(
                                    "license_number",
                                    e.target.value,
                                )
                            }
                            error={editForm.errors.license_number}
                        />
                    </div>
                    <SelectInput
                        label="Status"
                        value={editForm.data.status}
                        onChange={(e) =>
                            editForm.setData("status", e.target.value)
                        }
                    >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                    </SelectInput>
                </FormModal>
            )}

            {viewDriver && (
                <Modal
                    show={!!viewDriver}
                    onClose={() => setViewDriver(null)}
                    title="Driver Details"
                >
                    <dl className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <dt className="text-app-muted">Name</dt>
                            <dd className="text-app-text">
                                {viewDriver.user.full_name}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Email</dt>
                            <dd className="text-app-text">
                                {viewDriver.user.email}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Contact</dt>
                            <dd className="text-app-text">
                                {viewDriver.user.contact_number}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Employee Code</dt>
                            <dd className="text-app-text">
                                {viewDriver.employee_code ?? "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">License #</dt>
                            <dd className="text-app-text">
                                {viewDriver.license_number ?? "-"}
                            </dd>
                        </div>
                        <div>
                            <dt className="text-app-muted">Status</dt>
                            <dd>
                                <StatusBadge status={viewDriver.status} />
                            </dd>
                        </div>
                    </dl>
                </Modal>
            )}

            <ConfirmModal
                show={!!archiveDriver}
                onClose={() => setArchiveDriver(null)}
                onConfirm={() =>
                    router.patch(
                        `/admin/drivers/${archiveDriver.id}/archive`,
                        {},
                        { onSuccess: () => setArchiveDriver(null) },
                    )
                }
                title="Archive Driver"
                message={`Archive ${archiveDriver?.user?.full_name}? They can be restored later from the Archived page.`}
                confirmLabel="Archive"
                variant="danger"
            />
        </AuthenticatedLayout>
    );
}
