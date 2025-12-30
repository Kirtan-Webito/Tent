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
    RocketIcon,
    HamburgerMenuIcon
} from '@radix-ui/react-icons';

export default function EventAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isBroadcastOpen, setIsBroadcastOpen] = useState(false);

    const navItems = [
        { name: 'Dashboard', href: '/event-admin/dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
        { name: 'Sectors & Tents', href: '/event-admin/sectors', icon: <GridIcon className="w-5 h-5" /> },
        { name: 'Tents Inventory', href: '/event-admin/tents', icon: <CubeIcon className="w-5 h-5" /> },
        { name: 'Bookings & Guests', href: '/event-admin/bookings', icon: <CalendarIcon className="w-5 h-5" /> },
        { name: 'Desk Team', href: '/event-admin/team', icon: <AvatarIcon className="w-5 h-5" /> },
        { name: 'Settings', href: '/event-admin/settings', icon: <GearIcon className="w-5 h-5" /> },
        { name: 'Help', href: '/event-admin/help', icon: <QuestionMarkCircledIcon className="w-5 h-5" /> },
    ];

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans">
            <Sidebar
                title="Event Hub"
                subtitle="Event Admin"
                icon={<RocketIcon className="w-6 h-6" />}
                color="emerald"
                navItems={navItems}
                isOpen={isSidebarOpen}
                onClose={() => setIsSidebarOpen(false)}
            />

            <main className="flex-1 overflow-auto relative bg-[#0a0a0c]">
                {/* Advanced Mesh Gradient Background */}
                <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
                    <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute top-[20%] right-[-5%] w-[30%] h-[50%] bg-teal-500/10 rounded-full blur-[100px]" />
                    <div className="absolute bottom-[-10%] left-[20%] w-[50%] h-[30%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDuration: '8s' }} />
                    <div className="absolute top-[40%] left-[40%] w-[20%] h-[20%] bg-purple-500/5 rounded-full blur-[80px]" />
                </div>

                <div className="p-4 md:p-10 max-w-[1600px] mx-auto space-y-6 md:space-y-10 animate-in fade-in slide-in-from-top-4 duration-700 relative z-10">
                    <div className="flex items-center gap-4 md:gap-6">
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 active:scale-95 transition-all outline-none"
                        >
                            <HamburgerMenuIcon className="w-5 h-5" />
                        </button>

                        <div className="flex-1 glass px-4 md:px-6 py-2 rounded-2xl border-white/5 shadow-2xl relative">
                            <GlobalSearchBar />
                        </div>
                        <button
                            onClick={() => setIsBroadcastOpen(true)}
                            className="p-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 hover:border-white/20 hover:scale-105 active:scale-95 transition-all shadow-lg text-white"
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
