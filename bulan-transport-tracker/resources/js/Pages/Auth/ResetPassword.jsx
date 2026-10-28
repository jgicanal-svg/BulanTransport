import { useForm, Head } from '@inertiajs/react';
import PasswordInput from '@/Components/UI/PasswordInput';
import PrimaryButton from '@/Components/UI/PrimaryButton';
import { Truck } from 'lucide-react';

export default function ResetPassword({ token, email }) {
    const { data, setData, post, processing, errors } = useForm({ token, email, password: '', password_confirmation: '' });

    const submit = (e) => {
        e.preventDefault();
        post('/reset-password');
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-terminal-bg px-4">
            <Head title="Reset Password" />
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

                <h1 className="mb-1 text-lg font-semibold text-terminal-text">Reset Password</h1>
                <p className="mb-6 text-sm text-terminal-muted">Choose a new password for {email}.</p>

                <form onSubmit={submit} className="flex flex-col gap-4">
                    <div>
                        <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-terminal-text">Email</label>
                        <input
                            id="email" type="email" value={data.email} readOnly
                            onChange={(e) => setData('email', e.target.value)}
                            className="w-full rounded-control border border-terminal-border bg-terminal-bg px-3 py-2 text-sm text-terminal-muted"
                        />
                        {errors.email && <p className="mt-1 text-xs text-app-danger">{errors.email}</p>}
                    </div>

                    <PasswordInput id="password" label="New Password" value={data.password} onChange={(e) => setData('password', e.target.value)} error={errors.password} required />
                    <PasswordInput id="password_confirmation" label="Confirm New Password" value={data.password_confirmation} onChange={(e) => setData('password_confirmation', e.target.value)} error={errors.password_confirmation} required />

                    <PrimaryButton type="submit" disabled={processing} className="w-full bg-terminal-accent hover:bg-blue-600">
                        {processing ? 'Resetting...' : 'Reset Password'}
                    </PrimaryButton>
                </form>
            </div>
        </div>
    );
}
