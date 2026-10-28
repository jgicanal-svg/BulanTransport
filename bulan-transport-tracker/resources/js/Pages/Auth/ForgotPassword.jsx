import { useForm, Head, Link } from '@inertiajs/react';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import { Truck, Mail } from 'lucide-react';

export default function ForgotPassword({ status }) {
    const { data, setData, post, processing, errors } = useForm({ email: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/forgot-password');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-terminal-bg px-4">
            <Head title="Forgot Password" />
            <div className="w-full max-w-sm rounded-hero border border-terminal-border bg-terminal-surface p-8 shadow-floating">
                <div className="mb-6 flex items-center gap-2.5">
                    <span className="flex h-10 w-10 items-center justify-center rounded-control bg-terminal-accent/20 text-terminal-accent">
                        <Truck size={20} />
                    </span>
                    <div>
                        <p className="text-sm font-semibold leading-none text-terminal-text">Bulan<span className="text-terminal-accent">Transco.</span></p>
                        <p className="mt-1 text-[10px] uppercase tracking-wide text-terminal-muted">Digital Fleet Intelligence</p>
                    </div>
                </div>

                <span className="mb-4 flex h-10 w-10 items-center justify-center rounded-control bg-terminal-accent/10 text-terminal-accent">
                    <Mail size={18} />
                </span>
                <h1 className="mb-1 text-lg font-semibold text-terminal-text">Forgot your password?</h1>
                <p className="mb-6 text-sm text-terminal-muted">
                    Enter your email and we'll send you a link to reset your password.
                </p>

                {status && <div className="mb-4 rounded-control bg-app-success/10 px-3 py-2 text-sm text-app-success">{status}</div>}

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-terminal-text">Email</label>
                        <input
                            id="email" type="email" autoFocus required value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-control border border-terminal-border bg-terminal-bg px-3 py-2 text-sm text-terminal-text placeholder:text-terminal-muted focus:border-terminal-accent focus:outline-none focus:ring-2 focus:ring-terminal-accent/20"
                        />
                        {errors.email && <p className="mt-1 text-xs text-app-danger">{errors.email}</p>}
                    </div>

                    <PrimaryButton type="submit" disabled={processing} className="w-full bg-terminal-accent hover:bg-blue-600">
                        {processing ? 'Sending...' : 'Email Password Reset Link'}
                    </PrimaryButton>
                </form>

                <p className="mt-6 text-center text-xs text-terminal-muted">
                    <Link href="/login" className="text-terminal-accent hover:underline">Back to login</Link>
                </p>
            </div>
        </div>
    );
}
