'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
}

export default function Modal({ isOpen, onClose, title, children, actions }: ModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        // Prevent scrolling when modal is open
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="relative w-full max-w-lg bg-[#0f0f12] border border-white/10 rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/5">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-white to-white/60 bg-clip-text text-transparent">
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 text-gray-300">
                    {children}
                </div>

                {/* Footer / Actions */}
                {actions && (
                    <div className="flex justify-end gap-3 p-6 pt-0">
                        {actions}
                    </div>
                )}
            </div>
        </div>,
        document.body
    );
}
