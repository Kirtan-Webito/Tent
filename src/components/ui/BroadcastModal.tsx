'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useToast } from '../providers/ToastProvider';
import { SpeakerLoudIcon, Cross2Icon } from '@radix-ui/react-icons';

export default function BroadcastModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const [message, setMessage] = useState('');
    const [type, setType] = useState('INFO');
    const [targetRole, setTargetRole] = useState('ALL');
    const [loading, setLoading] = useState(false);
    const router = useRouter();
    const { showToast } = useToast();

    if (!isOpen) return null;

    const handleSend = async () => {
        if (!message.trim()) return;

        setLoading(true);
        try {
            console.log('Sending broadcast:', { message, type });
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ message, type, targetRole })
            });

            if (res.ok) {
                console.log('Broadcast success');
                setMessage('');
                onClose();
                router.refresh();
                window.dispatchEvent(new Event('refresh-notifications'));
                showToast('Broadcast Sent Successfully!', 'success');
            } else {
                console.error('Failed to send broadcast:', res.status);
                showToast('Failed to send broadcast', 'error');
            }
        } catch (error) {
            console.error('Broadcast error:', error);
            showToast('Error sending broadcast', 'error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <SpeakerLoudIcon className="w-5 h-5 text-blue-400" /> Broadcast Message
                        </h2>
                        <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                            <Cross2Icon className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Target Audience</label>
                            <select
                                value={targetRole}
                                onChange={(e) => setTargetRole(e.target.value)}
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white text-xs focus:outline-none focus:border-blue-500/50 transition-colors"
                            >
                                <option value="ALL">All Authorized Personnel</option>
                                <option value="EVENT_ADMIN">Event Admins Only</option>
                                <option value="DESK_ADMIN">Desk Admins Only</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Priority Level</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['INFO', 'ALERT', 'WARNING'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${type === t
                                            ? 'bg-blue-600 text-white shadow-lg scale-105'
                                            : 'bg-white/5 text-gray-400 hover:bg-white/10'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-400 mb-1">Message Content</label>
                            <textarea
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type your announcement here..."
                                className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-white/20 min-h-[100px] resize-none"
                            />
                        </div>
                    </div>

                    <div className="mt-8 flex justify-end gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSend}
                            disabled={loading || !message.trim()}
                            className="px-6 py-2 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-400 hover:to-indigo-400 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all active:scale-95"
                        >
                            {loading ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
