'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';

export default function BulkDeleteTents({ sectorId }: { sectorId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [confirmText, setConfirmText] = useState('');
    const router = useRouter();
    const { showToast } = useToast();

    const handleDelete = async () => {
        if (confirmText !== 'CLEAR') return;

        setLoading(true);
        try {
            const res = await fetch(`/api/tents/bulk?sectorId=${sectorId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error('Failed to clear tents');

            showToast('Sector inventory cleared successfully', 'success');
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to clear tents', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative px-6 py-3 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all duration-300 overflow-hidden"
            >
                <span className="relative z-10 text-nowrap">Clear Sector</span>
                <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-rose-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="glass p-8 rounded-[2.5rem] w-full max-w-sm border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tighter mb-2">Total Purge</h2>
                            <p className="text-sm text-gray-400">This will permanently delete all tents in this sector. This action cannot be undone.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 text-center">Type <span className="text-white">CLEAR</span> to proceed</label>
                                <input
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    className="input-primary w-full text-center tracking-[0.5em] font-black border-red-500/30 focus:border-red-500"
                                    placeholder="----"
                                />
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={loading || confirmText !== 'CLEAR'}
                                    className="w-full py-4 rounded-2xl bg-red-500 text-black text-xs font-black uppercase tracking-widest hover:bg-red-400 disabled:opacity-30 transition-all active:scale-95"
                                >
                                    {loading ? 'Purging...' : 'Execute Purge'}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-2xl text-xs font-black uppercase tracking-widest text-gray-500 hover:text-white transition-all"
                                >
                                    Abort
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
