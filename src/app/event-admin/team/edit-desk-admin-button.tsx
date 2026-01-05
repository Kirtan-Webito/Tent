'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';

interface Sector {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string | null;
    email: string;
    assignedSectors: Sector[];
}

export default function EditDeskAdminButton({
    user,
    allSectors
}: {
    user: User;
    allSectors: Sector[]
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [selectedSectorIds, setSelectedSectorIds] = useState<string[]>(
        user.assignedSectors.map(s => s.id)
    );
    const router = useRouter();

    const toggleSector = (id: string) => {
        setSelectedSectorIds(prev =>
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (selectedSectorIds.length === 0) {
            alert('Please select at least one operational zone.');
            return;
        }
        setLoading(true);

        const formData = new FormData(e.currentTarget);
        const data: any = {
            id: user.id,
            name: formData.get('name'),
            email: formData.get('email'),
            assignedSectorIds: selectedSectorIds,
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
                title="Edit Personnel Assignment"
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
                            form="edit-operator-form"
                            type="submit"
                            variant="primary"
                            size="md"
                            isLoading={loading}
                            className="flex-[2]"
                        >
                            {loading ? 'Saving...' : 'Update Records'}
                        </Button>
                    </div>
                }
            >
                <form id="edit-operator-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Full Name</label>
                            <input name="name" defaultValue={user.name || ''} required className="input-primary" placeholder="e.g. Alex Rivera" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Email Address</label>
                            <input name="email" type="email" defaultValue={user.email} required className="input-primary" placeholder="alex@operations.tent" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2">New Password (optional)</label>
                            <input name="password" type="password" className="input-primary" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-3">Operational Zones</label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-secondary/50 rounded-xl border border-border">
                                {allSectors.map(sector => (
                                    <div
                                        key={sector.id}
                                        onClick={() => toggleSector(sector.id)}
                                        className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${selectedSectorIds.includes(sector.id)
                                            ? 'bg-orange-100 border-orange-300 text-orange-800'
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
                            <p className="mt-2 text-[10px] text-muted-foreground italic">{selectedSectorIds.length} sectors selected</p>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
