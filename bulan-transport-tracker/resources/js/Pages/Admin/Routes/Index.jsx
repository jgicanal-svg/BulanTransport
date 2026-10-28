import { useState } from "react";

import { Head, Link, router, useForm } from "@inertiajs/react";

import AuthenticatedLayout from "@/Layouts/AuthenticatedLayout";

import PageHero from "@/Components/UI/PageHero";
import FormModal from "@/Components/UI/FormModal";
import ConfirmModal from "@/Components/UI/ConfirmModal";
import Modal from "@/Components/UI/Modal";
import TextInput from "@/Components/UI/TextInput";
import PrimaryButton from "@/Components/UI/PrimaryButton";

import MapPanel from "@/Components/Map/MapPanel";
import EmptyState from "@/Components/UI/EmptyState";
import Pagination from "@/Components/UI/Pagination";

import {
    Plus,
    Pencil,
    Archive,
    Navigation,
    MapPin,
    LocateFixed,
    Route as RouteIcon,
} from "lucide-react";

const emptyRoute = {
    name: "",
    code: "",

    origin: "",
    origin_latitude: "",
    origin_longitude: "",

    destination: "",
    destination_latitude: "",
    destination_longitude: "",

    description: "",
    is_active: true,

    stops: [],
};

export default function Index({ routes, filters }) {
    const [createOpen, setCreateOpen] = useState(false);

    const [editRoute, setEditRoute] = useState(null);

    const [viewRoute, setViewRoute] = useState(null);

    const [archiveRoute, setArchiveRoute] = useState(null);

    const [locatingCreate, setLocatingCreate] = useState(false);

    const [locatingEdit, setLocatingEdit] = useState(false);

    const [locationError, setLocationError] = useState("");

    const createForm = useForm({
        ...emptyRoute,
    });

    const editForm = useForm({
        ...emptyRoute,
    });

    /*
    |--------------------------------------------------------------------------
    | Open Edit
    |--------------------------------------------------------------------------
    */

    const openEdit = (route) => {
        editForm.clearErrors();

        editForm.setData({
            name: route.name ?? "",

            code: route.code ?? "",

            origin: route.origin ?? "",

            origin_latitude: route.origin_latitude ?? "",

            origin_longitude: route.origin_longitude ?? "",

            destination: route.destination ?? "",

            destination_latitude: route.destination_latitude ?? "",

            destination_longitude: route.destination_longitude ?? "",

            description: route.description ?? "",

            is_active: route.is_active ?? true,

            stops: route.stops ?? [],
        });

        setLocationError("");

        setEditRoute(route);
    };

    /*
    |--------------------------------------------------------------------------
    | GPS Location
    |--------------------------------------------------------------------------
    */

    const getCurrentLocation = (form, setLoading) => {
        setLocationError("");

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by this browser.");

            return;
        }

        setLoading(true);

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const latitude = position.coords.latitude;

                const longitude = position.coords.longitude;

                form.setData("origin_latitude", latitude.toFixed(7));

                form.setData("origin_longitude", longitude.toFixed(7));

                setLoading(false);
            },

            (error) => {
                let message = "Unable to get your current location.";

                if (error.code === error.PERMISSION_DENIED) {
                    message = "Location permission was denied.";
                }

                if (error.code === error.POSITION_UNAVAILABLE) {
                    message = "GPS location is currently unavailable.";
                }

                if (error.code === error.TIMEOUT) {
                    message = "Location request timed out.";
                }

                setLocationError(message);

                setLoading(false);
            },

            {
                enableHighAccuracy: true,

                timeout: 15000,

                maximumAge: 0,
            },
        );
    };

    /*
    |--------------------------------------------------------------------------
    | Create
    |--------------------------------------------------------------------------
    */

    const submitCreate = (event) => {
        event.preventDefault();

        createForm.post("/admin/routes", {
            preserveScroll: true,

            onSuccess: () => {
                setCreateOpen(false);

                createForm.reset();

                createForm.clearErrors();

                setLocationError("");
            },
        });
    };

    /*
    |--------------------------------------------------------------------------
    | Edit
    |--------------------------------------------------------------------------
    */

    const submitEdit = (event) => {
        event.preventDefault();

        editForm.put(`/admin/routes/${editRoute.id}`, {
            preserveScroll: true,

            onSuccess: () => {
                setEditRoute(null);

                editForm.clearErrors();

                setLocationError("");
            },
        });
    };

    return (
        <AuthenticatedLayout>
            <Head title="Route Management" />

            <PageHero
                eyebrow="Network Topology: Synced"
                title="Routes & Mapping"
                description="Define GPS-based route starting points and destinations. Road-path distance is calculated automatically."
                action={
                    <PrimaryButton
                        onClick={() => {
                            createForm.reset();

                            createForm.clearErrors();

                            setLocationError("");

                            setCreateOpen(true);
                        }}
                    >
                        <Plus size={16} />
                        Establish Route
                    </PrimaryButton>
                }
            />

            {routes.data.length === 0 ? (
                <EmptyState
                    title="No routes found"
                    description="Establish a route to get started."
                />
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {routes.data.map((route) => (
                        <div
                            key={route.id}
                            className="rounded-card border border-app-border bg-app-surface p-5"
                        >
                            <div className="mb-3 flex items-start justify-between">
                                <span className="flex h-9 w-9 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                                    <Navigation size={16} />
                                </span>

                                <div className="flex gap-1">
                                    <button
                                        type="button"
                                        onClick={() => openEdit(route)}
                                        aria-label="Edit route"
                                        className="rounded-control p-1.5 text-app-muted hover:bg-app-bg hover:text-app-primary"
                                    >
                                        <Pencil size={15} />
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setArchiveRoute(route)}
                                        aria-label="Archive route"
                                        className="rounded-control p-1.5 text-app-muted hover:bg-app-bg hover:text-app-danger"
                                    >
                                        <Archive size={15} />
                                    </button>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setViewRoute(route)}
                                className="text-left"
                            >
                                <h3 className="text-base font-semibold text-app-text hover:text-app-primary">
                                    {route.name}
                                </h3>

                                <p className="mb-4 text-xs text-app-muted">
                                    Route ID: {route.code ?? `R${route.id}`}
                                </p>
                            </button>

                            <div className="mb-1 flex items-start gap-2 text-xs">
                                <MapPin
                                    size={13}
                                    className="mt-0.5 text-app-primary"
                                />

                                <div>
                                    <p className="text-app-muted">Origin</p>

                                    <p className="font-medium text-app-text">
                                        {route.origin}
                                    </p>

                                    {route.origin_latitude &&
                                        route.origin_longitude && (
                                            <p className="mt-0.5 text-[10px] text-app-muted">
                                                {route.origin_latitude},{" "}
                                                {route.origin_longitude}
                                            </p>
                                        )}
                                </div>
                            </div>

                            <div className="my-2 ml-1.5 h-3 border-l border-app-border" />

                            <div className="mb-4 flex items-start gap-2 text-xs">
                                <MapPin
                                    size={13}
                                    className="mt-0.5 text-app-danger"
                                />

                                <div>
                                    <p className="text-app-muted">
                                        Destination
                                    </p>

                                    <p className="font-medium text-app-text">
                                        {route.destination}
                                    </p>

                                    {route.destination_latitude &&
                                        route.destination_longitude && (
                                            <p className="mt-0.5 text-[10px] text-app-muted">
                                                {route.destination_latitude},{" "}
                                                {route.destination_longitude}
                                            </p>
                                        )}
                                </div>
                            </div>

                            <div className="flex items-center justify-between border-t border-app-border pt-3 text-xs">
                                <div>
                                    <p className="text-app-muted">
                                        Road Distance
                                    </p>

                                    <p className="font-semibold text-app-text">
                                        {route.distance_km
                                            ? `${route.distance_km} km`
                                            : "—"}
                                    </p>
                                </div>

                                <div>
                                    <p className="text-app-muted">
                                        Active Fleet
                                    </p>

                                    <p className="font-semibold text-app-primary">
                                        {route.active_fleet_count ?? 0} Buses
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-4">
                <Pagination meta={routes} />
            </div>

            <div className="mt-6">
                <Link
                    href="/admin/routes/archived"
                    className="text-sm text-app-primary hover:underline"
                >
                    View Archived Routes
                </Link>
            </div>

            {/* CREATE */}

            <FormModal
                show={createOpen}
                onClose={() => {
                    setCreateOpen(false);

                    setLocationError("");
                }}
                title="Establish New Route"
                processing={createForm.processing}
                size="lg"
                onSubmit={submitCreate}
            >
                <TextInput
                    label="Route Name"
                    value={createForm.data.name}
                    onChange={(event) =>
                        createForm.setData("name", event.target.value)
                    }
                    error={createForm.errors.name}
                    required
                />

                <TextInput
                    label="Route Code"
                    value={createForm.data.code}
                    onChange={(event) =>
                        createForm.setData("code", event.target.value)
                    }
                    error={createForm.errors.code}
                    placeholder="Example: BLN-SOR"
                />

                <div className="rounded-card border border-app-border bg-app-bg/40 p-4">
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <p className="text-sm font-semibold text-app-text">
                                Initial Starting Location
                            </p>

                            <p className="mt-1 text-xs leading-5 text-app-muted">
                                This starting point will be used by the route
                                and later inherited by bus assignments.
                            </p>
                        </div>

                        <button
                            type="button"
                            disabled={locatingCreate}
                            onClick={() =>
                                getCurrentLocation(
                                    createForm,
                                    setLocatingCreate,
                                )
                            }
                            className="flex shrink-0 items-center gap-2 rounded-control border border-app-border bg-app-surface px-3 py-2 text-xs font-medium text-app-primary transition hover:border-app-primary disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            <LocateFixed size={15} />

                            {locatingCreate ? "Locating..." : "Use Current GPS"}
                        </button>
                    </div>

                    <TextInput
                        label="Origin"
                        value={createForm.data.origin}
                        onChange={(event) =>
                            createForm.setData("origin", event.target.value)
                        }
                        error={createForm.errors.origin}
                        placeholder="Example: Bulan Terminal, Sorsogon"
                        required
                    />

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput
                            label="Origin Latitude"
                            type="number"
                            step="any"
                            value={createForm.data.origin_latitude}
                            onChange={(event) =>
                                createForm.setData(
                                    "origin_latitude",
                                    event.target.value,
                                )
                            }
                            error={createForm.errors.origin_latitude}
                            required
                        />

                        <TextInput
                            label="Origin Longitude"
                            type="number"
                            step="any"
                            value={createForm.data.origin_longitude}
                            onChange={(event) =>
                                createForm.setData(
                                    "origin_longitude",
                                    event.target.value,
                                )
                            }
                            error={createForm.errors.origin_longitude}
                            required
                        />
                    </div>

                    {locationError && (
                        <p className="mt-3 text-xs text-app-danger">
                            {locationError}
                        </p>
                    )}
                </div>

                <div className="rounded-card border border-app-border bg-app-bg/40 p-4">
                    <p className="mb-4 text-sm font-semibold text-app-text">
                        Destination
                    </p>

                    <TextInput
                        label="Destination"
                        value={createForm.data.destination}
                        onChange={(event) =>
                            createForm.setData(
                                "destination",
                                event.target.value,
                            )
                        }
                        error={createForm.errors.destination}
                        placeholder="Example: Sorsogon City Terminal"
                        required
                    />

                    <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <TextInput
                            label="Destination Latitude"
                            type="number"
                            step="any"
                            value={createForm.data.destination_latitude}
                            onChange={(event) =>
                                createForm.setData(
                                    "destination_latitude",
                                    event.target.value,
                                )
                            }
                            error={createForm.errors.destination_latitude}
                            required
                        />

                        <TextInput
                            label="Destination Longitude"
                            type="number"
                            step="any"
                            value={createForm.data.destination_longitude}
                            onChange={(event) =>
                                createForm.setData(
                                    "destination_longitude",
                                    event.target.value,
                                )
                            }
                            error={createForm.errors.destination_longitude}
                            required
                        />
                    </div>
                </div>

                <div className="rounded-card border border-app-primary/20 bg-app-primary/5 p-4">
                    <div className="flex items-start gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                            <RouteIcon size={17} />
                        </span>

                        <div>
                            <p className="text-sm font-semibold text-app-text">
                                Automatic Road-Path Calculation
                            </p>

                            <p className="mt-1 text-xs leading-5 text-app-muted">
                                Distance is no longer entered manually. When you
                                save, the system calculates the drivable route
                                using the supplied GPS coordinates and stores
                                the road geometry.
                            </p>
                        </div>
                    </div>
                </div>
            </FormModal>

            {/* EDIT */}

            {editRoute && (
                <FormModal
                    show={!!editRoute}
                    onClose={() => {
                        setEditRoute(null);

                        setLocationError("");
                    }}
                    title="Edit Route"
                    processing={editForm.processing}
                    size="lg"
                    onSubmit={submitEdit}
                >
                    <TextInput
                        label="Route Name"
                        value={editForm.data.name}
                        onChange={(event) =>
                            editForm.setData("name", event.target.value)
                        }
                        error={editForm.errors.name}
                        required
                    />

                    <TextInput
                        label="Route Code"
                        value={editForm.data.code}
                        onChange={(event) =>
                            editForm.setData("code", event.target.value)
                        }
                        error={editForm.errors.code}
                    />

                    <div className="rounded-card border border-app-border bg-app-bg/40 p-4">
                        <div className="mb-4 flex items-start justify-between gap-4">
                            <div>
                                <p className="text-sm font-semibold text-app-text">
                                    Starting Location
                                </p>

                                <p className="mt-1 text-xs text-app-muted">
                                    Changing these coordinates will recalculate
                                    the road route.
                                </p>
                            </div>

                            <button
                                type="button"
                                disabled={locatingEdit}
                                onClick={() =>
                                    getCurrentLocation(
                                        editForm,
                                        setLocatingEdit,
                                    )
                                }
                                className="flex shrink-0 items-center gap-2 rounded-control border border-app-border bg-app-surface px-3 py-2 text-xs font-medium text-app-primary transition hover:border-app-primary disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <LocateFixed size={15} />

                                {locatingEdit
                                    ? "Locating..."
                                    : "Use Current GPS"}
                            </button>
                        </div>

                        <TextInput
                            label="Origin"
                            value={editForm.data.origin}
                            onChange={(event) =>
                                editForm.setData("origin", event.target.value)
                            }
                            error={editForm.errors.origin}
                            required
                        />

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TextInput
                                label="Origin Latitude"
                                type="number"
                                step="any"
                                value={editForm.data.origin_latitude}
                                onChange={(event) =>
                                    editForm.setData(
                                        "origin_latitude",
                                        event.target.value,
                                    )
                                }
                                error={editForm.errors.origin_latitude}
                                required
                            />

                            <TextInput
                                label="Origin Longitude"
                                type="number"
                                step="any"
                                value={editForm.data.origin_longitude}
                                onChange={(event) =>
                                    editForm.setData(
                                        "origin_longitude",
                                        event.target.value,
                                    )
                                }
                                error={editForm.errors.origin_longitude}
                                required
                            />
                        </div>

                        {locationError && (
                            <p className="mt-3 text-xs text-app-danger">
                                {locationError}
                            </p>
                        )}
                    </div>

                    <div className="rounded-card border border-app-border bg-app-bg/40 p-4">
                        <p className="mb-4 text-sm font-semibold text-app-text">
                            Destination
                        </p>

                        <TextInput
                            label="Destination"
                            value={editForm.data.destination}
                            onChange={(event) =>
                                editForm.setData(
                                    "destination",
                                    event.target.value,
                                )
                            }
                            error={editForm.errors.destination}
                            required
                        />

                        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <TextInput
                                label="Destination Latitude"
                                type="number"
                                step="any"
                                value={editForm.data.destination_latitude}
                                onChange={(event) =>
                                    editForm.setData(
                                        "destination_latitude",
                                        event.target.value,
                                    )
                                }
                                error={editForm.errors.destination_latitude}
                                required
                            />

                            <TextInput
                                label="Destination Longitude"
                                type="number"
                                step="any"
                                value={editForm.data.destination_longitude}
                                onChange={(event) =>
                                    editForm.setData(
                                        "destination_longitude",
                                        event.target.value,
                                    )
                                }
                                error={editForm.errors.destination_longitude}
                                required
                            />
                        </div>
                    </div>

                    <div className="rounded-card border border-app-primary/20 bg-app-primary/5 p-4">
                        <div className="flex items-center gap-3">
                            <RouteIcon size={18} className="text-app-primary" />

                            <div>
                                <p className="text-sm font-semibold text-app-text">
                                    Current Road Distance
                                </p>

                                <p className="mt-1 text-lg font-semibold text-app-primary">
                                    {editRoute.distance_km
                                        ? `${editRoute.distance_km} km`
                                        : "Not calculated yet"}
                                </p>

                                <p className="mt-1 text-xs text-app-muted">
                                    Saving will automatically recalculate this
                                    value.
                                </p>
                            </div>
                        </div>
                    </div>
                </FormModal>
            )}

            {/* VIEW */}

            {viewRoute && (
                <Modal
                    show={!!viewRoute}
                    onClose={() => setViewRoute(null)}
                    title={viewRoute.name}
                    size="lg"
                >
                    <div className="mb-4 grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
                        <div>
                            <dt className="text-app-muted">Origin</dt>

                            <dd className="font-medium text-app-text">
                                {viewRoute.origin}
                            </dd>

                            <dd className="mt-1 text-xs text-app-muted">
                                {viewRoute.origin_latitude ?? "—"},{" "}
                                {viewRoute.origin_longitude ?? "—"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-app-muted">Destination</dt>

                            <dd className="font-medium text-app-text">
                                {viewRoute.destination}
                            </dd>

                            <dd className="mt-1 text-xs text-app-muted">
                                {viewRoute.destination_latitude ?? "—"},{" "}
                                {viewRoute.destination_longitude ?? "—"}
                            </dd>
                        </div>

                        <div>
                            <dt className="text-app-muted">
                                Road-Path Distance
                            </dt>

                            <dd className="font-semibold text-app-primary">
                                {viewRoute.distance_km
                                    ? `${viewRoute.distance_km} km`
                                    : "—"}
                            </dd>
                        </div>
                    </div>

                    <MapPanel height={280} routes={[viewRoute]} vehicles={[]} />
                </Modal>
            )}

            <ConfirmModal
                show={!!archiveRoute}
                onClose={() => setArchiveRoute(null)}
                variant="danger"
                confirmLabel="Archive"
                title="Archive Route"
                message={`Archive route "${archiveRoute?.name}"?`}
                onConfirm={() =>
                    router.patch(
                        `/admin/routes/${archiveRoute.id}/archive`,
                        {},
                        {
                            preserveScroll: true,

                            onSuccess: () => setArchiveRoute(null),
                        },
                    )
                }
            />
        </AuthenticatedLayout>
    );
}
