import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { EllipsisVertical } from 'lucide-react';

// Floating action menu anchored to the clicked trigger via a portal, so it
// never expands the table's scroll area or row height. Repositions near
// viewport edges, and closes on click-outside/Escape.
export default function ActionDropdown({ items }) {
    const [open, setOpen] = useState(false);
    const [coords, setCoords] = useState({ top: 0, left: 0 });
    const triggerRef = useRef(null);
    const menuRef = useRef(null);

    const openMenu = () => {
        const rect = triggerRef.current.getBoundingClientRect();
        const menuWidth = 180;
        const menuHeight = items.length * 40 + 16;

        let left = rect.left;
        let top = rect.bottom + 4;

        if (left + menuWidth > window.innerWidth - 8) {
            left = rect.right - menuWidth;
        }
        if (top + menuHeight > window.innerHeight - 8) {
            top = rect.top - menuHeight - 4;
        }

        setCoords({ top, left });
        setOpen(true);
    };

    useEffect(() => {
        if (!open) return;

        const handleClickOutside = (e) => {
            if (menuRef.current?.contains(e.target) || triggerRef.current?.contains(e.target)) return;
            setOpen(false);
        };
        const handleKey = (e) => {
            if (e.key === 'Escape') setOpen(false);
        };
        const handleScroll = () => setOpen(false);

        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKey);
        window.addEventListener('scroll', handleScroll, true);

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKey);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, [open]);

    return (
        <>
            <button
                ref={triggerRef}
                onClick={() => (open ? setOpen(false) : openMenu())}
                aria-haspopup="menu"
                aria-expanded={open}
                aria-label="Row actions"
                className="rounded-control p-1.5 text-app-muted hover:bg-app-bg hover:text-app-text focus:outline-none focus:ring-2 focus:ring-app-primary/30"
            >
                <EllipsisVertical size={18} />
            </button>

            {open &&
                createPortal(
                    <div
                        ref={menuRef}
                        role="menu"
                        style={{ position: 'fixed', top: coords.top, left: coords.left, width: 180 }}
                        className="z-[80] rounded-control border border-app-border bg-app-surface py-1 shadow-floating"
                    >
                        {items.map((item, i) => (
                            <button
                                key={i}
                                role="menuitem"
                                onClick={() => {
                                    setOpen(false);
                                    item.onClick();
                                }}
                                disabled={item.disabled}
                                className={`flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-app-bg disabled:cursor-not-allowed disabled:opacity-50 ${
                                    item.danger ? 'text-app-danger' : 'text-app-text'
                                }`}
                            >
                                {item.icon && <item.icon size={15} />}
                                {item.label}
                            </button>
                        ))}
                    </div>,
                    document.body,
                )}
        </>
    );
}
