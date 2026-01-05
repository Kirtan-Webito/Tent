'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import EditEventAdminButton from './edit-event-admin-button';
import Button from '@/components/ui/Button';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

interface Sector {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    assignedEventId: string | null;
    assignedSectors: Sector[];
}

interface Event {
    id: string;
    name: string;
}

interface UserOperationsProps {
    user: User;
    events: Event[];
}

export default function UserOperations({ user, events }: UserOperationsProps) {
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        setIsDeleting(true);
        try {
            const res = await fetch('/api/users', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: user.id }),
            });

            if (res.ok) {
                router.refresh();
            } else {
                const data = await res.json();
                alert(data.error || 'Purge operation failed.');
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
            <EditEventAdminButton user={user} events={events} />
            <Button
                onClick={() => setIsDeleteOpen(true)}
                variant="danger"
                size="sm"
            >
                Purge
            </Button>

            <ConfirmDialog
                isOpen={isDeleteOpen}
                onClose={() => setIsDeleteOpen(false)}
                onConfirm={handleDelete}
                title="Purge Administrator"
                message={`Are you absolutely sure you want to PURGE the administrator "${user.name || user.email}"? This action is irreversible.`}
                confirmText={isDeleting ? 'Purging...' : 'Purge'}
                variant="danger"
            />
        </div>
    );
}
