import TextInput from './TextInput';

// PH mobile number: digits only, max 11, expected to start with 09.
// Frontend prevents obviously invalid characters; backend regex is authoritative.
export default function PhoneInput({ value, onChange, ...props }) {
    const handleChange = (e) => {
        const digitsOnly = e.target.value.replace(/\D/g, '').slice(0, 11);
        onChange(digitsOnly);
    };

    return (
        <TextInput
            type="tel"
            inputMode="numeric"
            maxLength={11}
            placeholder="09XXXXXXXXX"
            value={value}
            onChange={handleChange}
            {...props}
        />
    );
}
