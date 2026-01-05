'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';

interface Event {
    id: string;
    name: string;
}

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
    assignedSectors?: Sector[];
}

export default function EditUserButton({
    user,
    events
}: {
    user: User;
    events: Event[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [sectors, setSectors] = useState<Sector[]>([]);
    const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>(
        user.assignedSectors?.map(s => s.id) || []
    );
    const { showToast } = useToast();
    const router = useRouter();

    // Fetch sectors when modal opens
    useEffect(() => {
        if (isOpen) {
            fetchSectors();
        }
    }, [isOpen]);

    const fetchSectors = async () => {
        try {
            const res = await fetch('/api/sectors');
            if (res.ok) {
                const data = await res.json();
                setSectors(data);
            } else {
                console.error('Failed to fetch sectors');
                // Don't show toast here to avoid spamming on open if it's just a transient issue,
                // but nice to have. Let's keep it silent or log only for now unless user tries to save.
            }
        } catch (error) {
            console.error('Failed to fetch sectors:', error);
        }
    };

    const toggleSector = (id: string) => {
        setSelectedSectorIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setLoading(true);
        showToast('Updating user...', 'info');

        const formData = new FormData(e.currentTarget);
        const data: any = {
            id: user.id,
            name: formData.get('name'),
            email: formData.get('email'),
            role: selectedRole,
        };

        const password = formData.get('password');
        if (password) data.password = password;

        // Add role-specific assignments
        if (selectedRole === 'EVENT_ADMIN') {
            data.eventId = formData.get('eventId') || null;
        } else if (selectedRole === 'DESK_ADMIN') {
            data.assignedSectorIds = selectedSectorIds;
        }

        try {
            const res = await fetch('/api/users', {
                method: 'PATCH',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                setIsOpen(false);
                showToast('User updated successfully', 'success');
                router.refresh();
            } else {
                const err = await res.json();
                showToast(err.error || 'Update failed', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('An error occurred during update', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Button
                onClick={() => setIsOpen(true)}
                variant="secondary"
                size="sm"
            >
                Edit
            </Button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Edit User"
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
                            form="edit-user-form"
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={loading}
                            className="flex-[2]"
                        >
                            {loading ? 'Saving...' : 'Update User'}
                        </Button>
                    </div>
                }
            >
                <form id="edit-user-form" onSubmit={handleSubmit} className="space-y-6 text-left">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Name</label>
                            <input name="name" defaultValue={user.name || ''} required className="input-primary" placeholder="e.g. Alex Rivera" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Email</label>
                            <input name="email" type="email" defaultValue={user.email} required className="input-primary" placeholder="alex@example.com" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">New Password (optional)</label>
                            <input name="password" type="password" className="input-primary" placeholder="••••••••" />
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Access Role</label>
                            <select
                                value={selectedRole}
                                onChange={(e) => setSelectedRole(e.target.value)}
                                className="input-primary appearance-none"
                            >
                                <option value="DESK_ADMIN">Desk Admin</option>
                                <option value="EVENT_ADMIN">Event Admin</option>
                            </select>
                        </div>

                        {/* Event Assignment for EVENT_ADMIN */}
                        {selectedRole === 'EVENT_ADMIN' && (
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Assigned Event</label>
                                <select name="eventId" defaultValue={user.assignedEventId || ''} className="input-primary appearance-none">
                                    <option value="">-- No Event Assignment --</option>
                                    {events.map(event => (
                                        <option key={event.id} value={event.id}>{event.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}

                        {/* Sector Assignment for DESK_ADMIN */}
                        {selectedRole === 'DESK_ADMIN' && (
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Assigned Sectors</label>
                                {sectors.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic">No sectors available</p>
                                ) : (
                                    <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-secondary/50 rounded-xl border border-border">
                                        {sectors.map(sector => (
                                            <div
                                                key={sector.id}
                                                onClick={() => toggleSector(sector.id)}
                                                className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${selectedSectorIds.includes(sector.id)
                                                    ? 'bg-blue-100 border-blue-300 text-blue-800'
                                                    : 'bg-white border-transparent text-muted-foreground hover:bg-white/80'
                                                    }`}
                                            >
                                                <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${selectedSectorIds.includes(sector.id)
                                                    ? 'bg-primary border-primary'
                                                    : 'bg-transparent border-input'
                                                    }`}>
                                                    {selectedSectorIds.includes(sector.id) && <span className="text-[8px] text-white">✓</span>}
                                                </div>
                                                <span className="text-[11px] font-bold truncate">{sector.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                <p className="mt-2 text-[10px] text-muted-foreground italic">{selectedSectorIds.length} sectors selected</p>
                            </div>
                        )}
                    </div>
                </form>
            </Modal>
        </>
    );
}
