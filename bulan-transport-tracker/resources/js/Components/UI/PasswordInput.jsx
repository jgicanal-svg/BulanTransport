import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import TextInput from './TextInput';

export default function PasswordInput({ id, label, error, value, onChange, ...props }) {
    const [visible, setVisible] = useState(false);

    return (
        <div className="relative">
            <TextInput
                id={id}
                label={label}
                error={error}
                type={visible ? 'text' : 'password'}
                value={value}
                onChange={onChange}
                {...props}
            />
            <button
                type="button"
                onClick={() => setVisible((v) => !v)}
                aria-label={visible ? 'Hide password' : 'Show password'}
                className="absolute right-3 top-[34px] text-app-muted hover:text-app-text"
            >
                {visible ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
        </div>
    );
}
