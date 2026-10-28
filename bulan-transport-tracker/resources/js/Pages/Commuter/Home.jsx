import { Head, Link } from "@inertiajs/react";
import { useState } from "react";
import MarketingLayout from "@/Layouts/MarketingLayout";
import PrimaryButton from "@/Components/UI/PrimaryButton";
import SecondaryButton from "@/Components/UI/SecondaryButton";
import TextInput from "@/Components/UI/TextInput";
import {
    Zap,
    ShieldCheck,
    MapPin as MapPinIcon,
    Map as MapIcon,
    Clock,
    Phone,
    Mail,
    Send,
    Info,
} from "lucide-react";

const FEATURES = [
    {
        icon: Zap,
        title: "Air-Conditioned",
        desc: "Beat the heat during your travels.",
    },
    {
        icon: ShieldCheck,
        title: "Guaranteed Safety",
        desc: "Drivers trained for passenger safety.",
    },
    {
        icon: MapPinIcon,
        title: "Any Destination",
        desc: "Reliable stops along the route.",
    },
    {
        icon: MapIcon,
        title: "Round Trip",
        desc: "Consistent return trips daily.",
    },
];

const FAQS = [
    {
        q: "How accurate is the live tracking?",
        a: "Our buses transmit GPS updates every few seconds while a trip is active, so the live map reflects each bus\u2019s current position closely.",
    },
    {
        q: "What are the requirements for discounted fares?",
        a: "Senior citizens, students, and PWDs must present a valid ID to the conductor upon boarding to avail of the discounted fare.",
    },
    {
        q: "Do you offer private rentals for group trips?",
        a: "Yes - we cater to family reunions, school trips, and corporate events. Contact our office for a formal quote.",
    },
    {
        q: "What happens if a bus is delayed?",
        a: "The admin dashboard flags stale/inactive vehicles automatically, and the live status on the commuter map reflects the bus\u2019s current position and status.",
    },
];

// Informational only - fares are DISPLAYED, not processed. No checkout or
// payment flow exists anywhere in this app (electronic fare collection is
// explicitly out of scope per SCOPE_GUARDRAILS.md).
export default function Home({ stats }) {
    const [contact, setContact] = useState({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [sent, setSent] = useState(false);

    const submitContact = (e) => {
        e.preventDefault();
        // No backend contact-message endpoint exists yet in this MVP scope;
        // this is a lightweight mailto fallback so the form is still usable.
        window.location.href = `mailto:b.bultrasco@yahoo.com?subject=${encodeURIComponent(contact.subject || "Inquiry")}&body=${encodeURIComponent(`${contact.message}\n\n- ${contact.name} (${contact.email})`)}`;
        setSent(true);
    };

    return (
        <MarketingLayout>
            <Head title="BulanTransco - Digital Fleet Intelligence" />

            {/* Hero */}
            <section
                id="home"
                className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-8 px-6 py-10 lg:grid-cols-2 lg:py-14"
            >
                <div>
                    <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-app-primary/10 px-3 py-1 text-xs font-semibold text-app-primary">
                        <span className="h-1.5 w-1.5 rounded-full bg-app-primary" />{" "}
                        Next Gen Public Transit
                    </span>
                    <h1 className="text-5xl font-extrabold leading-tight text-app-text sm:text-6xl">
                        Bulan
                        <br />
                        <span className="text-app-primary">Transco.</span>
                    </h1>
                    <p className="mt-5 max-w-md text-app-muted">
                        Modernizing the Bulan - Sorsogon City journey with
                        precision telematics, safety-first engineering, and
                        real-time transit intelligence.
                    </p>
                    <div className="mt-8 flex flex-wrap gap-3">
                        <Link href="/live-buses">
                            <PrimaryButton>Start Tracking</PrimaryButton>
                        </Link>
                        <a href="#about">
                            <SecondaryButton>Fleet Directory</SecondaryButton>
                        </a>
                    </div>

                    <div className="mt-10 flex gap-10 border-t border-app-border pt-6">
                        <div>
                            <p className="text-2xl font-bold text-app-text">
                                1.2s
                            </p>
                            <p className="text-xs text-app-muted">
                                GPS Polling
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-app-text">
                                {stats.active_fleet}+
                            </p>
                            <p className="text-xs text-app-muted">
                                Active Fleet
                            </p>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-app-text">
                                99%
                            </p>
                            <p className="text-xs text-app-muted">
                                Reliability
                            </p>
                        </div>
                    </div>
                </div>

                <div className="relative flex h-72 items-center justify-center overflow-hidden rounded-hero bg-white text-white shadow-floating lg:h-80">
                    <img
                        src="/images/splash.jfif"
                        alt="Bulan Transco modern cooperative bus"
                        className="absolute inset-0 h-full w-full object-contain"
                    />

                    <div className="absolute bottom-6 left-6 right-6 flex items-center gap-3 rounded-control bg-white/95 px-4 py-3 text-app-text shadow-floating">
                        <span className="flex h-9 w-9 items-center justify-center rounded-control bg-app-primary text-white">
                            <Clock size={16} />
                        </span>

                        <div>
                            <p className="text-[10px] uppercase tracking-wide text-app-muted">
                                Morning Dispatch
                            </p>

                            <p className="text-sm font-semibold">
                                5:00 AM Departure
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* About / Schedule / Fares */}
            <section id="about" className="bg-app-surface px-6 py-16">
                <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 lg:grid-cols-3">
                    <div>
                        <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                            <Info size={18} />
                        </span>
                        <h2 className="mb-3 text-2xl font-bold text-app-text">
                            About Our Route
                        </h2>
                        <p className="mb-4 text-sm text-app-muted">
                            A public modern jeepney transport via{" "}
                            <strong className="text-app-text">
                                Bulan-Sorsogon City Route
                            </strong>
                            . Our main office is located at{" "}
                            <strong className="text-app-text">
                                De Vera St. Zone 6, Bulan, Sorsogon
                            </strong>
                            .
                        </p>
                        <div className="flex items-center gap-2 text-sm text-app-text">
                            <Phone size={14} className="text-app-primary" />{" "}
                            0964 170 9298
                        </div>
                        <a
                            href="mailto:b.bultrasco@yahoo.com"
                            className="mt-1 flex items-center gap-2 text-sm text-app-text hover:text-app-primary hover:underline"
                        >
                            <Mail size={14} className="text-app-primary" />{" "}
                            b.bultrasco@yahoo.com
                        </a>
                    </div>

                    <div className="rounded-card border border-app-border bg-app-bg p-5">
                        <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold text-app-text">
                            <Clock size={15} className="text-app-primary" />{" "}
                            Schedule
                        </h3>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-app-muted">
                            First Trip
                        </p>
                        <div className="mb-3 flex justify-between text-sm">
                            <span className="text-app-muted">
                                Bulan to Sorsogon
                            </span>
                            <span className="font-semibold text-app-primary">
                                5:00 AM
                            </span>
                        </div>
                        <div className="mb-4 flex justify-between text-sm">
                            <span className="text-app-muted">
                                Sorsogon to Bulan
                            </span>
                            <span className="font-semibold text-app-primary">
                                6:00 AM
                            </span>
                        </div>
                        <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-app-muted">
                            Last Trip
                        </p>
                        <div className="mb-3 flex justify-between text-sm">
                            <span className="text-app-muted">
                                Bulan to Sorsogon
                            </span>
                            <span className="font-semibold text-app-primary">
                                3:00 PM
                            </span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-app-muted">
                                Sorsogon to Bulan
                            </span>
                            <span className="font-semibold text-app-primary">
                                5:00 PM
                            </span>
                        </div>
                    </div>

                    <div>
                        <div className="mb-4 rounded-card border border-app-border bg-app-bg p-5">
                            <h3 className="mb-4 text-sm font-semibold text-app-text">
                                Bus Fares{" "}
                                <span className="font-normal text-app-muted">
                                    (informational)
                                </span>
                            </h3>
                            <div className="mb-3 flex justify-between">
                                <span className="text-sm text-app-muted">
                                    Regular Rate
                                </span>
                                <span className="text-lg font-bold text-app-primary">
                                    ₱145
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-app-muted">
                                    Discounted{" "}
                                    <span className="block text-[10px]">
                                        Senior, Student, PWD
                                    </span>
                                </span>
                                <span className="text-lg font-bold text-app-text">
                                    ₱115
                                </span>
                            </div>
                        </div>
                        <div className="rounded-card bg-app-warn px-5 py-4 text-white">
                            <p className="text-xs font-semibold">Inquiries?</p>
                            <p className="text-sm">Call us at 0964 170 9298</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Quality features */}
            <section className="px-6 py-16">
                <div className="mx-auto max-w-6xl text-center">
                    <h2 className="text-3xl font-bold text-app-text">
                        Quality Service Guaranteed
                    </h2>
                    <p className="mt-2 text-app-muted">
                        Premium transport features for the modern commuter.
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((f) => (
                            <div
                                key={f.title}
                                className="rounded-card border border-app-border bg-app-surface p-6"
                            >
                                <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                                    <f.icon size={22} />
                                </span>
                                <h3 className="font-semibold text-app-text">
                                    {f.title}
                                </h3>
                                <p className="mt-1 text-xs text-app-muted">
                                    {f.desc}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* FAQ */}
            <section className="bg-app-surface px-6 py-16">
                <div className="mx-auto max-w-3xl text-center">
                    <h2 className="text-3xl font-bold text-app-text">
                        Frequently Asked Questions
                    </h2>
                    <p className="mt-2 text-app-muted">
                        Everything you need to know about our services.
                    </p>

                    <div className="mt-10 flex flex-col gap-3 text-left">
                        {FAQS.map((f) => (
                            <div
                                key={f.q}
                                className="rounded-card bg-app-bg p-5"
                            >
                                <p className="mb-1 flex items-center gap-2 text-sm font-semibold text-app-text">
                                    <span className="h-1.5 w-1.5 rounded-full bg-app-primary" />{" "}
                                    {f.q}
                                </p>
                                <p className="border-l-2 border-app-border pl-4 text-sm text-app-muted">
                                    {f.a}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact */}
            <section id="contact" className="px-6 py-16">
                <div className="mx-auto max-w-5xl text-center">
                    <span className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-control bg-app-primary/10 text-app-primary">
                        <Mail size={20} />
                    </span>
                    <h2 className="text-4xl font-bold text-app-text">
                        Get in <span className="text-app-primary">Touch.</span>
                    </h2>
                    <p className="mx-auto mt-3 max-w-lg text-app-muted">
                        Have questions about our schedule, rentals, or feedback?
                        Our team is standing by to assist you.
                    </p>

                    <div className="mt-10 grid grid-cols-1 gap-6 text-left lg:grid-cols-[280px_1fr]">
                        <div className="flex flex-col gap-3">
                            <div className="rounded-card border border-app-border bg-app-surface p-4">
                                <p className="text-[10px] uppercase tracking-wide text-app-muted">
                                    Email
                                </p>
                                <a
                                    href="mailto:b.bultrasco@yahoo.com"
                                    className="text-sm font-semibold text-app-text hover:text-app-primary hover:underline"
                                >
                                    b.bultrasco@yahoo.com
                                </a>
                            </div>
                            <div className="rounded-card border border-app-border bg-app-surface p-4">
                                <p className="text-[10px] uppercase tracking-wide text-app-muted">
                                    Phone
                                </p>
                                <p className="text-sm font-semibold text-app-text">
                                    0964 170 9298
                                </p>
                            </div>
                            <div className="rounded-card border border-app-border bg-app-surface p-4">
                                <p className="text-[10px] uppercase tracking-wide text-app-muted">
                                    Office
                                </p>
                                <p className="text-sm font-semibold text-app-text">
                                    De Vera St. Zone 6, Bulan, Sorsogon
                                </p>
                            </div>
                        </div>

                        <form
                            onSubmit={submitContact}
                            className="rounded-card border border-app-border bg-app-surface p-6"
                        >
                            <div className="mb-4 grid grid-cols-2 gap-4">
                                <TextInput
                                    label="Your Name"
                                    value={contact.name}
                                    onChange={(e) =>
                                        setContact({
                                            ...contact,
                                            name: e.target.value,
                                        })
                                    }
                                    required
                                />
                                <TextInput
                                    label="Email Address"
                                    type="email"
                                    value={contact.email}
                                    onChange={(e) =>
                                        setContact({
                                            ...contact,
                                            email: e.target.value,
                                        })
                                    }
                                    required
                                />
                            </div>
                            <div className="mb-4">
                                <TextInput
                                    label="Subject"
                                    value={contact.subject}
                                    onChange={(e) =>
                                        setContact({
                                            ...contact,
                                            subject: e.target.value,
                                        })
                                    }
                                />
                            </div>
                            <div className="mb-4">
                                <label className="mb-1.5 block text-sm font-medium text-app-text">
                                    Message
                                </label>
                                <textarea
                                    rows={4}
                                    value={contact.message}
                                    onChange={(e) =>
                                        setContact({
                                            ...contact,
                                            message: e.target.value,
                                        })
                                    }
                                    className="w-full rounded-control border border-app-border bg-app-surface px-3 py-2 text-sm text-app-text focus:border-app-primary focus:outline-none focus:ring-2 focus:ring-app-primary/20"
                                />
                            </div>
                            <PrimaryButton type="submit" className="w-full">
                                <Send size={15} />{" "}
                                {sent
                                    ? "Message Ready in Mail App"
                                    : "Send Message"}
                            </PrimaryButton>
                        </form>
                    </div>
                </div>
            </section>
        </MarketingLayout>
    );
}
