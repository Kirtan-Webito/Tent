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
                className="group relative px-6 py-3 rounded-2xl bg-red-50 border border-red-200 text-red-600 font-black uppercase tracking-widest text-xs hover:bg-red-500 hover:text-white transition-all duration-300 shadow-sm hover:shadow-lg"
            >
                <span className="relative z-10 text-nowrap">Clear Sector</span>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
                    <div className="bg-white p-8 rounded-[2.5rem] w-full max-w-sm border border-border shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-200">
                                <span className="text-2xl">⚠️</span>
                            </div>
                            <h2 className="text-2xl font-black text-foreground tracking-tighter mb-2">Total Purge</h2>
                            <p className="text-sm text-muted-foreground">This will permanently delete all tents in this sector. This action cannot be undone.</p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-2 text-center">Type <span className="text-red-600">CLEAR</span> to proceed</label>
                                <input
                                    value={confirmText}
                                    onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                    className="input-primary w-full text-center tracking-[0.5em] font-black border-red-200 focus:border-red-500 bg-red-50 text-red-900 placeholder:text-red-200"
                                    placeholder="----"
                                />
                            </div>

                            <div className="flex flex-col gap-2 pt-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={loading || confirmText !== 'CLEAR'}
                                    className="w-full py-4 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-500 hover:shadow-lg disabled:opacity-30 disabled:hover:shadow-none transition-all active:scale-95 shadow-md"
                                >
                                    {loading ? 'Purging...' : 'Execute Purge'}
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="w-full py-4 rounded-2xl text-xs font-bold uppercase tracking-widest text-muted-foreground hover:bg-secondary transition-all"
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
