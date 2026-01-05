'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { TrashIcon } from '@radix-ui/react-icons';

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
                className="group/delete flex items-center justify-center p-2.5 rounded-xl bg-white/10 hover:bg-red-500/10 text-muted-foreground hover:text-red-500 border border-transparent hover:border-red-500/20 transition-all duration-300"
                title="Delete Sector"
            >
                <TrashIcon className="w-5 h-5 transition-transform group-hover/delete:scale-110" />
            </button>

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Delete Sector"
                actions={
                    <>
                        <Button
                            onClick={() => setIsConfirmOpen(false)}
                            variant="ghost"
                            size="md"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleDelete}
                            variant="danger"
                            size="md"
                            isLoading={loading}
                        >
                            {loading ? 'Deleting...' : 'Delete Permanently'}
                        </Button>
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
