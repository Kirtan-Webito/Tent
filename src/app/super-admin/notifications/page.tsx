'use client';

import { useState, useEffect } from 'react';
import { useToast } from '@/components/providers/ToastProvider';
import { SpeakerLoudIcon } from '@radix-ui/react-icons';

interface Broadcast {
    id: string;
    message: string;
    type: string;
    createdAt: string;
    eventId: string | null;
    targetRole: string | null;
}

export default function NotificationsPage() {
    const [message, setMessage] = useState('');
    const [targetRole, setTargetRole] = useState('ALL'); // ALL, EVENT_ADMIN, DESK_ADMIN
    const [recipientType, setRecipientType] = useState('SYSTEM'); // SYSTEM, EVENT
    const [type, setType] = useState('INFO');
    const [loading, setLoading] = useState(false);
    const [recentBroadcasts, setRecentBroadcasts] = useState<Broadcast[]>([]);
    const { showToast } = useToast();

    useEffect(() => {
        fetchBroadcasts();
    }, []);

    const fetchBroadcasts = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setRecentBroadcasts(data.notifications || []);
            }
        } catch (error) {
            console.error('Failed to fetch broadcasts:', error);
        }
    };

    const handleSend = async () => {
        if (!message.trim()) return;

        setLoading(true);
        try {
            const res = await fetch('/api/notifications', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message,
                    type,
                    isSystemWide: recipientType === 'SYSTEM',
                    targetRole: recipientType === 'SYSTEM' ? targetRole : 'ALL'
                })
            });

            if (res.ok) {
                showToast('Broadcast sent successfully!', 'success');
                setMessage('');
                fetchBroadcasts();
                // Custom event to refresh the bell icon
                window.dispatchEvent(new Event('refresh-notifications'));
            } else {
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
        <div className="space-y-6 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent">
                    Broadcast Center
                </h1>
                <p className="text-gray-400">Send system-wide announcements to all admins</p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-sm">
                <h2 className="font-bold mb-6 text-white flex items-center gap-2">
                    <SpeakerLoudIcon className="w-5 h-5 text-purple-400" /> Create New Announcement
                </h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Broadcast Scope</label>
                            <div className="flex bg-black/40 p-1 rounded-xl border border-white/10">
                                <button
                                    onClick={() => setRecipientType('SYSTEM')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${recipientType === 'SYSTEM' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    System Wide
                                </button>
                                <button
                                    onClick={() => setRecipientType('EVENT')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${recipientType === 'EVENT' ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-gray-300'}`}
                                >
                                    Current Event
                                </button>
                            </div>
                        </div>

                        {recipientType === 'SYSTEM' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm text-gray-400 mb-2">Target Role</label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500/50 transition-colors"
                                >
                                    <option value="ALL">All Administrative Tiers</option>
                                    <option value="EVENT_ADMIN">Event Admins Only</option>
                                    <option value="DESK_ADMIN">Desk Admins Only</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Priority Level</label>
                            <div className="flex gap-2">
                                {['INFO', 'WARNING', 'ALERT'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all border ${type === t
                                            ? 'bg-purple-600/20 text-purple-400 border-purple-500/50 shadow-lg shadow-purple-500/10'
                                            : 'bg-white/5 text-gray-500 border-transparent hover:bg-white/10'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-gray-400 mb-2">Message Content</label>
                        <textarea
                            className="w-full h-32 bg-black/40 border border-white/10 rounded-xl p-4 text-white placeholder-gray-500 focus:outline-none focus:border-purple-500/50 resize-none transition-colors"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSend}
                            disabled={loading || !message.trim()}
                            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-8 py-3 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-purple-500/20"
                        >
                            {loading ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <h3 className="text-gray-400 text-sm font-bold uppercase mb-4 tracking-wider">Recent Broadcasts</h3>
                <div className="space-y-3">
                    {recentBroadcasts.length === 0 ? (
                        <div className="text-gray-500 text-sm italic p-4">No recent broadcasts found.</div>
                    ) : (
                        recentBroadcasts.map((b) => (
                            <div key={b.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center gap-4 hover:bg-white/[0.07] transition-colors group">
                                <div className={`w-2 h-2 rounded-full ${b.type === 'ALERT' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                    b.type === 'WARNING' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                        'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-white text-sm font-medium">{b.message}</p>
                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                        <span className="flex items-center gap-1">
                                            {b.eventId ? '📍 Event Limited' : '🌐 System Wide'}
                                        </span>
                                        <span className="text-white/20">•</span>
                                        <span className="text-gray-400 font-bold text-[9px] uppercase tracking-wider bg-white/5 px-2 py-0.5 rounded-full border border-white/5">
                                            Target: {b.targetRole || 'ALL'}
                                        </span>
                                        <span className="text-white/20">•</span>
                                        <span>{new Date(b.createdAt).toLocaleString()}</span>
                                    </p>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
