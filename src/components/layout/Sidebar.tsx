'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import clsx from 'clsx';
import { useState } from 'react';
import { ExitIcon } from '@radix-ui/react-icons';

export type NavItem = {
    name: string;
    href: string;
    icon: React.ReactNode;
};

export type SidebarProps = {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
    navItems: NavItem[];
    isOpen: boolean;
    onClose: () => void;
};

export default function Sidebar({ title, subtitle, icon, color, navItems, isOpen, onClose }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const handleLogout = async () => {
        setLoading(true);
        await fetch('/api/logout', { method: 'POST' });
        router.push('/login');
    };

    // Enhanced Color Maps
    const colorClasses: Record<string, { bg: string, text: string, shadow: string, border: string, iconBg: string, glow: string }> = {
        primary: {
            bg: 'from-[#8B5CF6] to-[#6366F1]',
            text: 'text-[#A78BFA]',
            shadow: 'shadow-purple-500/40',
            border: 'border-purple-500/20',
            iconBg: 'bg-[#8B5CF6]',
            glow: 'rgba(139, 92, 246, 0.5)',
        },
        orange: {
            bg: 'from-[#F59E0B] to-[#D97706]',
            text: 'text-[#FBBF24]',
            shadow: 'shadow-orange-500/40',
            border: 'border-orange-500/20',
            iconBg: 'bg-[#F59E0B]',
            glow: 'rgba(245, 158, 11, 0.5)',
        },
        emerald: {
            bg: 'from-[#10B981] to-[#059669]',
            text: 'text-[#34D399]',
            shadow: 'shadow-emerald-500/40',
            border: 'border-emerald-500/20',
            iconBg: 'bg-[#10B981]',
            glow: 'rgba(16, 185, 129, 0.5)',
        },
        blue: {
            bg: 'from-[#3B82F6] to-[#2563EB]',
            text: 'text-[#60A5FA]',
            shadow: 'shadow-blue-500/40',
            border: 'border-blue-500/20',
            iconBg: 'bg-[#3B82F6]',
            glow: 'rgba(59, 130, 246, 0.5)',
        }
    };

    const theme = colorClasses[color] || colorClasses.primary;

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside className={clsx(
                "fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col border-r border-white/5 bg-[#0a0a0c]/95 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static h-screen",
                isOpen ? "translate-x-0 shadow-2xl shadow-black" : "-translate-x-full"
            )}>
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.bg} flex items-center justify-center text-xl shadow-lg ${theme.shadow}`}>
                            {icon}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight tracking-tight text-white">
                                {title.split(' ').map((word, i) => (
                                    <span key={i} className={i === 1 ? theme.text : ''}>{word} </span>
                                ))}
                            </h1>
                            <p className="text-[10px] text-gray-500 uppercase tracking-widest font-semibold">{subtitle}</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden p-2 text-gray-400 hover:text-white">
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-4 px-4 mt-2">Menu</div>
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                onClick={() => {
                                    if (window.innerWidth < 1024) onClose();
                                }}
                                className={clsx(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group relative overflow-hidden",
                                    isActive
                                        ? `bg-white/5 ${theme.text} shadow-inner font-bold border ${theme.border}`
                                        : "text-gray-400 hover:bg-white/5 hover:text-white border border-transparent"
                                )}
                            >
                                <span className={clsx("transition-transform duration-300 text-lg", isActive ? "scale-110" : "group-hover:scale-110")}>{item.icon}</span>
                                <span>{item.name}</span>
                                {isActive && <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 ${theme.iconBg} rounded-r-full`} />}

                                {/* Hover Glow */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${theme.bg} opacity-0 active:opacity-10 group-hover:opacity-5 transition-opacity pointer-events-none`} />
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-4 border-t border-white/5 bg-black/20">
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors group relative overflow-hidden"
                    >
                        <ExitIcon className="group-hover:-translate-x-1 transition-transform w-5 h-5" />
                        <span>{loading ? 'Logging out...' : 'Sign Out'}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
