import { Fragment, useEffect, useRef } from "react";
import { X } from "lucide-react";

export default function Modal({
    show,
    onClose,
    title,
    children,
    footer,
    size = "md",
}) {
    const dialogRef = useRef(null);
    const onCloseRef = useRef(onClose);
    const previouslyFocusedRef = useRef(null);

    const widths = {
        sm: "max-w-sm",
        md: "max-w-lg",
        lg: "max-w-2xl",
        xl: "max-w-4xl",
    };

    /*
     * Keep the latest onClose callback without restarting the
     * focus-management effect whenever the parent rerenders.
     */
    useEffect(() => {
        onCloseRef.current = onClose;
    }, [onClose]);

    /*
     * This effect only runs when the modal opens or closes.
     * Typing inside a controlled input will no longer reset focus.
     */
    useEffect(() => {
        if (!show) {
            return;
        }

        previouslyFocusedRef.current = document.activeElement;

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                event.preventDefault();
                onCloseRef.current?.();
            }
        };

        document.addEventListener("keydown", handleKeyDown);

        const focusTimer = window.setTimeout(() => {
            const firstInput = dialogRef.current?.querySelector(
                [
                    "[data-autofocus]",
                    'input:not([disabled]):not([type="hidden"])',
                    "select:not([disabled])",
                    "textarea:not([disabled])",
                    "button:not([disabled])",
                ].join(","),
            );

            if (firstInput instanceof HTMLElement) {
                firstInput.focus();
            } else {
                dialogRef.current?.focus();
            }
        }, 0);

        return () => {
            window.clearTimeout(focusTimer);
            document.removeEventListener("keydown", handleKeyDown);

            if (previouslyFocusedRef.current instanceof HTMLElement) {
                previouslyFocusedRef.current.focus();
            }
        };
    }, [show]);

    if (!show) {
        return null;
    }

    const closeModal = () => {
        onCloseRef.current?.();
    };

    const handleOutsideClick = (event) => {
        if (event.target === event.currentTarget) {
            closeModal();
        }
    };

    return (
        <Fragment>
            <div
                className="fixed inset-0 z-40 bg-app-navy/40 backdrop-blur-[1px]"
                aria-hidden="true"
            />

            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-4"
                onMouseDown={handleOutsideClick}
            >
                <div
                    ref={dialogRef}
                    tabIndex={-1}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    className={`flex max-h-[90vh] w-full flex-col rounded-card bg-app-surface shadow-floating outline-none ${widths[size]}`}
                >
                    <div className="flex items-center justify-between border-b border-app-border px-6 py-4">
                        <h2
                            id="modal-title"
                            className="text-base font-semibold text-app-text"
                        >
                            {title}
                        </h2>

                        <button
                            type="button"
                            onClick={closeModal}
                            aria-label="Close dialog"
                            className="rounded-control p-1 text-app-muted hover:bg-app-bg hover:text-app-text"
                        >
                            <X size={18} />
                        </button>
                    </div>

                    <div className="overflow-y-auto px-6 py-5">{children}</div>

                    {footer && (
                        <div className="border-t border-app-border px-6 py-4">
                            {footer}
                        </div>
                    )}
                </div>
            </div>
        </Fragment>
    );
}
