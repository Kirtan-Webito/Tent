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
    MoonIcon,
    BellIcon
} from '@radix-ui/react-icons';

export const dynamic = 'force-dynamic';

async function getDashboardData(eventId: string, sectorId?: string) {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);

    const sectors = await prisma.sector.findMany({
        where: {
            eventId,
            ...(sectorId ? { id: sectorId } : {})
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
        color: '#10B981'
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
    const sectorId = (session as any)?.assignedSectorId;

    if (!eventId) return <div className="p-8 text-gray-500 font-medium glass rounded-2xl">Access Denied: No event assigned to your session.</div>;

    const stats = await getDashboardData(eventId, sectorId);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Hero Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 md:gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Operations Hub</h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Seamless guest management at your fingertips.</p>
                </div>
                <div className="flex gap-2">
                    <div className="px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[10px] md:text-xs font-bold leading-none flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
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
                    icon={<PersonIcon className="w-6 h-6 text-emerald-400" />}
                    className="hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all"
                />
                <StatsCard
                    label="Today Check-ins"
                    value={stats.todayCheckins}
                    subtext="Scheduled for today"
                    icon={<EnterIcon className="w-6 h-6 text-blue-400" />}
                    className="hover:shadow-[0_0_20px_rgba(59,130,246,0.1)] transition-all"
                />
                <StatsCard
                    label="Today Check-outs"
                    value={stats.todayCheckouts}
                    subtext="Expiring stays"
                    icon={<ExitIcon className="w-6 h-6 text-amber-400" />}
                    className="hover:shadow-[0_0_20px_rgba(245,158,11,0.1)] transition-all"
                />
                <StatsCard
                    label="Overdue Stays"
                    value={stats.overdueCheckouts}
                    subtext="Action required"
                    icon={<ExclamationTriangleIcon className="w-6 h-6 text-red-400" />}
                    className={`transition-all ${stats.overdueCheckouts > 0 ? 'bg-red-500/5 border-red-500/20 hover:shadow-[0_0_20px_rgba(239,68,68,0.2)]' : 'opacity-80'}`}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                {/* Visual Analytics */}
                <div className="lg:col-span-4 flex flex-col gap-4 md:gap-6">
                    <div className="glass p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-2xl flex flex-col items-center justify-center text-center">
                        <h3 className="text-lg md:text-xl font-bold text-white mb-6">Operations Mix</h3>
                        <div className="flex flex-col gap-8 w-full">
                            <div className="flex flex-col items-center">
                                <DonutChart
                                    data={stats.stayBreakdown}
                                    size={140}
                                />
                                <div className="mt-4 flex gap-4 text-[9px] font-bold text-gray-500 uppercase">
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-blue-400"></div> Arrivals</div>
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div> Departures</div>
                                    <div className="flex items-center gap-1"><div className="w-1.5 h-1.5 rounded-full bg-red-400"></div> Overdue</div>
                                </div>
                            </div>

                            <div className="w-full border-t border-white/5 pt-6 grid grid-cols-2 gap-4">
                                <div className="text-left">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">UTILIZATION</div>
                                    <div className="text-2xl font-black text-white">{stats.occupancyRate}%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mb-1">UNITS</div>
                                    <div className="text-2xl font-black text-white">{stats.totalTents}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="glass p-5 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border-white/5 space-y-4">
                        <h4 className="text-[10px] md:text-sm font-bold text-gray-500 uppercase tracking-widest pl-2">Quick Actions</h4>
                        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                            <a href="/desk-admin/booking" className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 p-4 rounded-2xl bg-white/5 hover:bg-primary/20 hover:text-white border border-white/5 transition-all group">
                                <Pencil2Icon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-xs md:text-sm text-center lg:text-left">New Booking</span>
                            </a>
                            <a href="/desk-admin/history" className="flex flex-col lg:flex-row items-center lg:items-center gap-2 lg:gap-4 p-4 rounded-2xl bg-white/5 hover:bg-primary/20 hover:text-white border border-white/5 transition-all group">
                                <BarChartIcon className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                <span className="font-bold text-xs md:text-sm text-center lg:text-left">View History</span>
                            </a>
                        </div>
                    </div>
                </div>

                {/* Desk Activity Feed */}
                <div className="lg:col-span-8">
                    <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-b from-white/[0.05] to-transparent shadow-2xl h-full min-h-[500px]">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-2xl font-bold text-white">Live Activity</h3>
                                <p className="text-sm text-gray-500">Real-time updates from the field</p>
                            </div>
                            <RadiobuttonIcon className="w-8 h-8 opacity-20 text-emerald-500" />
                        </div>

                        <div className="space-y-6">
                            {stats.recentLogs.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-gray-600 italic">
                                    <MoonIcon className="w-12 h-12 mb-4 opacity-50" />
                                    <p>Silence on the desk... all quiet for now.</p>
                                </div>
                            ) : (
                                stats.recentLogs.map((log: any) => (
                                    <div key={log.id} className="flex gap-4 items-start p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-all group">
                                        <div className="mt-1 w-2 h-2 rounded-full bg-emerald-500 group-hover:shadow-[0_0_8px_rgba(16,185,129,0.5)] transition-all"></div>
                                        <div className="flex-1">
                                            <div className="flex justify-between items-start mb-1">
                                                <p className="font-bold text-gray-200 group-hover:text-emerald-400 transition-colors uppercase text-xs tracking-wider">
                                                    {log.action}
                                                </p>
                                                <span className="text-[10px] text-gray-500 font-mono">
                                                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 group-hover:text-gray-300 transition-colors">
                                                {log.details}
                                            </p>
                                            <div className="mt-2 text-[10px] text-gray-600 flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 rounded-full bg-white/10"></span>
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
