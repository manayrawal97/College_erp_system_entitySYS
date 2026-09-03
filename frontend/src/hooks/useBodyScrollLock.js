import { useEffect } from 'react';

// Reference count to support multiple or nested modals gracefully
let lockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

export const lockBodyScroll = () => {
    if (typeof document === 'undefined') return;

    if (lockCount === 0) {
        originalOverflow = document.body.style.overflow;
        originalPaddingRight = document.body.style.paddingRight;

        // Calculate scrollbar width to prevent page content shift when scrollbar disappears
        const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
        if (scrollBarWidth > 0) {
            document.body.style.paddingRight = `${scrollBarWidth}px`;
        }

        document.body.classList.add('modal-open');
        document.body.style.overflow = 'hidden';
    }
    lockCount++;
};

export const unlockBodyScroll = () => {
    if (typeof document === 'undefined') return;

    lockCount = Math.max(0, lockCount - 1);
    if (lockCount === 0) {
        document.body.classList.remove('modal-open');
        document.body.style.overflow = originalOverflow || '';
        document.body.style.paddingRight = originalPaddingRight || '';
    }
};

export const forceUnlockBodyScroll = () => {
    if (typeof document === 'undefined') return;
    lockCount = 0;
    document.body.classList.remove('modal-open');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
};

/**
 * Custom hook to lock body & background scrolling when a modal or drawer is open.
 * @param {boolean} isLocked - Whether the modal/overlay is currently active
 */
export const useBodyScrollLock = (isLocked = true) => {
    useEffect(() => {
        if (!isLocked) return;

        lockBodyScroll();

        return () => {
            unlockBodyScroll();
        };
    }, [isLocked]);
};

export default useBodyScrollLock;
