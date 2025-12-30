'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal'; // Using our reusable modal

export default function RemoveDeskAdminButton({ userId, userName }: { userId: string, userName: string }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleRemove = async () => {
        setLoading(true);
        try {
            await fetch('/api/users', {
                method: 'DELETE',
                body: JSON.stringify({ userId }),
                headers: { 'Content-Type': 'application/json' }
            });
            setIsConfirmOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to remove user');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsConfirmOpen(true)}
                className="text-red-400 hover:text-red-300 font-medium text-sm transition-colors hover:bg-red-500/10 px-3 py-1 rounded"
            >
                Remove
            </button>

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Remove Desk Admin"
                actions={
                    <>
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="px-4 py-2 hover:bg-white/10 rounded-lg text-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleRemove}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium"
                        >
                            {loading ? 'Removing...' : 'Confirm Remove'}
                        </button>
                    </>
                }
            >
                <p>Are you sure you want to remove <strong>{userName}</strong> from the team? They will no longer be able to log in to this event.</p>
            </Modal>
        </>
    );
}
