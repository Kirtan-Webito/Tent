'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AddDeskAdminButton({ eventId, sectors }: { eventId: string; sectors: any[] }) {
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
            assignedSectorId: formData.get('sectorId'),
            eventId: eventId,
            role: 'DESK_ADMIN'
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
            <button
                onClick={() => setIsOpen(true)}
                className="group relative px-6 py-3 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-400 font-black uppercase tracking-widest text-xs hover:bg-purple-500 hover:text-white transition-all duration-300 overflow-hidden"
            >
                <span className="relative z-10 text-nowrap">+ Recruit Operator</span>
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="glass p-8 rounded-[2.5rem] w-full max-w-md border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="text-[10px] text-purple-400 font-black uppercase tracking-[0.2em] mb-1">PERSONNEL_ASSIGNMENT</div>
                                <h2 className="text-3xl font-black text-white tracking-tighter">Add Operator</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Full Name</label>
                                    <input name="name" required className="input-primary w-full" placeholder="e.g. Alex Rivera" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Email Address</label>
                                    <input name="email" type="email" required className="input-primary w-full" placeholder="alex@operations.tent" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Password</label>
                                    <input name="password" type="password" required className="input-primary w-full" placeholder="••••••••" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Assigned Sector</label>
                                    <select name="sectorId" required className="input-primary w-full bg-black/40 border-white/5 text-gray-300 focus:border-purple-500/50">
                                        <option value="">Select Operational Zone...</option>
                                        {sectors.map(sector => (
                                            <option key={sector.id} value={sector.id}>{sector.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsOpen(false)}
                                    className="flex-1 py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white hover:bg-white/5 transition-all"
                                >
                                    Abort
                                </button>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="flex-[2] py-4 rounded-2xl bg-purple-500 text-white text-xs font-black uppercase tracking-widest hover:bg-purple-400 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {loading ? 'Processing...' : 'Authorize Access'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
