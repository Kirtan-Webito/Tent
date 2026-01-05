'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import NotificationBell from '@/components/ui/NotificationBell';
import BroadcastModal from '@/components/ui/BroadcastModal';
import {
    DashboardIcon,
    GridIcon,
    CubeIcon,
    CalendarIcon,
    AvatarIcon,
    GearIcon,
    QuestionMarkCircledIcon,
    SpeakerLoudIcon,
    GlobeIcon,
    HamburgerMenuIcon
} from '@radix-ui/react-icons';

export default function EventAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/event-admin/dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
        { name: 'Sectors & Tents', href: '/event-admin/sectors', icon: <GridIcon className="w-5 h-5" /> },
        { name: 'Tents Inventory', href: '/event-admin/tents', icon: <CubeIcon className="w-5 h-5" /> },
        { name: 'Bookings & Guests', href: '/event-admin/bookings', icon: <CalendarIcon className="w-5 h-5" /> },
        { name: 'Desk Team', href: '/event-admin/team', icon: <AvatarIcon className="w-5 h-5" /> },
        { name: 'Help', href: '/event-admin/help', icon: <QuestionMarkCircledIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            <Sidebar
                title="Tent System"
                subtitle="Event Admin"
                icon={<GlobeIcon className="w-6 h-6" />}
                color="primary"
                navItems={navItems}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
                isCollapsed={isCollapsed}
                onToggle={() => setIsCollapsed(!isCollapsed)}
            />

            <main className="flex-1 overflow-auto relative bg-gradient-to-br from-background to-secondary/30">
                {/* Decorative Background Elements */}
                <div className="fixed top-[-20%] right-[-10%] w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10">
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-3 bg-white border border-input rounded-xl hover:bg-secondary active:scale-95 transition-all outline-none"
                        >
                            <HamburgerMenuIcon className="w-5 h-5 text-foreground" />
                        </button>

                        <div className="flex-1 glass px-4 md:px-6 py-2 rounded-2xl border-border/50 shadow-sm relative">
                            <GlobalSearchBar />
                        </div>
                        <button
                            onClick={() => setIsBroadcastOpen(true)}
                            className="p-3 bg-white border border-input rounded-xl hover:bg-secondary hover:border-primary/20 hover:scale-105 active:scale-95 transition-all shadow-sm text-foreground"
                            title="Broadcast Message"
                        >
                            <SpeakerLoudIcon className="w-5 h-5" />
                        </button>
                        <NotificationBell />
                    </div>
                    {children}
                </div>

                <BroadcastModal
                    isOpen={isBroadcastOpen}
                    onClose={() => setIsBroadcastOpen(false)}
                />
            </main>
        </div>
    );
}
