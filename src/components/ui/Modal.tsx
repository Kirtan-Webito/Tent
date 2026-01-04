'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    actions?: React.ReactNode;
    maxWidth?: string;
}

export default function Modal({ isOpen, onClose, title, children, actions, maxWidth = 'max-w-lg' }: ModalProps) {
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto" onClick={onClose}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className={`relative w-full ${maxWidth} bg-white border border-border rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200 my-4 md:my-8`}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border sticky top-0 bg-white z-20 rounded-t-2xl">
                        <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-orange-600 bg-clip-text text-transparent">
                            {title}
                        </h3>
                        <button
                            onClick={onClose}
                            className="p-2 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-secondary"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-6 text-foreground">
                        {children}
                    </div>

                    {/* Footer / Actions */}
                    {actions && (
                        <div className="flex justify-end gap-3 p-6 pt-0">
                            {actions}
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
}
