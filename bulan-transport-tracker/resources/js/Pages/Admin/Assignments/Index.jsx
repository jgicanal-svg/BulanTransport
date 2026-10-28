import { useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";
import PageHero from "@/Components/UI/PageHero";
import DataTable from "@/Components/UI/DataTable";
import ActionDropdown from "@/Components/UI/ActionDropdown";
import StatusBadge from "@/Components/UI/StatusBadge";
import FormModal from "@/Components/UI/FormModal";
import ConfirmModal from "@/Components/UI/ConfirmModal";
import SelectInput from "@/Components/UI/SelectInput";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import { Plus, XCircle, Trash2 } from "lucide-react";

export default function Index({ assignments, drivers, buses, routes }) {
    const [createOpen, setCreateOpen] = useState(false);
    const [endAssignment, setEndAssignment] = useState(null);
    const [deleteDriverAssignment, setDeleteDriverAssignment] = useState(null);
    const form = useForm({ driver_id: "", bus_id: "", route_id: "" });

    const selectedRoute =
        routes.find(
            (route) => String(route.id) === String(form.data.route_id),
        ) ?? null;

    const columns = [
        {
            key: "driver",
            label: "Driver",
            render: (a) => a.driver?.user?.full_name,
        },
        { key: "bus", label: "Bus", render: (a) => a.bus?.bus_number },
        {
            key: "route",
            label: "Route",
            render: (a) => (
                <div>
                    <p className="font-medium text-app-text">
                        {a.route?.name ?? "—"}
                    </p>

                    {a.route?.distance_km && (
                        <p className="mt-0.5 text-xs text-app-muted">
                            {a.route.distance_km} km
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "starting_point",
            label: "Starting Point",
            render: (a) => (
                <div>
                    <p className="text-sm text-app-text">
                        {a.route?.origin ?? "—"}
                    </p>

                    {a.route?.origin_latitude && a.route?.origin_longitude && (
                        <p className="mt-0.5 text-[11px] text-app-muted">
                            {a.route.origin_latitude},{" "}
                            {a.route.origin_longitude}
                        </p>
                    )}
                </div>
            ),
        },
        {
            key: "status",
            label: "Status",
            render: (a) => (
                <StatusBadge status={a.is_active ? "ACTIVE" : "INACTIVE"} />
            ),
        },
        {
            key: "actions",
            label: "Actions",
            render: (a) =>
                a.is_active ? (
                    <ActionDropdown
                        items={[
                            {
                                label: "End Assignment",
                                icon: XCircle,
                                danger: true,
                                onClick: () => setEndAssignment(a),
                            },
                            {
                                label: "Delete Driver",
                                icon: Trash2,
                                danger: true,
                                onClick: () => setDeleteDriverAssignment(a),
                            },
                        ]}
                    />
                ) : (
                    <span className="text-xs text-app-muted">Ended</span>
                ),
        },
    ];

    return (
        <AuthenticatedLayout>
            <Head title="Assignments" />
            <PageHero
                eyebrow="Operations Assignment"
                title="Bus Assignments"
                description="Pair drivers with buses and routes for active service."
                action={
                    <PrimaryButton onClick={() => setCreateOpen(true)}>
                        <Plus size={16} /> New Assignment
                    </PrimaryButton>
                }
            />
            <div className="mb-4 hidden justify-end">
                <PrimaryButton onClick={() => setCreateOpen(true)}>
                    <Plus size={16} /> New Assignment
                </PrimaryButton>
            </div>

            <DataTable
                columns={columns}
                rows={assignments.data}
                paginator={assignments}
                emptyTitle="No assignments found"
            />

            <FormModal
                show={createOpen}
                onClose={() => setCreateOpen(false)}
                title="Assign Driver + Bus + Route"
                processing={form.processing}
                onSubmit={(e) => {
                    e.preventDefault();
                    form.post("/admin/assignments", {
                        onSuccess: () => {
                            setCreateOpen(false);
                            form.reset();
                        },
                    });
                }}
            >
                <SelectInput
                    label="Driver"
                    value={form.data.driver_id}
                    onChange={(e) => form.setData("driver_id", e.target.value)}
                    error={form.errors.driver_id}
                    required
                >
                    <option value="">Select driver</option>
                    {drivers.map((d) => (
                        <option key={d.id} value={d.id}>
                            {d.user.full_name}
                        </option>
                    ))}
                </SelectInput>
                <SelectInput
                    label="Bus"
                    value={form.data.bus_id}
                    onChange={(e) => form.setData("bus_id", e.target.value)}
                    error={form.errors.bus_id}
                    required
                >
                    <option value="">Select bus</option>
                    {buses.map((b) => (
                        <option key={b.id} value={b.id}>
                            {b.bus_number}
                        </option>
                    ))}
                </SelectInput>
                <SelectInput
                    label="Route"
                    value={form.data.route_id}
                    onChange={(e) => form.setData("route_id", e.target.value)}
                    error={form.errors.route_id}
                    required
                >
                    <option value="">Select route</option>
                    {routes.map((r) => (
                        <option key={r.id} value={r.id}>
                            {r.name}
                        </option>
                    ))}
                </SelectInput>
                {selectedRoute && (
                    <div className="rounded-card border border-app-primary/20 bg-app-primary/5 p-4">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-app-primary">
                            Route Information
                        </p>

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            {/* Starting Point */}
                            <div>
                                <p className="text-xs text-app-muted">
                                    Starting Location
                                </p>

                                <p className="mt-1 text-sm font-medium text-app-text">
                                    {selectedRoute.origin}
                                </p>

                                {selectedRoute.origin_latitude &&
                                    selectedRoute.origin_longitude && (
                                        <p className="mt-1 text-[11px] text-app-muted">
                                            GPS: {selectedRoute.origin_latitude}
                                            , {selectedRoute.origin_longitude}
                                        </p>
                                    )}
                            </div>

                            {/* Destination */}
                            <div>
                                <p className="text-xs text-app-muted">
                                    Destination
                                </p>

                                <p className="mt-1 text-sm font-medium text-app-text">
                                    {selectedRoute.destination}
                                </p>

                                {selectedRoute.destination_latitude &&
                                    selectedRoute.destination_longitude && (
                                        <p className="mt-1 text-[11px] text-app-muted">
                                            GPS:{" "}
                                            {selectedRoute.destination_latitude}
                                            ,{" "}
                                            {
                                                selectedRoute.destination_longitude
                                            }
                                        </p>
                                    )}
                            </div>

                            {/* Distance */}
                            <div>
                                <p className="text-xs text-app-muted">
                                    Road Distance
                                </p>

                                <p className="mt-1 text-base font-semibold text-app-primary">
                                    {selectedRoute.distance_km
                                        ? `${selectedRoute.distance_km} km`
                                        : "Not calculated"}
                                </p>
                            </div>
                        </div>

                        <p className="mt-4 border-t border-app-primary/10 pt-3 text-[11px] leading-5 text-app-muted">
                            Starting location and road information are
                            automatically inherited from the selected route.
                        </p>
                    </div>
                )}
            </FormModal>

            <ConfirmModal
                show={!!endAssignment}
                onClose={() => setEndAssignment(null)}
                variant="danger"
                confirmLabel="End Assignment"
                title="End Assignment"
                message="This will free the driver and bus for a new assignment. Any active trip must be ended first."
                onConfirm={() =>
                    router.patch(
                        `/admin/assignments/${endAssignment.id}/end`,
                        {},
                        { onSuccess: () => setEndAssignment(null) },
                    )
                }
            />

            <ConfirmModal
                show={!!deleteDriverAssignment}
                onClose={() => setDeleteDriverAssignment(null)}
                variant="danger"
                confirmLabel="Delete Driver"
                title="Delete Driver"
                message={`Archive ${deleteDriverAssignment?.driver?.user?.full_name ?? "this driver"} and remove the driver from active assignments? Historical trip records will be preserved.`}
                onConfirm={() =>
                    router.patch(
                        `/admin/assignments/${deleteDriverAssignment.id}/archive-driver`,
                        {},
                        { onSuccess: () => setDeleteDriverAssignment(null) },
                    )
                }
            />
        </AuthenticatedLayout>
    );
}
