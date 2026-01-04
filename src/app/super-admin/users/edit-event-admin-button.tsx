'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

interface Event {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string | null;
    email: string;
    assignedEventId: string | null;
}

export default function EditEventAdminButton({
    user,
    events
}: {
    user: User;
    events: Event[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data: any = {
            id: user.id,
            name: formData.get('name'),
            email: formData.get('email'),
            eventId: formData.get('eventId'),
        };

        const password = formData.get('password');
        if (password) data.password = password;

        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Update failed');
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-orange-100 border border-orange-200 text-orange-700 font-bold text-[10px] uppercase tracking-widest hover:bg-orange-200 transition-all active:scale-95 shadow-sm"
            >
                Edit
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Modify Admin Credentials"
                actions={
                    <div className="flex gap-3 w-full">
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="flex-1 py-3 rounded-xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            form="edit-event-admin-form"
                            type="submit"
                            disabled={loading}
                            className="flex-[2] btn-primary"
                        >
                            {loading ? 'Saving...' : 'Update Admin'}
                        </button>
                    </div>
                }
            >
                <form id="edit-event-admin-form" onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Administrator Name</label>
                            <input name="name" defaultValue={user.name || ''} required className="input-primary" placeholder="e.g. Alex Rivera" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Connectivity Email</label>
                            <input name="email" type="email" defaultValue={user.email} required className="input-primary" placeholder="alex@operations.tent" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Update Password (optional)</label>
                            <input name="password" type="password" className="input-primary" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Relocate to Deployment Node</label>
                            <select name="eventId" defaultValue={user.assignedEventId || ''} className="input-primary appearance-none">
                                <option value="">-- No Node Assignment --</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id} className="text-foreground">{event.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
