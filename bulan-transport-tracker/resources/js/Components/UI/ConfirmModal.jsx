import Modal from './Modal';
import PrimaryButton from './PrimaryButton';
import SecondaryButton from './SecondaryButton';
import DangerButton from './DangerButton';

// Reusable confirmation dialog used for Archive / Restore / Delete / Logout.
export default function ConfirmModal({
    show,
    onClose,
    onConfirm,
    title,
    message,
    confirmLabel = 'Confirm',
    variant = 'primary',
    processing = false,
}) {
    const ConfirmBtn = variant === 'danger' ? DangerButton : PrimaryButton;

    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size="sm"
            footer={
                <div className="flex justify-end gap-3">
                    <SecondaryButton onClick={onClose} disabled={processing}>
                        Cancel
                    </SecondaryButton>
                    <ConfirmBtn onClick={onConfirm} disabled={processing}>
                        {processing ? 'Please wait...' : confirmLabel}
                    </ConfirmBtn>
                </div>
            }
        >
            <p className="text-sm text-app-muted">{message}</p>
        </Modal>
    );
}
