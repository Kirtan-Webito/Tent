'use client';

import { useState } from 'react';
import Sidebar from '@/components/layout/Sidebar';
import GlobalSearchBar from '@/components/ui/GlobalSearchBar';
import NotificationBell from '@/components/ui/NotificationBell';
import {
    DashboardIcon,
    Pencil2Icon,
    PersonIcon,
    BellIcon,
    QuestionMarkCircledIcon,
    GlobeIcon,
    CubeIcon,
    HamburgerMenuIcon
} from '@radix-ui/react-icons';

export default function DeskAdminShell({
    children,
    role
}: {
    children: React.ReactNode;
    role: string;
}) {
    const navItems = [
        { name: 'Operations Hub', href: '/desk-admin/dashboard', icon: <DashboardIcon className="w-5 h-5" /> },
        { name: 'New Booking', href: '/desk-admin/booking', icon: <Pencil2Icon className="w-5 h-5" /> },
        // Only show Guest Registry to TEAM_HEAD, SUPER_ADMIN, EVENT_ADMIN, and DESK_ADMIN
        ...((role === 'TEAM_HEAD' || role === 'SUPER_ADMIN' || role === 'EVENT_ADMIN' || role === 'DESK_ADMIN') ? [
            { name: 'Bookings & Guests', href: '/desk-admin/guests', icon: <PersonIcon className="w-5 h-5" /> }
        ] : []),
        { name: 'Help', href: '/desk-admin/help', icon: <QuestionMarkCircledIcon className="w-5 h-5" /> },
    ];

    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [isCollapsed, setIsCollapsed] = useState(false);

    return (
        <div className="flex h-screen bg-background text-foreground overflow-hidden font-sans selection:bg-primary/30">
            <Sidebar
                title="Tent System"
                subtitle={role.replace('_', ' ')}
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

                <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-6 md:space-y-8 animate-in fade-in duration-500 relative z-10">
                    <div className="flex items-center gap-4">
                        {/* Mobile Toggle */}
                        <button
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-3 bg-white border border-input rounded-xl hover:bg-secondary active:scale-95 transition-all outline-none"
                        >
                            <HamburgerMenuIcon className="w-5 h-5 text-foreground" />
                        </button>

                        <div className="flex-1 bg-white px-4 md:px-6 py-2 rounded-xl border border-border/50 shadow-sm relative">
                            <GlobalSearchBar />
                        </div>
                        <NotificationBell />
                    </div>
                    {children}
                </div>
            </main>
        </div>
    );
}
