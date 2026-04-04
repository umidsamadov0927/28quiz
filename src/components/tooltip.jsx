'use client';

import { createPortal } from 'react-dom';

export default function Tooltip({ visible = false, text, top = 0, left = 0 }) {
    if (!visible) return null;

    return createPortal(
        <div
            className="fixed z-[9999] bg-gray-900 text-white text-xs px-2 py-1.5 rounded-md shadow-xl pointer-events-none whitespace-nowrap"
            style={{ top: `${top}px`, left: `${left}px` }}
        >
            {text}
            <div className="absolute top-1/2 -left-1 -mt-1 border-4 border-transparent border-r-gray-900" />
        </div>,
        document.body
    );
}