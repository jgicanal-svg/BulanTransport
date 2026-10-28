import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { ArrowLeft, Eye, EyeOff, Truck, UserPlus } from "lucide-react";
import PrimaryButton from "@/Components/UI/PrimaryButton";

const sanitizeName = (value) => {
    return value.replace(/[^\p{L}\s]/gu, "");
};

const sanitizePhone = (value) => {
    return value.replace(/\D/g, "").slice(0, 11);
};

export default function Register() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);

    const { data, setData, post, processing, errors } = useForm({
        first_name: "",
        middle_name: "",
        last_name: "",
        email: "",
        contact_number: "",
        password: "",
        password_confirmation: "",
    });

    const submit = (event) => {
        event.preventDefault();

        post("/register");
    };

    return (
        <div className="min-h-screen bg-terminal-bg px-4 py-8">
            <Head title="Passenger Registration" />

            <div className="mx-auto w-full max-w-lg">
                <Link
                    href="/login"
                    className="mb-4 inline-flex items-center gap-2 text-xs text-terminal-muted transition hover:text-terminal-text"
                >
                    <ArrowLeft size={14} />
                    Back to login
                </Link>

                <div className="rounded-hero border border-terminal-border bg-terminal-surface p-6 shadow-floating sm:p-8">
                    <div className="mb-7 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-control bg-terminal-bg">
                            <img
                                src="/images/logo.jfif"
                                alt="Bulan Transco"
                                className="h-full w-full object-cover"
                            />
                        </span>

                        <div>
                            <p className="text-sm font-semibold leading-none text-terminal-text">
                                Bulan
                                <span className="text-terminal-accent">
                                    Transco.
                                </span>
                            </p>

                            <p className="mt-1 text-[10px] uppercase tracking-wide text-terminal-muted">
                                Passenger Portal
                            </p>
                        </div>
                    </div>

                    <h1 className="text-xl font-semibold text-terminal-text">
                        Create Passenger Account
                    </h1>

                    <p className="mb-6 mt-1 text-sm text-terminal-muted">
                        Register to access the passenger dashboard and live trip
                        tracking.
                    </p>

                    <form onSubmit={submit} className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <FormInput
                                id="first_name"
                                label="First Name"
                                value={data.first_name}
                                onChange={(event) =>
                                    setData(
                                        "first_name",
                                        sanitizeName(event.target.value),
                                    )
                                }
                                error={errors.first_name}
                                autoComplete="given-name"
                                required
                            />

                            <FormInput
                                id="last_name"
                                label="Last Name"
                                value={data.last_name}
                                onChange={(event) =>
                                    setData(
                                        "last_name",
                                        sanitizeName(event.target.value),
                                    )
                                }
                                error={errors.last_name}
                                autoComplete="family-name"
                                required
                            />
                        </div>

                        <FormInput
                            id="middle_name"
                            label="Middle Name"
                            optional
                            value={data.middle_name}
                            onChange={(event) =>
                                setData(
                                    "middle_name",
                                    sanitizeName(event.target.value),
                                )
                            }
                            error={errors.middle_name}
                            autoComplete="additional-name"
                        />

                        <FormInput
                            id="email"
                            label="Email Address"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData("email", event.target.value)
                            }
                            error={errors.email}
                            autoComplete="email"
                            placeholder="Enter your email"
                            required
                        />

                        <FormInput
                            id="contact_number"
                            label="Contact Number"
                            type="tel"
                            inputMode="numeric"
                            value={data.contact_number}
                            onChange={(event) =>
                                setData(
                                    "contact_number",
                                    sanitizePhone(event.target.value),
                                )
                            }
                            error={errors.contact_number}
                            autoComplete="tel"
                            placeholder="09XXXXXXXXX"
                            maxLength={11}
                            required
                        />

                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <PasswordField
                                id="password"
                                label="Password"
                                value={data.password}
                                onChange={(event) =>
                                    setData("password", event.target.value)
                                }
                                error={errors.password}
                                visible={showPassword}
                                onToggle={() =>
                                    setShowPassword((current) => !current)
                                }
                                autoComplete="new-password"
                            />

                            <PasswordField
                                id="password_confirmation"
                                label="Confirm Password"
                                value={data.password_confirmation}
                                onChange={(event) =>
                                    setData(
                                        "password_confirmation",
                                        event.target.value,
                                    )
                                }
                                error={errors.password_confirmation}
                                visible={showConfirmation}
                                onToggle={() =>
                                    setShowConfirmation((current) => !current)
                                }
                                autoComplete="new-password"
                            />
                        </div>

                        <p className="text-[11px] leading-5 text-terminal-muted">
                            Password must contain at least eight characters,
                            including letters, numbers, and symbols.
                        </p>

                        <PrimaryButton
                            type="submit"
                            disabled={processing}
                            className="w-full justify-center bg-terminal-accent hover:bg-blue-600"
                        >
                            <UserPlus size={16} />

                            {processing
                                ? "Creating account..."
                                : "Create Passenger Account"}
                        </PrimaryButton>
                    </form>

                    <p className="mt-6 text-center text-xs text-terminal-muted">
                        Already have an account?{" "}
                        <Link
                            href="/login"
                            className="font-medium text-terminal-accent hover:underline"
                        >
                            Log in
                        </Link>
                    </p>

                    <p className="mt-3 text-center text-[10px] text-terminal-muted">
                        Public registration creates passenger accounts only.
                    </p>
                </div>
            </div>
        </div>
    );
}

function FormInput({
    id,
    label,
    optional = false,
    error,
    type = "text",
    ...props
}) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-terminal-text"
            >
                {label}

                {optional && (
                    <span className="ml-1 font-normal text-terminal-muted">
                        (optional)
                    </span>
                )}
            </label>

            <input
                id={id}
                type={type}
                className={`w-full rounded-control border bg-terminal-bg px-3 py-2.5 text-sm text-terminal-text placeholder:text-terminal-muted focus:outline-none focus:ring-2 ${
                    error
                        ? "border-app-danger focus:border-app-danger focus:ring-app-danger/20"
                        : "border-terminal-border focus:border-terminal-accent focus:ring-terminal-accent/20"
                }`}
                {...props}
            />

            {error && <p className="mt-1 text-xs text-app-danger">{error}</p>}
        </div>
    );
}

function PasswordField({ id, label, error, visible, onToggle, ...props }) {
    return (
        <div>
            <label
                htmlFor={id}
                className="mb-1.5 block text-sm font-medium text-terminal-text"
            >
                {label}
            </label>

            <div className="relative">
                <input
                    id={id}
                    type={visible ? "text" : "password"}
                    required
                    className={`w-full rounded-control border bg-terminal-bg px-3 py-2.5 pr-10 text-sm text-terminal-text placeholder:text-terminal-muted focus:outline-none focus:ring-2 ${
                        error
                            ? "border-app-danger focus:border-app-danger focus:ring-app-danger/20"
                            : "border-terminal-border focus:border-terminal-accent focus:ring-terminal-accent/20"
                    }`}
                    {...props}
                />

                <button
                    type="button"
                    onClick={onToggle}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-terminal-muted transition hover:text-terminal-text"
                    aria-label={
                        visible
                            ? `Hide ${label.toLowerCase()}`
                            : `Show ${label.toLowerCase()}`
                    }
                >
                    {visible ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
            </div>

            {error && <p className="mt-1 text-xs text-app-danger">{error}</p>}
        </div>
    );
}
