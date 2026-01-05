'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';

interface EditEventModalProps {
    event: any;
    isOpen: boolean;
    onClose: () => void;
}

export default function EditEventModal({ event, isOpen, onClose }: EditEventModalProps) {
    const [loading, setLoading] = useState(false);
    const [name, setName] = useState(event.name);
    const [location, setLocation] = useState(event.location);
    const [startDate, setStartDate] = useState(new Date(event.startDate).toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(new Date(event.endDate).toISOString().split('T')[0]);

    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch('/api/events', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: event.id,
                    name,
                    location,
                    startDate,
                    endDate
                }),
            });

            if (res.ok) {
                onClose();
                window.location.reload(); // Quick refresh to show changes
            }
        } catch (error) {
            console.error('Update failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Modify Event Node"
            actions={
                <div className="flex gap-3 w-full">
                    <Button
                        type="button"
                        onClick={onClose}
                        variant="ghost"
                        size="md"
                        className="flex-1 py-4"
                    >
                        Abort
                    </Button>
                    <Button
                        form="edit-event-form"
                        type="submit"
                        variant="primary"
                        size="md"
                        isLoading={loading}
                        className="flex-[2] h-14 shadow-lg shadow-primary/20"
                    >
                        {loading ? 'Synchronizing...' : 'Save Changes'}
                    </Button>
                </div>
            }
        >
            <p className="text-xs text-muted-foreground uppercase tracking-widest font-black mb-6">
                Adjusting operational parameters for: {event.id.slice(0, 8)}
            </p>
            <form id="edit-event-form" onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Registry Name</label>
                        <input
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="input-primary"
                            placeholder="e.g. Annual Summit 2026"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Geographic Node (Location)</label>
                        <input
                            value={location}
                            onChange={(e) => setLocation(e.target.value)}
                            className="input-primary"
                            placeholder="e.g. Exhibition Center A"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Activation Date</label>
                            <input
                                type="date"
                                value={startDate}
                                onChange={(e) => setStartDate(e.target.value)}
                                className="input-primary"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-2 ml-1">Term Date</label>
                            <input
                                type="date"
                                value={endDate}
                                onChange={(e) => setEndDate(e.target.value)}
                                className="input-primary"
                                required
                            />
                        </div>
                    </div>
                </div>
            </form>
        </Modal>
    );
}
