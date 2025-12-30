'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

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
            await fetch('/api/users', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button onClick={() => setIsOpen(true)} className="btn-primary">
                + Create Admin
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen">
                    <div className="glass p-6 rounded-xl w-full max-w-lg mx-4">
                        <h2 className="text-xl font-bold mb-4">Create Event Admin</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 text-gray-400">Full Name</label>
                                <input name="name" required className="input-primary w-full" placeholder="John Doe" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-400">Email Address</label>
                                <input name="email" type="email" required className="input-primary w-full" placeholder="manager@tent.com" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-400">Password</label>
                                <input name="password" type="password" required className="input-primary w-full" placeholder="••••••••" />
                            </div>

                            <div>
                                <label className="block text-sm mb-1 text-gray-400">Assign Event</label>
                                <select name="eventId" className="input-primary w-full">
                                    <option value="">-- Select Event --</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 hover:bg-white/10 rounded-lg transition">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? 'Creating...' : 'Create Admin'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
