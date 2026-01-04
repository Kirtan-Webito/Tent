export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import StatsCard from '@/components/ui/StatsCard';
import DonutChart from '@/components/charts/DonutChart';
import { formatDistanceToNow, startOfDay, endOfDay } from 'date-fns';
import {
    PersonIcon,
    EnterIcon,
    ExitIcon,
    ExclamationTriangleIcon,
    Pencil2Icon,
    BarChartIcon,
    RadiobuttonIcon,
    MoonIcon
} from '@radix-ui/react-icons';

async function getDashboardData(eventId: string, sectorIds?: string[]) {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const sectors = await prisma.sector.findMany({
        where: {
            eventId,
            ...(sectorIds && sectorIds.length > 0 ? { id: { in: sectorIds } } : {})
        },
        include: {
            tents: {
                include: {
                    bookings: {
                        include: {
                            members: true,
                            tent: true
                        }
                    }
                }
            }
        }
    });

    // Aggregates
    const totalTents = sectors.reduce((sum: number, s: any) => sum + s.tents.length, 0);
    const totalCapacity = sectors.reduce((sum: number, s: any) => sum + s.tents.reduce((ts: number, t: any) => ts + t.capacity, 0), 0);

    // Active Bookings
    const bookings = sectors.flatMap((s: any) => s.tents.flatMap((t: any) => t.bookings || []));
    const activeBookings = bookings.filter((b: any) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN');
    const totalOccupants = activeBookings.reduce((sum: number, b: any) => sum + (b.members?.length || 0), 0);

    // Today's Check-ins (confirmed bookings with checkInDate = today)
    const todayCheckins = bookings.filter((b: any) =>
        b.status === 'CONFIRMED' &&
        b.checkInDate &&
        b.checkInDate >= todayStart &&
        b.checkInDate <= todayEnd
    ).length;

    // Today's Check-outs (checked_in bookings with checkOutDate = today)
    const todayCheckouts = bookings.filter((b: any) =>
        b.status === 'CHECKED_IN' &&
        b.checkOutDate &&
        b.checkOutDate >= todayStart &&
        b.checkOutDate <= todayEnd
    ).length;

    // Overdue Check-outs (checked_in bookings with checkOutDate < todayStart)
    const overdueCheckouts = bookings.filter((b: any) =>
        b.status === 'CHECKED_IN' &&
        b.checkOutDate &&
        b.checkOutDate < todayStart
    ).length;

    // Fetch logs for this event
    const eventUsers = await prisma.user.findMany({
        where: { assignedEventId: eventId },
        select: { id: true }
    });

    const recentLogs = await prisma.log.findMany({
        where: {
            userId: { in: eventUsers.map((u: any) => u.id) }
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 8
    });

    // Arrivals vs Departures for Pie Chart
    const stayBreakdown = [
        { label: 'Check-ins', value: todayCheckins, color: '#60A5FA' },
        { label: 'Check-outs', value: todayCheckouts, color: '#F59E0B' },
        { label: 'Overdue', value: overdueCheckouts, color: '#EF4444' },
    ];

    // Sector distribution for this desk admin
    const distributionData = sectors.map((s: any) => ({
        label: s.name,
        value: s.tents.flatMap((t: any) => t.bookings).filter((b: any) => b.status === 'CONFIRMED' || b.status === 'CHECKED_IN').length,
        color: '#e34000'
    }));

    return {
        totalTents,
        totalCapacity,
        totalOccupants,
        todayCheckins,
        todayCheckouts,
        overdueCheckouts,
        occupancyRate: totalCapacity > 0 ? Math.round((totalOccupants / totalCapacity) * 100) : 0,
        stayBreakdown,
        distributionData,
        recentLogs
    };
}

export default async function DashboardPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    const sectorIds = (session as any)?.assignedSectorIds;

    if (!eventId) return <div className="p-8 text-muted-foreground font-medium bg-white rounded-2xl border border-border">Access Denied: No event assigned to your session.</div>;

    const stats = await getDashboardData(eventId, sectorIds);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-foreground tracking-tight">Operations Hub</h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Seamless guest management at your fingertips.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-orange-100 border border-orange-200 text-orange-700 text-[10px] md:text-xs font-bold leading-none flex items-center gap-2 shadow-sm">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                        SYSTEM LIVE
                    </div>
                </div>
            </div>

            {/* Core Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatsCard
                    label="Active Guests"
                    value={stats.totalOccupants}
                    subtext={`${stats.occupancyRate}% Total Capacity`}
                    icon={<PersonIcon className="w-6 h-6 text-primary" />}
                    className="hover:shadow-[0_0_20px_rgba(227,64,0,0.1)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="Today Check-ins"
                    value={stats.todayCheckins}
                    subtext="Scheduled for today"
                    icon={<EnterIcon className="w-6 h-6 text-blue-500" />}
                    className="hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="Today Check-outs"
                    value={stats.todayCheckouts}
                    subtext="Expiring stays"
                    icon={<ExitIcon className="w-6 h-6 text-amber-500" />}
                    className="hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all bg-card border-border shadow-sm hover:translate-y-[-2px]"
                />
                <StatsCard
                    label="Overdue Stays"
                    value={stats.overdueCheckouts}
                    subtext="Action required"
                    icon={<ExclamationTriangleIcon className="w-6 h-6 text-destructive" />}
                    className={`transition-all bg-card border-border shadow-sm hover:translate-y-[-2px] ${stats.overdueCheckouts > 0 ? 'bg-red-50 border-red-200 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'opacity-80'}`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Visual Analytics */}
                <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
                    <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-6">Operations Mix</h3>
                        <div className="flex flex-col gap-8 w-full">
                            <div className="flex flex-col items-center">
                                <DonutChart
                                    data={stats.stayBreakdown}
                                    size={140}
                                />
                                <div className="mt-4 flex gap-4 text-[9px] font-bold text-muted-foreground uppercase">
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Arrivals</div>
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Departures</div>
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Overdue</div>
                                </div>
                            </div>

                            <div className="w-full border-t border-border pt-6 grid grid-cols-2 gap-4">
                                <div className="text-left">
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">UTILIZATION</div>
                                    <div className="text-2xl font-black text-foreground">{stats.occupancyRate}%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mb-1">UNITS</div>
                                    <div className="text-2xl font-black text-foreground">{stats.totalTents}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-border shadow-sm space-y-4">
                        <h4 className="text-[10px] md:text-sm font-bold text-muted-foreground uppercase tracking-widest pl-2">Quick Actions</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                            <a href="/desk-admin/booking" className="btn-primary w-full justify-center group">
                                <Pencil2Icon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-xs md:text-sm">New Booking</span>
                            </a>
                            <a href="/desk-admin/history" className="flex items-center justify-center p-4 rounded-xl bg-secondary hover:bg-secondary/80 border border-border transition-all group font-bold text-xs md:text-sm text-foreground">
                                <BarChartIcon className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform text-muted-foreground group-hover:text-primary" />
                                View History
                            </a>
                        </div>
                    </div>
                </div>

                {/* Desk Activity Feed */}
                <div className="lg:col-span-8">
                    <div className="bg-white p-8 rounded-[2rem] border border-border shadow-sm h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-foreground">Live Activity</h3>
                                <p className="text-sm text-muted-foreground">Real-time updates from the field</p>
                            </div>
                            <RadiobuttonIcon className="w-8 h-8 opacity-20 text-primary" />
                        </div>

                        <div className="space-y-6">
                            {stats.recentLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-muted-foreground italic">
                                    <MoonIcon className="w-12 h-12 mb-4 opacity-50" />
                                    <p>Silence on the desk... all quiet for now.</p>
                                </div>
                            ) : (
                                stats.recentLogs.map((log: any) => (
                                    <div key={log.id} className="flex gap-4 items-start p-4 rounded-2xl bg-secondary hover:bg-orange-50 border border-border transition-all group">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-primary group-hover:shadow-[0_0_8px_rgba(227,64,0,0.5)] transition-all"></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-foreground group-hover:text-primary transition-colors uppercase text-xs tracking-wider">
                                                    {log.action}
                                                </p>
                                                <span className="text-[10px] text-muted-foreground font-mono">
                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                                                {log.details}
                                            </p>
                                            <div className="mt-2 text-[10px] text-muted-foreground flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-primary/20"></span>
                                                Operator: {log.user.name || 'Staff'}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
