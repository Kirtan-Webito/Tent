'use client';

import { useState, useEffect, useRef } from 'react';
import { BellIcon } from '@radix-ui/react-icons';

type Notification = {
    id: string;
    type: 'INFO' | 'WARNING' | 'SUCCESS' | 'ERROR';
    message: string;
    read: boolean;
    createdAt: string;
};

export default function NotificationBell() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const fetchNotifications = async () => {
        try {
            const res = await fetch('/api/notifications');
            if (res.ok) {
                const data = await res.json();
                setNotifications(data.notifications || []);
                setUnreadCount(data.unreadCount || 0);
            }
        } catch (error) {
            console.error('Failed to fetch notifications', error);
        }
    };

    useEffect(() => {
        fetchNotifications();

        const handleRefresh = () => fetchNotifications();
        window.addEventListener('refresh-notifications', handleRefresh);

        const interval = setInterval(fetchNotifications, 30000); // Poll every 30s

        return () => {
            clearInterval(interval);
            window.removeEventListener('refresh-notifications', handleRefresh);
        };
    }, []);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const markAsRead = async () => {
        const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
        if (unreadIds.length === 0) return;

        // Optimistic update
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);

        await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ notificationIds: unreadIds })
        });
    };

    return (
        <div ref={wrapperRef} className="relative z-50">
            <button
                onClick={() => {
                    setIsOpen(!isOpen);
                    if (!isOpen && unreadCount > 0) markAsRead();
                }}
                className="relative p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors"
                title="Notifications"
            >
                <BellIcon className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
                {unreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-[#0a0a0c]">
                        {unreadCount}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-80 bg-[#0a0a0c] border border-white/10 rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-white/10 flex justify-between items-center">
                        <h3 className="font-bold text-white">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-blue-400 cursor-pointer hover:underline" onClick={markAsRead}>
                                Mark all read
                            </span>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 text-sm">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors ${!n.read ? 'bg-white/5' : ''}`}>
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'WARNING' ? 'bg-yellow-500' :
                                            n.type === 'ERROR' ? 'bg-red-500' :
                                                n.type === 'SUCCESS' ? 'bg-green-500' :
                                                    'bg-blue-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm text-gray-300 leading-snug">{n.message}</p>
                                            <p className="text-[10px] text-gray-500 mt-1">
                                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
