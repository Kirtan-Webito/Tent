'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

export default function DeleteSectorButton({ sectorId, sectorName }: { sectorId: string, sectorName: string }) {
    const [isConfirmOpen, setIsConfirmOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleDelete = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent navigating to the sector details if inside a link
        e.stopPropagation();

        setLoading(true);
        try {
            await fetch('/api/sectors', {
                method: 'DELETE',
                body: JSON.stringify({ sectorId }),
                headers: { 'Content-Type': 'application/json' }
            });
            setIsConfirmOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
            alert('Failed to delete sector');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setIsConfirmOpen(true);
                }}
                className="text-gray-500 hover:text-red-400 p-2 rounded-full hover:bg-white/5 transition-colors"
                title="Delete Sector"
            >
                🗑️
            </button>

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Delete Sector"
                actions={
                    <>
                        <button
                            onClick={() => setIsConfirmOpen(false)}
                            className="px-4 py-2 hover:bg-white/10 rounded-lg text-gray-300 transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleDelete}
                            disabled={loading}
                            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium"
                        >
                            {loading ? 'Deleting...' : 'Delete Permanently'}
                        </button>
                    </>
                }
            >
                <div>
                    <p className="mb-4">Are you sure you want to delete the sector <strong>{sectorName}</strong>?</p>
                    <p className="text-sm text-red-400 bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                        Warning: This may delete all associated tents and bookings if cascade delete is enabled in your database schema.
                    </p>
                </div>
            </Modal>
        </>
    );
}
