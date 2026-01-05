'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

export default function AddSectorButton({ eventId }: { eventId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name'),
            eventId
        };

        try {
            await fetch('/api/sectors', {
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
            <Button onClick={() => setIsOpen(true)} variant="primary" size="md">
                + Create Sector
            </Button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm h-screen">
                    <div className="glass p-6 rounded-xl w-full max-w-sm mx-4">
                        <h2 className="text-xl font-bold mb-4">Create New Sector</h2>
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm mb-1 text-gray-400">Sector Name</label>
                                <input name="name" required className="input-primary w-full" placeholder="Zone A" />
                            </div>

                            <div className="flex justify-end gap-2 mt-6">
                                <Button type="button" onClick={() => setIsOpen(false)} variant="ghost" size="md">
                                    Cancel
                                </Button>
                                <Button type="submit" variant="primary" size="md" isLoading={loading}>
                                    {loading ? 'Creating...' : 'Create'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
