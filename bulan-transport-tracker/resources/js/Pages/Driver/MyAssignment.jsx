import { Head, Link, useForm } from "@inertiajs/react";
import DriverLayout from "@/Layouts/DriverLayout";
import StatusBadge from "@/Components/UI/StatusBadge";
import EmptyState from "@/Components/UI/EmptyState";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import {
    Bus as BusIcon,
    Route as RouteIcon,
    Radio,
    FileWarning,
} from "lucide-react";
import SelectInput from "@/Components/UI/SelectInput";

export default function MyAssignment({
    assignment,
    activeTrip,
    weeklyTripCount,
    weeklyReport,
    reportWeek,
    directionName,
}) {
    const reportForm = useForm({
        reason: weeklyReport?.reason ?? "",

        remarks: weeklyReport?.remarks ?? "",
    });

    const submitNoTravelReport = (event) => {
        event.preventDefault();

        if (
            reportForm.data.reason === "Other" &&
            !reportForm.data.remarks.trim()
        ) {
            reportForm.setError(
                "remarks",
                "Please provide an explanation when selecting Other.",
            );
            return;
        }

        reportForm.clearErrors("remarks");
        reportForm.post("/driver/assignment/no-travel-report", {
            preserveScroll: true,
        });
    };
    return (
        <DriverLayout title="My Assignment">
            <Head title="My Assignment" />

            {!assignment ? (
                <EmptyState
                    title="No active assignment"
                    description="Contact the administrator to be assigned a bus and route."
                />
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="rounded-hero bg-gradient-to-br from-terminal-bg to-terminal-surface p-5 text-white">
                        <p className="mb-1 flex items-center gap-1.5 text-[11px] uppercase tracking-wide text-terminal-accent">
                            <span className="h-1.5 w-1.5 rounded-full bg-terminal-accent" />{" "}
                            Current Assignment
                        </p>
                        <h2 className="text-xl font-bold">
                            {assignment.bus?.bus_number}
                        </h2>
                        <p className="text-sm text-terminal-muted">
                            {directionName ?? assignment.route?.name}
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div className="rounded-card border border-app-border bg-app-surface p-4">
                            <BusIcon
                                size={18}
                                className="mb-2 text-app-primary"
                            />
                            <p className="text-xs text-app-muted">Bus</p>
                            <p className="text-sm font-semibold text-app-text">
                                {assignment.bus?.bus_number}
                            </p>
                        </div>
                        <div className="rounded-card border border-app-border bg-app-surface p-4">
                            <RouteIcon
                                size={18}
                                className="mb-2 text-app-accent"
                            />
                            <p className="text-xs text-app-muted">Route</p>
                            <p className="text-sm font-semibold text-app-text">
                                {directionName ?? assignment.route?.name}
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center justify-between rounded-card border border-app-border bg-app-surface p-4">
                        <span className="flex items-center gap-2 text-sm text-app-text">
                            <Radio size={16} className="text-app-primary" />{" "}
                            Trip Status
                        </span>
                        <StatusBadge
                            status={activeTrip ? "ACTIVE" : "PENDING"}
                        />
                    </div>

                    {(
                        <div className="rounded-card border border-app-border bg-app-surface p-4">
                            <div className="mb-4 flex items-start gap-3">
                                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-app-warning/10 text-app-warning">
                                    <FileWarning size={18} />
                                </span>

                                <div>
                                    <p className="text-sm font-semibold text-app-text">
                                        Weekly Driver Report
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-app-muted">
                                        {weeklyTripCount > 0
                                            ? `${weeklyTripCount} trip(s) recorded this week for ${assignment.bus?.bus_number}.`
                                            : `No trips recorded this week for ${assignment.bus?.bus_number}.`} {reportWeek}.
                                    </p>
                                </div>
                            </div>

                            {weeklyReport && (
                                <div className="mb-4 rounded-control border border-app-success/20 bg-app-success/10 px-3 py-2">
                                    <p className="text-xs font-medium text-app-success">
                                        Report already submitted for{" "}
                                        {reportWeek}. You may update it if
                                        necessary.
                                    </p>
                                </div>
                            )}

                            <form
                                onSubmit={submitNoTravelReport}
                                className="flex flex-col gap-4"
                            >
                                <SelectInput
                                    label="Weekly Activity / Reason"
                                    value={reportForm.data.reason}
                                    onChange={(event) =>
                                        reportForm.setData(
                                            "reason",
                                            event.target.value,
                                        )
                                    }
                                    error={reportForm.errors.reason}
                                    required
                                >
                                    <option value="">Select reason</option>

                                    <option value="Trips Operated Normally">Trips Operated Normally</option>
                                    <option value="Vehicle Maintenance">
                                        Vehicle Maintenance
                                    </option>

                                    <option value="Mechanical Issue">
                                        Mechanical Issue
                                    </option>

                                    <option value="No Assignment">
                                        No Assignment
                                    </option>

                                    <option value="Driver Unavailable">
                                        Driver Unavailable
                                    </option>

                                    <option value="Route Suspended">
                                        Route Suspended
                                    </option>

                                    <option value="Weather / Road Condition">
                                        Weather / Road Condition
                                    </option>

                                    <option value="Other">Other</option>
                                </SelectInput>

                                <div>
                                    <label className="mb-1.5 block text-sm font-medium text-app-text">
                                        Additional Remarks
                                    </label>

                                    <textarea
                                        rows={3}
                                        value={reportForm.data.remarks}
                                        onChange={(event) =>
                                            reportForm.setData(
                                                "remarks",
                                                event.target.value,
                                            )
                                        }
                                        placeholder="Provide additional details..."
                                        className="w-full rounded-control border border-app-border bg-app-bg px-3 py-2.5 text-sm text-app-text focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20"
                                    />

                                    {reportForm.errors.remarks && (
                                        <p className="mt-1 text-xs text-app-danger">
                                            {reportForm.errors.remarks}
                                        </p>
                                    )}
                                </div>

                                <PrimaryButton
                                    type="submit"
                                    disabled={reportForm.processing}
                                    className="w-full justify-center"
                                >
                                    {reportForm.processing
                                        ? "Submitting..."
                                        : weeklyReport
                                          ? "Update Report"
                                          : "Submit Report"}
                                </PrimaryButton>
                            </form>
                        </div>
                    )}

                    <Link href="/driver/tracking">
                        <PrimaryButton className="w-full">
                            Go to Tracking
                        </PrimaryButton>
                    </Link>
                </div>
            )}
        </DriverLayout>
    );
}
