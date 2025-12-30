'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

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
            <button
                onClick={() => setIsOpen(true)}
                className="px-3 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 font-black text-[10px] uppercase tracking-widest hover:bg-purple-500 hover:text-white transition-all active:scale-95"
            >
                Edit
            </button>

            <Modal
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                title="Edit Personnel Assignment"
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
                            form="edit-operator-form"
                            type="submit"
                            disabled={loading}
                            className="flex-[2] py-3 rounded-xl bg-purple-500 text-white text-xs font-black uppercase tracking-widest hover:bg-purple-400 disabled:opacity-50 transition-all"
                        >
                            {loading ? 'Saving...' : 'Update Records'}
                        </button>
                    </div>
                }
            >
                <form id="edit-operator-form" onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Full Name</label>
                            <input name="name" defaultValue={user.name || ''} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="e.g. Alex Rivera" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">Email Address</label>
                            <input name="email" type="email" defaultValue={user.email} required className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="alex@operations.tent" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2">New Password (optional)</label>
                            <input name="password" type="password" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors" placeholder="••••••••" />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3">Operational Zones</label>
                            <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto p-2 bg-black/20 rounded-xl border border-white/5">
                                {allSectors.map(sector => (
                                    <div
                                        key={sector.id}
                                        onClick={() => toggleSector(sector.id)}
                                        className={`flex items-center gap-2 p-2.5 rounded-lg cursor-pointer transition-all border ${selectedSectorIds.includes(sector.id)
                                            ? 'bg-purple-500/20 border-purple-500/40 text-white'
                                            : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10'
                                            }`}
                                    >
                                        <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border transition-all ${selectedSectorIds.includes(sector.id)
                                            ? 'bg-purple-500 border-purple-500'
                                            : 'bg-transparent border-gray-600'
                                            }`}>
                                            {selectedSectorIds.includes(sector.id) && <span className="text-[8px]">✓</span>}
                                        </div>
                                        <span className="text-[11px] font-bold truncate">{sector.name}</span>
                                    </div>
                                ))}
                            </div>
                            <p className="mt-2 text-[10px] text-gray-600 italic">{selectedSectorIds.length} sectors selected</p>
                        </div>
                    </div>
                </form>
            </Modal>
        </>
    );
}
