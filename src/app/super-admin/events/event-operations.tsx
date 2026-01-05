'use client';

import { useState } from 'react';
import EditEventModal from './edit-event-modal';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface EventOperationsProps {
    event: any;
}

export default function EventOperations({ event }: EventOperationsProps) {
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch('/api/events', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: event.id }),
            });

            if (res.ok) {
                window.location.reload();
            } else {
                alert('Purge operation failed.');
            }
        } catch (error) {
            console.error('Delete failed:', error);
            alert('An error occurred during decompression.');
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="flex gap-2 justify-end">
            <Button
                onClick={() => setIsEditOpen(true)}
                variant="secondary"
                size="sm"
            >
                Modify
            </Button>
            <Button
                onClick={() => setIsDeleteOpen(true)}
                variant="danger"
                size="sm"
            >
                Purge
            </Button>

            <EditEventModal
                event={event}
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
            />

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Purge Event Node"
                message={`Are you absolutely sure you want to PURGE the event node "${event.name}"? This action is irreversible.`}
                confirmText={isDeleting ? 'Purging...' : 'Purge'}
                variant="danger"
            />
        </div>
    );
}
