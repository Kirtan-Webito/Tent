export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import StatsCard from '@/components/ui/StatsCard';
import BarChart from '@/components/charts/BarChart';
import DonutChart from '@/components/charts/DonutChart';
import { formatDistanceToNow } from 'date-fns';
import {
    PersonIcon,
    CubeIcon,
    Pencil2Icon,
    LockClosedIcon,
    ClipboardIcon,
    FileTextIcon
} from '@radix-ui/react-icons';

async function getStats(eventId: string) {
    const sectors = await prisma.sector.findMany({
        where: { eventId },
        include: {
            tents: {
                include: {
                    bookings: {
                        include: { members: true }
                    }
                }
            }
        }
    });

    const tentsCount = sectors.reduce((sum: number, s: any) => sum + s.tents.length, 0);
    const bookings = sectors.flatMap((s: any) => s.tents.flatMap((t: any) => t.bookings));

    // Active occupancy based on CHECKED_IN or CONFIRMED status
    const activeBookings = bookings.filter((b: any) => b.status === 'CHECKED_IN' || b.status === 'CONFIRMED');
    const totalOccupants = activeBookings.reduce((sum: number, b: any) => sum + (b.members?.length || 0), 0);

    const totalCapacity = sectors.reduce((sum: number, s: any) => sum + s.tents.reduce((ts: number, t: any) => ts + t.capacity, 0), 0);

    const deskAdminsCount = await prisma.user.count({
        where: { role: 'DESK_ADMIN', assignedEventId: eventId }
    });

    // Guest Demographics
    const members = bookings.flatMap((b: any) => b.members || []);
    const genderData = [
        { label: 'Male', value: members.filter((m: any) => m.gender === 'MALE').length, color: '#60A5FA' },
        { label: 'Female', value: members.filter((m: any) => m.gender === 'FEMALE').length, color: '#F472B6' },
        { label: 'Other', value: members.filter((m: any) => m.gender === 'OTHER').length, color: '#A78BFA' },
    ];

    // Booking Status Distribution
    const statusData = [
        { label: 'Confirmed', value: bookings.filter((b: any) => b.status === 'CONFIRMED').length, color: '#6366F1' },
        { label: 'In Tent', value: bookings.filter((b: any) => b.status === 'CHECKED_IN').length, color: '#10B981' },
        { label: 'Archived', value: bookings.filter((b: any) => b.status === 'CHECKED_OUT').length, color: '#6B7280' },
        { label: 'Cancelled', value: bookings.filter((b: any) => b.status === 'CANCELLED').length, color: '#EF4444' },
    ];

    // Sector Occupancy for Chart
    const sectorData = sectors.map((s: any, idx: number) => {
        const sectorOccupants = s.tents.reduce((acc: number, t: any) => {
            const active = t.bookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
            return acc + active.reduce((sum: number, b: any) => sum + (b.members?.length || 0), 0);
        }, 0);
        const sectorCapacity = s.tents.reduce((acc: number, t: any) => acc + t.capacity, 0);

        // Rotating premium colors - using warmer tones for the new theme
        const colors = ['bg-orange-500', 'bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-rose-500', 'bg-pink-500'];

        return {
            label: s.name,
            value: sectorOccupants,
            fullValue: sectorCapacity,
            color: colors[idx % colors.length]
        };
    });

    // Recent Logs for this event (logs are tied to users, so we find users of this event)
    const eventUsers = await prisma.user.findMany({
        where: {
            OR: [
                { assignedEventId: eventId },
                { role: 'SUPER_ADMIN' }
            ]
        },
        select: { id: true }
    });

    const recentLogs = await prisma.log.findMany({
        where: {
            userId: { in: eventUsers.map((u: any) => u.id) }
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 10
    });

    return {
        tentsCount,
        totalOccupants,
        totalCapacity,
        activeBookingsCount: activeBookings.length,
        deskAdminsCount,
        sectorData,
        genderData,
        statusData,
        recentLogs
    };
}

export default async function DashboardPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;

    if (!eventId) return <div>No event assigned.</div>;

    const stats = await getStats(eventId);
    const occupancyPercent = stats.totalCapacity > 0
        ? Math.round((stats.totalOccupants / stats.totalCapacity) * 100)
        : 0;

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            {/* Header section with glass effect preview */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 md:gap-4">
                <div>
                    <h2 className="text-3xl md:text-4xl font-black tracking-tight bg-gradient-to-r from-primary via-orange-500 to-red-600 bg-clip-text text-transparent">
                        Command Center
                    </h2>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Empowering your event operations with real-time intelligence.</p>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                    <div className="flex flex-col items-start md:items-end px-4 border-l md:border-l-0 md:border-r border-border/50">
                        <span className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">Status</span>
                        <span className="text-xs font-bold text-foreground uppercase tracking-tighter mt-1">OPERATIONAL</span>
                    </div>
                    <div className="px-4 py-2 rounded-2xl bg-orange-100 border border-orange-200 text-orange-700 text-sm font-bold animate-pulse flex items-center gap-2 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-primary" />
                        <span className="hidden sm:inline">LIVE_FEED:</span> OK
                    </div>
                </div>
            </div>

            {/* Premium Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatsCard
                    label="Live Occupancy"
                    value={`${stats.totalOccupants}`}
                    subtext={`${occupancyPercent}% total capacity`}
                    icon={<PersonIcon className="w-6 h-6 text-primary" />}
                    className="hover:shadow-[0_0_30px_rgba(227,64,0,0.15)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="Tents Deployed"
                    value={stats.tentsCount}
                    subtext="Across all sectors"
                    icon={<CubeIcon className="w-6 h-6 text-primary" />}
                    className="hover:shadow-[0_0_30px_rgba(251,146,60,0.15)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="Active Bookings"
                    value={stats.activeBookingsCount}
                    subtext="Confirmed/Checked-in"
                    icon={<Pencil2Icon className="w-6 h-6 text-primary" />}
                    className="hover:shadow-[0_0_30px_rgba(59,130,246,0.15)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="Staff Online"
                    value={stats.deskAdminsCount}
                    subtext="Desk operators assigned"
                    icon={<LockClosedIcon className="w-6 h-6 text-primary" />}
                    className="hover:shadow-[0_0_30px_rgba(245,158,11,0.15)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Left: Occupancy Deep Dive */}
                <div className="lg:col-span-8 space-y-6 md:space-y-8">
                    <div className="bg-white p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm overflow-hidden">
                        <div className="flex items-center justify-between mb-6 md:mb-8">
                            <div>
                                <h3 className="text-xl md:text-2xl font-bold text-foreground">Sector Performance</h3>
                                <p className="text-xs md:text-sm text-muted-foreground">Occupancy breakdown by zone</p>
                            </div>
                            <div className="hidden sm:block text-xs font-mono text-orange-700 bg-orange-100 px-3 py-1 rounded-full border border-orange-200 shadow-sm">
                                DATA_REFRESH: OK
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="md:col-span-2 lg:col-span-1 h-64 md:h-72 flex items-end overflow-x-auto custom-scrollbar pb-2">
                                <div className="min-w-[300px] w-full h-full flex items-end">
                                    {stats.sectorData.length > 0 ? (
                                        <BarChart data={stats.sectorData} height={250} />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-muted-foreground italic border border-dashed border-border rounded-2xl bg-secondary/30">
                                            No sector activity found.
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[1.5rem] border border-border shadow-sm">
                                <h4 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center">Guest Diversity</h4>
                                <DonutChart
                                    data={stats.genderData}
                                    size={140}
                                />
                                <div className="mt-4 flex gap-4 text-[9px] font-bold text-muted-foreground uppercase">
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> M</div>
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-pink-400"></div> F</div>
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-purple-400"></div> O</div>
                                </div>
                            </div>

                            <div className="flex flex-col items-center justify-center p-6 bg-white rounded-[1.5rem] border border-border shadow-sm">
                                <h4 className="text-[10px] md:text-xs font-bold text-muted-foreground uppercase tracking-widest mb-4 text-center">Reservation Lifecycle</h4>
                                <DonutChart
                                    data={stats.statusData}
                                    size={140}
                                />
                                <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1 text-[8px] font-bold text-muted-foreground uppercase">
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-indigo-500"></div> Confirmed</div>
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-emerald-500"></div> In Tent</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Controls */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                        {[
                            { name: 'Bookings', href: '/event-admin/bookings', icon: <ClipboardIcon className="w-8 h-8" />, desc: 'Manage all reservations', color: 'bg-white hover:bg-orange-50 border-orange-100' },
                            { name: 'Inventory', href: '/event-admin/tents', icon: <CubeIcon className="w-8 h-8" />, desc: 'Live tent status', color: 'bg-white hover:bg-orange-50 border-orange-100' },
                            { name: 'Team', href: '/event-admin/team', icon: <LockClosedIcon className="w-8 h-8" />, desc: 'Staff permissions', color: 'bg-white hover:bg-orange-50 border-orange-100' }
                        ].map((action) => (
                            <a
                                key={action.name}
                                href={action.href}
                                className={`group p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border transition-all duration-300 shadow-sm hover:shadow-lg hover:-translate-y-1 ${action.color}`}
                            >
                                <div className="text-3xl md:text-4xl mb-4 group-hover:scale-110 group-hover:rotate-6 transition-transform text-primary">{action.icon}</div>
                                <div className="text-lg md:text-xl font-black text-foreground group-hover:text-primary transition-colors">{action.name}</div>
                                <div className="text-[10px] md:text-xs text-muted-foreground mt-2 font-medium line-clamp-1 italic uppercase tracking-wider">{action.desc}</div>
                            </a>
                        ))}
                    </div>
                </div>

                {/* Right: Activity Stream */}
                <div className="lg:col-span-4 flex flex-col gap-6 md:gap-8">
                    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm flex-1 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                            <FileTextIcon className="w-16 h-16 text-primary" />
                        </div>
                        <h3 className="text-xl md:text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
                            Tactical Feed
                        </h3>
                        <div className="space-y-6 relative">
                            <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-gradient-to-b from-primary/50 via-secondary to-transparent"></div>

                            {stats.recentLogs.length === 0 ? (
                                <div className="text-muted-foreground text-sm italic pl-6 py-4">Waiting for tactical updates...</div>
                            ) : (
                                stats.recentLogs.map((log: any) => (
                                    <div key={log.id} className="relative pl-8 group/item">
                                        <div className="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-secondary border border-border group-hover/item:border-primary/50 group-hover/item:bg-primary/20 transition-all shadow-[0_0_8px_rgba(227,64,0,0)] group-hover/item:shadow-[0_0_8px_rgba(227,64,0,0.3)]"></div>
                                        <div className="flex justify-between items-start mb-0.5">
                                            <p className="text-[10px] font-black text-primary uppercase tracking-widest leading-none">
                                                {log.action.replace(/_/g, ' ')}
                                            </p>
                                            <span className="text-[9px] text-muted-foreground font-bold uppercase">{formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}</span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed font-medium group-hover/item:text-foreground transition-colors">
                                            {log.details}
                                        </p>
                                        <p className="text-[9px] text-muted-foreground/70 mt-2 flex items-center gap-1.5 italic">
                                            <span className="w-1 h-1 rounded-full bg-foreground/20"></span>
                                            BY {log.user.name || 'SYSTEM'}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="mt-8 pt-6 border-t border-border">
                            <a
                                href="/event-admin/logs"
                                className="block w-full text-center py-4 rounded-xl bg-secondary hover:bg-orange-50 text-[10px] font-black text-muted-foreground hover:text-primary uppercase tracking-[0.2em] transition-all border border-border hover:border-primary/30 active:scale-95 shadow-sm"
                            >
                                ACCESS FULL AUDIT ARCHIVE
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
