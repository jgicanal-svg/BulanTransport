import { useState } from "react";
import { Head, Link, useForm } from "@inertiajs/react";
import { LogIn, ShieldCheck, Eye, EyeOff } from "lucide-react";
import PrimaryButton from "@/Components/UI/PrimaryButton";

export default function Login({ status }) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: "",
        password: "",
        remember: false,
    });

    const submit = (event) => {
        event.preventDefault();

        post("/login", {
            onFinish: () => reset("password"),
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-terminal-bg px-4 py-8">
            <Head title="Login" />

            <div className="w-full max-w-sm rounded-hero border border-terminal-border bg-terminal-surface p-8 shadow-floating">
                {/* Logo / Brand */}
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
                            Digital Fleet Intelligence
                        </p>
                    </div>
                </div>

                {/* Header */}
                <h1 className="text-xl font-semibold text-terminal-text">
                    Welcome Back
                </h1>

                <p className="mb-6 mt-1 text-sm text-terminal-muted">
                    Sign in using your administrator or driver account.
                </p>

                {/* Flash / Password reset status */}
                {status && (
                    <div className="mb-4 rounded-control border border-app-success/20 bg-app-success/10 px-3 py-2 text-sm text-app-success">
                        {status}
                    </div>
                )}

                {/* Login Form */}
                <form onSubmit={submit} className="flex flex-col gap-4">
                    {/* Email */}
                    <div>
                        <label
                            htmlFor="email"
                            className="mb-1.5 block text-sm font-medium text-terminal-text"
                        >
                            Email Address
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(event) =>
                                setData("email", event.target.value)
                            }
                            autoComplete="email"
                            pattern={"[^\\s@]+@[^\\s@]+\\.[^\\s@]+"}
                            title="Enter a complete email address, for example name@example.com"
                            autoFocus
                            required
                            placeholder="Enter your email"
                            className="w-full rounded-control border border-terminal-border bg-terminal-bg px-3 py-2.5 text-sm text-terminal-text placeholder:text-terminal-muted focus:border-terminal-accent focus:outline-none focus:ring-2 focus:ring-terminal-accent/20"
                        />

                        {errors.email && (
                            <p className="mt-1.5 text-xs text-app-danger">
                                {errors.email}
                            </p>
                        )}
                    </div>

                    {/* Password */}
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={(event) =>
                                setData("password", event.target.value)
                            }
                            autoComplete="current-password"
                            required
                            placeholder="Enter your password"
                            className="w-full rounded-control border border-terminal-border bg-terminal-bg px-3 py-2.5 pr-11 text-sm text-terminal-text placeholder:text-terminal-muted focus:border-terminal-accent focus:outline-none focus:ring-2 focus:ring-terminal-accent/20"
                        />

                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            aria-label={
                                showPassword ? "Hide password" : "Show password"
                            }
                            aria-pressed={showPassword}
                            className="absolute inset-y-0 right-3 flex items-center text-terminal-muted transition hover:text-terminal-accent"
                        >
                            {showPassword ? (
                                <EyeOff size={18} />
                            ) : (
                                <Eye size={18} />
                            )}
                        </button>
                    </div>

                    {/* Remember Me */}
                    <label className="flex cursor-pointer items-center gap-2 text-xs text-terminal-muted">
                        <input
                            type="checkbox"
                            checked={data.remember}
                            onChange={(event) =>
                                setData("remember", event.target.checked)
                            }
                            className="rounded border-terminal-border text-terminal-accent focus:ring-terminal-accent"
                        />
                        Remember me
                    </label>

                    {/* Submit */}
                    <PrimaryButton
                        type="submit"
                        disabled={processing}
                        className="w-full justify-center bg-terminal-accent hover:bg-blue-600"
                    >
                        <LogIn size={16} />

                        {processing ? "Signing in..." : "Log in"}
                    </PrimaryButton>
                </form>

                {/* Access Notice */}
                <div className="mt-6 rounded-control border border-terminal-border bg-terminal-bg/50 p-3">
                    <div className="flex items-start gap-2.5">
                        <ShieldCheck
                            size={17}
                            className="mt-0.5 shrink-0 text-terminal-accent"
                        />

                        <div>
                            <p className="text-xs font-medium text-terminal-text">
                                Authorized Access
                            </p>

                            <p className="mt-1 text-[11px] leading-4 text-terminal-muted">
                                This portal is available only to Bulan Transco
                                administrators and registered drivers.
                            </p>
                        </div>
                    </div>
                </div>

                <p className="mt-5 text-center text-[11px] leading-5 text-terminal-muted">
                    Driver accounts are created and managed by the cooperative
                    administrator.
                </p>
            </div>
        </div>
    );
}
