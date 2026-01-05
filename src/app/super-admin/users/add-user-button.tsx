'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

export default function AddUserButton({ events }: { events: { id: string, name: string }[] }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            password: formData.get('password'),
            eventId: formData.get('eventId'),
            role: 'EVENT_ADMIN'
        };

        try {
            const res = await fetch('/api/users', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setIsOpen(false);
                router.refresh();
            } else {
                const err = await res.json();
                alert(err.error || 'Creation failed');
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
            <Button
                onClick={() => setIsOpen(true)}
                variant="primary"
                size="md"
            >
                + Create Admin
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Create Event Admin"
                actions={
                    <div className="flex gap-3 w-full">
                        <Button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            variant="ghost"
                            size="md"
                            className="flex-1 py-3"
                        >
                            Cancel
                        </Button>
                        <Button
                            form="add-event-admin-form"
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={loading}
                            className="flex-[2]"
                        >
                            {loading ? 'Creating...' : 'Create Admin'}
                        </Button>
                    </div>
                }
            >
                <form id="add-event-admin-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Full Name</label>
                            <input name="name" required className="input-primary" placeholder="e.g. John Doe" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Email Address</label>
                            <input name="email" type="email" required className="input-primary" placeholder="manager@tent.com" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Password</label>
                            <input name="password" type="password" required className="input-primary" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Assign Event</label>
                            <select name="eventId" className="input-primary appearance-none">
                                <option value="">-- Select Event --</option>
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
