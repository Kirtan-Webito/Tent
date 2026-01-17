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

        // Real-time notifications via SSE
        const eventSource = new EventSource('/api/notifications/stream');

        eventSource.onopen = () => {
            console.log('SSE connection established');
        };

        eventSource.onmessage = (event) => {
            try {
                const newNotification = JSON.parse(event.data);
                setNotifications(prev => [newNotification, ...prev].slice(0, 30));
                setUnreadCount(prev => prev + 1);
            } catch (error) {
                console.error('Error parsing real-time notification', error);
            }
        };

        eventSource.onerror = (error) => {
            // Log the error, but don't close immediately.
            // Browser will usually attempt to reconnect automatically unless it's a fatal error.
            console.warn('SSE connection issue:', error);

            // If the connection is closed, the browser will try to reconnect.
            // We only close if we are unmounting or if we want to stop retrying.
            if (eventSource.readyState === EventSource.CLOSED) {
                console.error('SSE connection closed. Browser will attempt to reconnect.');
            }
        };

        return () => {
            eventSource.close();
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
                className="relative p-3 bg-secondary hover:bg-secondary/80 rounded-xl transition-colors"
                title="Notifications"
            >
                <BellIcon className="w-5 h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                {unreadCount > 0 && (
                    <div className="absolute top-0 right-0 w-5 h-5 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full border-2 border-background">
                        {unreadCount}
                    </div>
                )}
            </button>

            {isOpen && (
                <div className="absolute right-0 top-full mt-4 w-80 bg-card border border-border rounded-xl shadow-2xl overflow-hidden animate-in fade-in slide-in-from-top-2">
                    <div className="p-4 border-b border-border flex justify-between items-center">
                        <h3 className="font-bold text-foreground">Notifications</h3>
                        {unreadCount > 0 && (
                            <span className="text-xs text-primary cursor-pointer hover:underline" onClick={markAsRead}>
                                Mark all read
                            </span>
                        )}
                    </div>
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="p-8 text-center text-muted-foreground text-sm">
                                No notifications
                            </div>
                        ) : (
                            notifications.map(n => (
                                <div key={n.id} className={`p-4 border-b border-border last:border-0 hover:bg-secondary/30 transition-colors ${!n.read ? 'bg-secondary/10' : ''}`}>
                                    <div className="flex gap-3">
                                        <div className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${n.type === 'WARNING' ? 'bg-amber-500' :
                                            n.type === 'ERROR' ? 'bg-red-500' :
                                                n.type === 'SUCCESS' ? 'bg-green-500' :
                                                    'bg-blue-500'
                                            }`} />
                                        <div>
                                            <p className="text-sm text-foreground leading-snug">{n.message}</p>
                                            <p className="text-[10px] text-muted-foreground mt-1">
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
