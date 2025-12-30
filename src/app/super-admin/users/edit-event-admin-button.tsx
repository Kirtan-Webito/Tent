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
                className="px-3 py-1.5 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-black text-[10px] uppercase tracking-widest hover:bg-cyan-500 hover:text-white transition-all active:scale-95"
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
                            className="flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            form="edit-event-admin-form"
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-3 rounded-xl bg-cyan-500 text-white text-xs font-black uppercase tracking-widest hover:bg-cyan-400 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Saving...' : 'Update Admin'}
                        </button>
                    </div>
                }
            >
                <form id="edit-event-admin-form" onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Administrator Name</label>
                            <input name="name" defaultValue={user.name || ''} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="e.g. Alex Rivera" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Connectivity Email</label>
                            <input name="email" type="email" defaultValue={user.email} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="alex@operations.tent" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Update Password (optional)</label>
                            <input name="password" type="password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Relocate to Deployment Node</label>
                            <select name="eventId" defaultValue={user.assignedEventId || ''} className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-cyan-500/50 transition-colors appearance-none">
                                <option value="">-- No Node Assignment --</option>
                                {events.map(event => (
                                    <option key={event.id} value={event.id} className="bg-[#0f0f12] text-white">{event.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
