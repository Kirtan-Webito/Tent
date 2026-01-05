'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

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
            <Button
                onClick={() => setIsConfirmOpen(true)}
                variant="danger"
                size="sm"
            >
                Remove
            </Button>

            <Modal
                isOpen={isConfirmOpen}
                onClose={() => setIsConfirmOpen(false)}
                title="Remove Desk Admin"
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
                            onClick={handleRemove}
                            variant="danger"
                            size="md"
                            isLoading={loading}
                        >
                            {loading ? 'Removing...' : 'Confirm Remove'}
                        </Button>
                    </>
                }
            >
                <p>Are you sure you want to remove <strong>{userName}</strong> from the team? They will no longer be able to log in to this event.</p>
            </Modal>
        </>
    );
}
