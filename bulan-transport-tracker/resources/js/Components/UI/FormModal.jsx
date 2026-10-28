import Modal from "./Modal";
import PrimaryButton from "./PrimaryButton";
import SecondaryButton from "./SecondaryButton";

export default function FormModal({
    show,
    onClose,
    title,
    onSubmit,
    processing = false,
    children,
    size = "md",
    submitLabel = "Save",
}) {
    return (
        <Modal
            show={show}
            onClose={onClose}
            title={title}
            size={size}
            footer={
                <div className="flex justify-end gap-3">
                    <SecondaryButton
                        type="button"
                        onClick={onClose}
                        disabled={processing}
                    >
                        Cancel
                    </SecondaryButton>

                    <PrimaryButton
                        type="submit"
                        form="modal-form"
                        disabled={processing}
                    >
                        {processing ? "Saving..." : submitLabel}
                    </PrimaryButton>
                </div>
            }
        >
            <form
                id="modal-form"
                onSubmit={onSubmit}
                className="flex flex-col gap-4"
            >
                {children}
            </form>
        </Modal>
    );
}
