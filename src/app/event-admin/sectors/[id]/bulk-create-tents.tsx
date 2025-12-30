'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';

export default function BulkCreateTents({ sectorId }: { sectorId: string }) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [namePrefix, setNamePrefix] = useState('TENT');
    const [pattern, setPattern] = useState('DASH_NUMBER');
    const [startFrom, setStartFrom] = useState(1);
    const [quantity, setQuantity] = useState(10);
    const [capacity, setCapacity] = useState(4);
    const router = useRouter();
    const { showToast } = useToast();

    const generatePreview = () => {
        let example = "";
        switch (pattern) {
            case 'SPACE_NUMBER': example = `${namePrefix} ${startFrom}`; break;
            case 'UNDERSCORE_NUMBER': example = `${namePrefix}_${startFrom}`; break;
            case 'JUST_NUMBER': example = `${startFrom}`; break;
            default: example = `${namePrefix}-${startFrom}`; break;
        }
        return `Example: ${example}, ${pattern === 'JUST_NUMBER' ? startFrom + 1 : namePrefix + (pattern === 'SPACE_NUMBER' ? ' ' : pattern === 'UNDERSCORE_NUMBER' ? '_' : '-') + (startFrom + 1)}...`;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const data = {
            namePrefix,
            quantity,
            capacity,
            sectorId,
            patternType: pattern,
            startFrom
        };

        try {
            const res = await fetch('/api/tents/bulk', {
                method: 'POST',
                body: JSON.stringify(data),
                headers: { 'Content-Type': 'application/json' }
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to create tents');
            }

            showToast(`Successfully created ${quantity} tents`, 'success');
            setIsOpen(false);
            router.refresh();
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to create tents', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="group relative px-6 py-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-black uppercase tracking-widest text-xs hover:bg-emerald-500 hover:text-white transition-all duration-300 overflow-hidden"
            >
                <span className="relative z-10 text-nowrap">+ Bulk Create</span>
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-teal-600 opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
                    <div className="glass p-8 rounded-[2.5rem] w-full max-w-md border-white/10 shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <div className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em] mb-1">AUTOMATED_DEPLOYMENT</div>
                                <h2 className="text-3xl font-black text-white tracking-tighter">Bulk Generator</h2>
                            </div>
                            <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-white transition-colors">✕</button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Naming Pattern</label>
                                    <select
                                        value={pattern}
                                        onChange={(e) => setPattern(e.target.value)}
                                        className="input-primary w-full bg-black/40 border-white/5 text-gray-300 focus:border-emerald-500/50"
                                    >
                                        <option value="DASH_NUMBER">Prefix-Number (T-1)</option>
                                        <option value="SPACE_NUMBER">Prefix Number (T 1)</option>
                                        <option value="UNDERSCORE_NUMBER">Prefix_Number (T_1)</option>
                                        <option value="JUST_NUMBER">Just Number (1)</option>
                                    </select>
                                </div>

                                {pattern !== 'JUST_NUMBER' && (
                                    <div className="animate-in slide-in-from-top-2">
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Label Prefix</label>
                                        <input
                                            value={namePrefix}
                                            onChange={(e) => setNamePrefix(e.target.value.toUpperCase())}
                                            required
                                            className="input-primary w-full"
                                            placeholder="e.g. TENT, ROOM, UNIT"
                                        />
                                    </div>
                                )}

                                <div className="grid grid-cols-3 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Quantity</label>
                                        <input
                                            type="number"
                                            value={quantity || ''}
                                            onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                                            min="1" max="500" required
                                            className="input-primary w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Start Idx</label>
                                        <input
                                            type="number"
                                            value={startFrom || 0}
                                            onChange={(e) => setStartFrom(parseInt(e.target.value) || 0)}
                                            min="0" required
                                            className="input-primary w-full"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-2 ml-1">Max Pers</label>
                                        <input
                                            type="number"
                                            value={capacity || ''}
                                            onChange={(e) => setCapacity(parseInt(e.target.value) || 0)}
                                            min="1" required
                                            className="input-primary w-full"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-black/40 border border-white/5 border-dashed">
                                <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mb-1">Generated Output</div>
                                <div className="text-xs font-mono text-emerald-400/80">{generatePreview()}</div>
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
                                    className="flex-[2] py-4 rounded-2xl bg-emerald-500 text-black text-xs font-black uppercase tracking-widest hover:bg-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] disabled:opacity-50 transition-all active:scale-95"
                                >
                                    {loading ? 'Processing...' : 'Execute Sequence'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
