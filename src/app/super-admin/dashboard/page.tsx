export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import StatsCard from '@/components/ui/StatsCard';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import { formatDistanceToNow } from 'date-fns';
import {
    GlobeIcon,
    LockClosedIcon,
    ClipboardIcon,
    PersonIcon,
    LightningBoltIcon,
    SpeakerLoudIcon,
    GearIcon
} from '@radix-ui/react-icons';

async function getSuperStats() {
    const [events, users, bookings, members, allLogs] = await Promise.all([
        prisma.event.findMany({
            include: {
                sectors: {
                    include: {
                        tents: {
                            include: { bookings: true }
                        }
                    }
                }
            }
        }),
        prisma.user.findMany(),
        prisma.booking.findMany({ include: { members: true } }),
        prisma.member.count(),
        prisma.log.findMany({
            include: { user: true },
            orderBy: { createdAt: 'desc' },
            take: 10
        })
    ]);

    const eventAdmins = users.filter((u: any) => u.role === 'EVENT_ADMIN').length;
    const deskAdmins = users.filter((u: any) => u.role === 'DESK_ADMIN').length;
    const superAdmins = users.filter((u: any) => u.role === 'SUPER_ADMIN').length;

    const eventPerformance = events.map((e: any) => {
        const eventBookings = e.sectors.flatMap((s: any) => s.tents.flatMap((t: any) => t.bookings));
        const activeCount = eventBookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length;
        return {
            label: e.name,
            value: activeCount,
            color: 'bg-primary'
        };
    });

    // Booking Status Distribution - Using Theme Colors
    const bookingStatuses = {
        CONFIRMED: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
        CHECKED_IN: bookings.filter((b: any) => b.status === 'CHECKED_IN').length,
        CHECKED_OUT: bookings.filter((b: any) => b.status === 'CHECKED_OUT').length,
        CANCELLED: bookings.filter((b: any) => b.status === 'CANCELLED').length,
    };

    const bookingStatusData = [
        { label: 'Confirmed', value: bookingStatuses.CONFIRMED, color: '#e34000' }, // Primary
        { label: 'In Tent', value: bookingStatuses.CHECKED_IN, color: '#10B981' },
        { label: 'Archived', value: bookingStatuses.CHECKED_OUT, color: '#6B7280' },
        { label: 'Cancelled', value: bookingStatuses.CANCELLED, color: '#EF4444' },
    ];

    return {
        totalEvents: events.length,
        totalUsers: users.length,
        totalBookings: bookings.length,
        totalGuests: members,
        userDistribution: { superAdmins, eventAdmins, deskAdmins },
        bookingStatusData,
        eventPerformance,
        recentLogs: allLogs
    };
}

export default async function SuperAdminDashboard() {
    const stats = await getSuperStats();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Page Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">
                        Global Command
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">High-level oversight of all event ecosystems.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 rounded-2xl bg-orange-100 border border-orange-200 text-orange-700 text-sm font-bold flex items-center gap-2 shadow-sm">
                        <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                        <span className="hidden sm:inline">SYSTEM NODE:</span> MASTER
                    </div>
                </div>
            </div>

            {/* Global Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatsCard
                    label="Active Events"
                    value={stats.totalEvents}
                    subtext="Live campsite nodes"
                    icon={<GlobeIcon className="w-6 h-6 text-primary" />}
                    className="hover:shadow-[0_0_30px_rgba(227,64,0,0.15)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="System Users"
                    value={stats.totalUsers}
                    subtext="All admin tiers"
                    icon={<LockClosedIcon className="w-6 h-6 text-orange-600" />}
                    className="hover:shadow-[0_0_30px_rgba(249,115,22,0.15)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="Global Bookings"
                    value={stats.totalBookings}
                    subtext="Historical & current"
                    icon={<ClipboardIcon className="w-6 h-6 text-red-600" />}
                    className="hover:shadow-[0_0_30px_rgba(220,38,38,0.15)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="Guest Network"
                    value={stats.totalGuests}
                    subtext="Verified identities"
                    icon={<PersonIcon className="w-6 h-6 text-primary" />}
                    className="hover:shadow-[0_0_30px_rgba(227,64,0,0.15)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Performance & Distribution */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-foreground">Event Performance</h3>
                                <p className="text-xs md:text-sm text-muted-foreground">Active bookings across all event nodes</p>
                            </div>
                            <div className="hidden sm:block text-xs bg-orange-100 text-orange-700 border border-orange-200 px-3 py-1 rounded-full font-bold">NODE_ANALYTICS</div>
                        </div>
                        <div className="h-64 md:h-72 flex items-end overflow-x-auto custom-scrollbar pb-2">
                            <div className="min-w-[300px] w-full h-full flex items-end">
                                {stats.eventPerformance.length > 0 ? (
                                    <BarChart data={stats.eventPerformance} height={250} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center border border-dashed border-border rounded-2xl text-muted-foreground italic bg-secondary/30">
                                        Awaiting node data...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm flex flex-col items-center justify-between">
                            <h4 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 w-full text-center">User Composition</h4>
                            <div className="flex-1 flex items-center justify-center py-4">
                                <DonutChart
                                    data={[
                                        { label: 'Super', value: stats.userDistribution.superAdmins, color: '#e34000' },
                                        { label: 'Event', value: stats.userDistribution.eventAdmins, color: '#ea580c' },
                                        { label: 'Desk', value: stats.userDistribution.deskAdmins, color: '#f97316' },
                                    ]}
                                    size={160}
                                />
                            </div>
                            <div className="mt-6 text-center grid grid-cols-3 gap-4 w-full border-t border-border pt-6">
                                <div>
                                    <div className="text-lg font-black text-primary">{stats.userDistribution.superAdmins}</div>
                                    <div className="text-[9px] text-muted-foreground font-black uppercase">SUPER</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-orange-600">{stats.userDistribution.eventAdmins}</div>
                                    <div className="text-[9px] text-muted-foreground font-black uppercase">EVENT</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-red-600">{stats.userDistribution.deskAdmins}</div>
                                    <div className="text-[9px] text-muted-foreground font-black uppercase">DESK</div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm flex flex-col items-center justify-between">
                            <h4 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest mb-6 w-full text-center">Booking Lifecycle</h4>
                            <div className="flex-1 flex items-center justify-center py-4">
                                <DonutChart
                                    data={stats.bookingStatusData}
                                    size={160}
                                />
                            </div>
                            <div className="mt-6 w-full border-t border-border pt-6">
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    {stats.bookingStatusData.map(d => (
                                        <div key={d.label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                                <span className="text-[10px] text-muted-foreground font-medium">{d.label}</span>
                                            </div>
                                            <span className="text-[10px] text-foreground font-bold">{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 bg-white p-8 rounded-[2rem] border border-border shadow-sm space-y-4">
                            <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-widest mb-4">Quick Operations</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { name: 'Deploy New Event', href: '/super-admin/events', icon: <GlobeIcon className="w-5 h-5" />, col: 'text-primary', desc: 'Initialize campsite node' },
                                    { name: 'Audit User Access', href: '/super-admin/users', icon: <LockClosedIcon className="w-5 h-5" />, col: 'text-orange-600', desc: 'Revoke or grant perms' },
                                    { name: 'System Announcements', href: '/super-admin/notifications', icon: <SpeakerLoudIcon className="w-5 h-5" />, col: 'text-red-500', desc: 'Push global broadcast' },
                                    { name: 'Global Settings', href: '/super-admin/settings', icon: <GearIcon className="w-5 h-5" />, col: 'text-muted-foreground', desc: 'Platform configuration' }
                                ].map((link) => (
                                    <a key={link.name} href={link.href} className="flex items-center justify-between p-4 rounded-2xl bg-secondary hover:bg-orange-50 border border-border hover:border-primary/30 transition-all group shadow-sm">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl bg-white shadow-sm group-hover:scale-110 transition-transform ${link.col}`}>
                                                {link.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground transition-colors">{link.name}</div>
                                                <div className="text-[10px] text-muted-foreground">{link.desc}</div>
                                            </div>
                                        </div>
                                        <span className="text-muted-foreground group-hover:translate-x-1 transition-transform pr-2">→</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Global Activity Feed */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-foreground">System Feed</h3>
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-primary">
                                <LightningBoltIcon className="w-5 h-5 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {stats.recentLogs.map((log: any) => (
                                <div key={log.id} className="relative pl-6 pb-2 border-l border-border group">
                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-secondary border border-border group-hover:border-primary transition-colors"></div>
                                    <div className="flex justify-between items-start mb-1 leading-none">
                                        <span className="text-[10px] font-black text-primary uppercase tracking-tighter">{log.action}</span>
                                        <span className="text-[10px] text-muted-foreground font-mono italic">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                                        {log.details}
                                    </p>
                                    <p className="text-[10px] text-muted-foreground mt-2 font-medium">via {log.user.name || 'System'}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-border">
                            <a href="/super-admin/logs" className="block w-full text-center py-3 rounded-xl bg-primary text-white text-xs font-bold uppercase tracking-widest hover:bg-primary/90 transition-all shadow-md hover:shadow-lg hover:-translate-y-0.5">
                                ACCESS GLOBAL ARCHIVE
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
