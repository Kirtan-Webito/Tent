'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { TrashIcon } from '@radix-ui/react-icons';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

export default function DeleteTentButton({ tentId, tentName }: { tentId: string; tentName: string }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setLoading(true);
        try {
            const res = await fetch(`/api/tents/${tentId}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok) {
                router.refresh();
            } else {
                alert(data.error || 'Failed to delete tent.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('A critical error occurred while attempting deletion.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsConfirmOpen(true)}
                disabled={loading}
                className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500 hover:text-white disabled:opacity-50"
                title="Delete Tent"
            >
                <TrashIcon className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <ConfirmDialog
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                onConfirm={handleDelete}
                title="Decommission Node"
                message={`Are you sure you want to decommission node ${tentName}? This action is permanent.`}
                confirmText={loading ? 'Deleting...' : 'Decommission'}
                variant="danger"
            />
        </>
    );
}
