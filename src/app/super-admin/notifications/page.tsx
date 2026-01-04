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
                <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                    Broadcast Center
                </h1>
                <p className="text-muted-foreground">Send system-wide announcements to all admins</p>
            </div>

            <div className="glass rounded-2xl p-6 shadow-sm">
                <h2 className="font-bold mb-6 text-foreground flex items-center gap-2">
                    <SpeakerLoudIcon className="w-5 h-5 text-primary" /> Create New Announcement
                </h2>
                <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">Broadcast Scope</label>
                            <div className="flex bg-secondary p-1 rounded-xl border border-border">
                                <button
                                    onClick={() => setRecipientType('SYSTEM')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${recipientType === 'SYSTEM' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    System Wide
                                </button>
                                <button
                                    onClick={() => setRecipientType('EVENT')}
                                    className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${recipientType === 'EVENT' ? 'bg-white shadow-sm text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                                >
                                    Current Event
                                </button>
                            </div>
                        </div>

                        {recipientType === 'SYSTEM' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm text-muted-foreground mb-2">Target Role</label>
                                <select
                                    value={targetRole}
                                    onChange={(e) => setTargetRole(e.target.value)}
                                    // Using standard input styles but adapting for select
                                    className="w-full h-10 rounded-xl border border-input bg-white/50 px-3 py-2 text-sm shadow-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent text-foreground"
                                >
                                    <option value="ALL">All Administrative Tiers</option>
                                    <option value="EVENT_ADMIN">Event Admins Only</option>
                                    <option value="DESK_ADMIN">Desk Admins Only</option>
                                </select>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm text-muted-foreground mb-2">Priority Level</label>
                            <div className="flex gap-2">
                                {['INFO', 'WARNING', 'ALERT'].map((t) => (
                                    <button
                                        key={t}
                                        onClick={() => setType(t)}
                                        className={`flex-1 py-3 px-4 rounded-xl text-[10px] font-black tracking-widest transition-all border ${type === t
                                            ? 'bg-primary/10 text-primary border-primary/20 shadow-sm'
                                            : 'bg-secondary text-muted-foreground border-transparent hover:bg-secondary/80'
                                            }`}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm text-muted-foreground mb-2">Message Content</label>
                        <textarea
                            className="w-full h-32 rounded-xl border border-input bg-white/50 p-4 text-sm shadow-sm transition-all placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-transparent text-foreground resize-none"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        ></textarea>
                    </div>

                    <div className="flex justify-end">
                        <button
                            onClick={handleSend}
                            disabled={loading || !message.trim()}
                            className="btn-primary"
                        >
                            {loading ? 'Sending...' : 'Send Broadcast'}
                        </button>
                    </div>
                </div>
            </div>

            <div className="pt-8">
                <h3 className="text-muted-foreground text-sm font-bold uppercase mb-4 tracking-wider">Recent Broadcasts</h3>
                <div className="space-y-3">
                    {recentBroadcasts.length === 0 ? (
                        <div className="text-muted-foreground text-sm italic p-4 text-center border-2 border-dashed border-secondary rounded-xl">No recent broadcasts found.</div>
                    ) : (
                        recentBroadcasts.map((b) => (
                            <div key={b.id} className="bg-card border border-border rounded-xl p-4 flex items-center gap-4 hover:shadow-md transition-all group">
                                <div className={`w-2 h-2 rounded-full ${b.type === 'ALERT' ? 'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]' :
                                    b.type === 'WARNING' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]' :
                                        'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.5)]'
                                    }`}></div>
                                <div className="flex-1">
                                    <p className="text-foreground text-sm font-medium">{b.message}</p>
                                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-2">
                                        <span className="flex items-center gap-1 font-semibold">
                                            {b.eventId ? '📍 Event Limited' : '🌐 System Wide'}
                                        </span>
                                        <span className="text-border">•</span>
                                        <span className="text-primary/80 font-bold text-[9px] uppercase tracking-wider bg-primary/5 px-2 py-0.5 rounded-full border border-primary/10">
                                            Target: {b.targetRole || 'ALL'}
                                        </span>
                                        <span className="text-border">•</span>
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
