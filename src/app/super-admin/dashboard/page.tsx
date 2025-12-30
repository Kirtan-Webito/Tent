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
            color: 'bg-indigo-500'
        };
    });

    // Booking Status Distribution
    const bookingStatuses = {
        CONFIRMED: bookings.filter((b: any) => b.status === 'CONFIRMED').length,
        CHECKED_IN: bookings.filter((b: any) => b.status === 'CHECKED_IN').length,
        CHECKED_OUT: bookings.filter((b: any) => b.status === 'CHECKED_OUT').length,
        CANCELLED: bookings.filter((b: any) => b.status === 'CANCELLED').length,
    };

    const bookingStatusData = [
        { label: 'Confirmed', value: bookingStatuses.CONFIRMED, color: '#6366F1' },
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
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500 bg-clip-text text-transparent">
                        Global Command
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">High-level oversight of all event ecosystems.</p>
                </div>
                <div className="flex items-center gap-2">
                    <div className="px-4 py-2 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
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
                    icon={<GlobeIcon className="w-6 h-6 text-indigo-400" />}
                    className="hover:shadow-[0_0_30px_rgba(129,140,248,0.15)] transition-all"
                />
                <StatsCard
                    label="System Users"
                    value={stats.totalUsers}
                    subtext="All admin tiers"
                    icon={<LockClosedIcon className="w-6 h-6 text-purple-400" />}
                    className="hover:shadow-[0_0_30px_rgba(192,132,252,0.15)] transition-all"
                />
                <StatsCard
                    label="Global Bookings"
                    value={stats.totalBookings}
                    subtext="Historical & current"
                    icon={<ClipboardIcon className="w-6 h-6 text-indigo-400" />}
                    className="hover:shadow-[0_0_30_rgba(79,70,229,0.15)] transition-all"
                />
                <StatsCard
                    label="Guest Network"
                    value={stats.totalGuests}
                    subtext="Verified identities"
                    icon={<PersonIcon className="w-6 h-6 text-pink-400" />}
                    className="hover:shadow-[0_0_30_rgba(236,72,153,0.15)] transition-all"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Left: Performance & Distribution */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-2xl overflow-hidden">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-white">Event Performance</h3>
                                <p className="text-xs md:text-sm text-gray-500">Active bookings across all event nodes</p>
                            </div>
                            <div className="hidden sm:block text-xs bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full font-bold">NODE_ANALYTICS</div>
                        </div>
                        <div className="h-64 md:h-72 flex items-end overflow-x-auto custom-scrollbar pb-2">
                            <div className="min-w-[300px] w-full h-full flex items-end">
                                {stats.eventPerformance.length > 0 ? (
                                    <BarChart data={stats.eventPerformance} height={250} />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center border border-dashed border-white/10 rounded-2xl text-gray-600 italic">
                                        Awaiting node data...
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-white/5 flex flex-col items-center justify-between">
                            <h4 className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 w-full text-center">User Composition</h4>
                            <div className="flex-1 flex items-center justify-center py-4">
                                <DonutChart
                                    data={[
                                        { label: 'Super', value: stats.userDistribution.superAdmins, color: '#A78BFA' },
                                        { label: 'Event', value: stats.userDistribution.eventAdmins, color: '#6366F1' },
                                        { label: 'Desk', value: stats.userDistribution.deskAdmins, color: '#EC4899' },
                                    ]}
                                    size={160}
                                />
                            </div>
                            <div className="mt-6 text-center grid grid-cols-3 gap-4 w-full border-t border-white/5 pt-6">
                                <div>
                                    <div className="text-lg font-black text-indigo-400">{stats.userDistribution.superAdmins}</div>
                                    <div className="text-[9px] text-gray-600 font-black uppercase">SUPER</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-indigo-500">{stats.userDistribution.eventAdmins}</div>
                                    <div className="text-[9px] text-gray-600 font-black uppercase">EVENT</div>
                                </div>
                                <div>
                                    <div className="text-lg font-black text-pink-500">{stats.userDistribution.deskAdmins}</div>
                                    <div className="text-[9px] text-gray-600 font-black uppercase">DESK</div>
                                </div>
                            </div>
                        </div>

                        <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-white/5 flex flex-col items-center justify-between">
                            <h4 className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest mb-6 w-full text-center">Booking Lifecycle</h4>
                            <div className="flex-1 flex items-center justify-center py-4">
                                <DonutChart
                                    data={stats.bookingStatusData}
                                    size={160}
                                />
                            </div>
                            <div className="mt-6 w-full border-t border-white/5 pt-6">
                                <div className="grid grid-cols-2 gap-y-2 gap-x-4">
                                    {stats.bookingStatusData.map(d => (
                                        <div key={d.label} className="flex items-center justify-between">
                                            <div className="flex items-center gap-2">
                                                <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: d.color }} />
                                                <span className="text-[10px] text-gray-400 font-medium">{d.label}</span>
                                            </div>
                                            <span className="text-[10px] text-white font-bold">{d.value}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="md:col-span-2 glass p-8 rounded-[2rem] border-white/5 space-y-4">
                            <h4 className="text-sm font-bold text-gray-500 uppercase tracking-widest mb-4">Quick Operations</h4>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { name: 'Deploy New Event', href: '/super-admin/events', icon: <GlobeIcon className="w-5 h-5" />, col: 'text-blue-400', desc: 'Initialize campsite node' },
                                    { name: 'Audit User Access', href: '/super-admin/users', icon: <LockClosedIcon className="w-5 h-5" />, col: 'text-purple-400', desc: 'Revoke or grant perms' },
                                    { name: 'System Announcements', href: '/super-admin/notifications', icon: <SpeakerLoudIcon className="w-5 h-5" />, col: 'text-indigo-400', desc: 'Push global broadcast' },
                                    { name: 'Global Settings', href: '/super-admin/settings', icon: <GearIcon className="w-5 h-5" />, col: 'text-gray-400', desc: 'Platform configuration' }
                                ].map((link) => (
                                    <a key={link.name} href={link.href} className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group">
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl bg-white/5 group-hover:scale-110 transition-transform ${link.col}`}>
                                                {link.icon}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-200 group-hover:text-white transition-colors">{link.name}</div>
                                                <div className="text-[10px] text-gray-500">{link.desc}</div>
                                            </div>
                                        </div>
                                        <span className="text-gray-600 group-hover:translate-x-1 transition-transform pr-2">→</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Global Activity Feed */}
                <div className="lg:col-span-4 flex flex-col gap-8">
                    <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent shadow-2xl h-full flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold text-white">System Feed</h3>
                            <div className="w-10 h-10 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                                <LightningBoltIcon className="w-5 h-5 animate-pulse" />
                            </div>
                        </div>

                        <div className="space-y-6 flex-1">
                            {stats.recentLogs.map((log: any) => (
                                <div key={log.id} className="relative pl-6 pb-2 border-l border-white/5 group">
                                    <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-gray-800 border border-gray-700 group-hover:border-indigo-500 transition-colors"></div>
                                    <div className="flex justify-between items-start mb-1 leading-none">
                                        <span className="text-[10px] font-black text-indigo-400 uppercase tracking-tighter">{log.action}</span>
                                        <span className="text-[10px] text-gray-600 font-mono italic">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">
                                        {log.details}
                                    </p>
                                    <p className="text-[10px] text-gray-500 mt-2 font-medium">via {log.user.name || 'System'}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-8 pt-6 border-t border-white/5">
                            <a href="/super-admin/logs" className="block w-full text-center py-3 rounded-xl bg-white/5 hover:bg-indigo-500/10 text-[10px] font-black text-gray-500 hover:text-indigo-400 uppercase tracking-widest transition-all">
                                ACCESS GLOBAL ARCHIVE
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
