'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Button from './Button';

interface ConfirmDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    variant?: 'danger' | 'primary';
}

export default function ConfirmDialog({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    variant = 'danger'
}: ConfirmDialogProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    if (!mounted || !isOpen) return null;

    const handleConfirm = () => {
        onConfirm();
        onClose();
    };

    return createPortal(
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose}>
            <div className="flex min-h-full items-center justify-center p-4">
                <div
                    className="relative w-full max-w-md bg-white border border-border rounded-2xl shadow-2xl scale-100 animate-in zoom-in-95 duration-200"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-border">
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
                        <p className="text-sm leading-relaxed">{message}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 p-6 pt-0">
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="md"
                        >
                            {cancelText}
                        </Button>
                        <Button
                            onClick={handleConfirm}
                            variant={variant}
                            size="md"
                        >
                            {confirmText}
                        </Button>
                    </div>
                </div>
            </div>
        </div>,
        document.body
    );
}
