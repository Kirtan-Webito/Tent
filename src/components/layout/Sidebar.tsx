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
            bg: 'from-primary to-orange-600',
            text: 'text-primary',
            shadow: 'shadow-primary/40',
            border: 'border-primary/20',
            iconBg: 'bg-primary',
            glow: 'rgba(227, 64, 0, 0.5)',
        },
        orange: {
            bg: 'from-orange-500 to-red-500',
            text: 'text-orange-600',
            shadow: 'shadow-orange-500/40',
            border: 'border-orange-500/20',
            iconBg: 'bg-orange-500',
            glow: 'rgba(245, 158, 11, 0.5)',
        },
        emerald: {
            bg: 'from-primary to-orange-600',
            text: 'text-primary',
            shadow: 'shadow-primary/40',
            border: 'border-primary/20',
            iconBg: 'bg-primary',
            glow: 'rgba(227, 64, 0, 0.5)',
        },
        blue: {
            bg: 'from-primary to-orange-600',
            text: 'text-primary',
            shadow: 'shadow-primary/40',
            border: 'border-primary/20',
            iconBg: 'bg-primary',
            glow: 'rgba(227, 64, 0, 0.5)',
        }
    };

    const theme = colorClasses[color] || colorClasses.primary;

    return (
        <>
            {/* Mobile Backdrop */}
            <div
                className={clsx(
                    "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity duration-300 lg:hidden",
                    isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                )}
                onClick={onClose}
            />

            <aside className={clsx(
                "fixed top-0 left-0 bottom-0 w-72 z-50 flex flex-col border-r border-border bg-card/95 backdrop-blur-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static h-screen shadow-xl",
                isOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="p-8 pb-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl bg-gradient-to-tr ${theme.bg} flex items-center justify-center text-xl shadow-lg ${theme.shadow} text-white`}>
                            {icon}
                        </div>
                        <div>
                            <h1 className="font-bold text-lg leading-tight tracking-tight text-foreground">
                                {title.split(' ').map((word, i) => (
                                    <span key={i} className={i === 1 ? theme.text : ''}>{word} </span>
                                ))}
                            </h1>
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-semibold">{subtitle}</p>
                        </div>
                    </div>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="lg:hidden p-2 text-muted-foreground hover:text-foreground">
                        <span className="text-xl">✕</span>
                    </button>
                </div>

                <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                    <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4 mt-2">Menu</div>
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
                                        ? `bg-primary/10 ${theme.text} shadow-sm font-bold border ${theme.border}`
                                        : "text-muted-foreground hover:bg-secondary hover:text-foreground border border-transparent"
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

                <div className="p-4 border-t border-border bg-secondary/30">
                    <button
                        onClick={handleLogout}
                        disabled={loading}
                        className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-destructive hover:bg-destructive/10 hover:text-destructive transition-colors group relative overflow-hidden"
                    >
                        <ExitIcon className="group-hover:-translate-x-1 transition-transform w-5 h-5" />
                        <span>{loading ? 'Logging out...' : 'Sign Out'}</span>
                    </button>
                </div>
            </aside>
        </>
    );
}
