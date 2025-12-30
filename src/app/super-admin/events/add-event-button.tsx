'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddEventButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            location: formData.get('location'),
            startDate: formData.get('startDate'),
            endDate: formData.get('endDate'),
        };

        try {
            await fetch('/api/events', {
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
                + Create Event
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen">
                    <div className="glass p-6 rounded-xl w-full max-w-lg mx-4">
                        <h2 className="text-xl font-bold mb-4">Create New Event</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 text-gray-400">Event Name</label>
                                <input name="name" required className="input-primary w-full" placeholder="Summer Music Fest" />
                            </div>
                            <div>
                                <label className="block text-sm mb-1 text-gray-400">Location</label>
                                <input name="location" required className="input-primary w-full" placeholder="Central Park" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm mb-1 text-gray-400">Start Date</label>
                                    <input name="startDate" type="date" required className="input-primary w-full" />
                                </div>
                                <div>
                                    <label className="block text-sm mb-1 text-gray-400">End Date</label>
                                    <input name="endDate" type="date" required className="input-primary w-full" />
                                </div>
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <button type="button" onClick={() => setIsOpen(false)} className="px-4 py-2 hover:bg-white/10 rounded-lg transition">Cancel</button>
                                <button type="submit" disabled={loading} className="btn-primary">
                                    {loading ? 'Creating...' : 'Create Event'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
