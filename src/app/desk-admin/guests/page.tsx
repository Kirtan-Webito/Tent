export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function getGuests(eventId: string) {
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

    const guests = sectors.flatMap((s: any) =>
        s.tents.flatMap((t: any) =>
            t.bookings?.flatMap((b: any) =>
                b.members.map((m: any) => ({
                    ...m,
                    bookingStatus: b.status,
                    tentName: t.name,
                    sectorName: s.name,
                    checkIn: b.checkInDate,
                    checkOut: b.checkOutDate
                }))
            ) || []
        )
    );

    return guests;
}

export default async function GuestsPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;

    if (!eventId) return <div className="p-8 text-gray-500">No event assigned.</div>;

    const guests = await getGuests(eventId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent tracking-tight">
                        Guest Directory
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Synchronized registry of all active event participants.</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-xs font-bold text-gray-500 uppercase tracking-widest">
                    {guests.length} Registered Guests
                </div>
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {guests.length === 0 ? (
                    <div className="col-span-full p-12 glass rounded-3xl border-dashed border-white/10 text-center text-gray-500">
                        No guests currently registered.
                    </div>
                ) : (
                    guests.map((guest: any, idx: number) => (
                        <div
                            key={guest.id || idx}
                            className="glass p-5 rounded-2xl border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-2xl">
                                    👤
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-white text-lg">{guest.name}</div>
                                    <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">{guest.age}Y • {guest.gender}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${guest.bookingStatus === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                                    guest.bookingStatus === 'CHECKED_IN' ? 'bg-blue-500/20 text-blue-400' :
                                        'bg-white/5 text-gray-400'
                                    }`}>
                                    {guest.bookingStatus}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-black/20 rounded-xl border border-white/5 mb-4">
                                <div>
                                    <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">LOCATION</div>
                                    <div className="text-xs font-bold text-orange-400 tracking-tight">{guest.tentName}</div>
                                    <div className="text-[10px] text-gray-600 font-medium">{guest.sectorName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[8px] font-black text-gray-500 uppercase tracking-[0.2em] mb-1">STAY_PERIOD</div>
                                    <div className="text-[10px] font-medium text-white">
                                        {guest.checkIn ? new Date(guest.checkIn).toLocaleDateString('en-GB') : 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-gray-600">to {guest.checkOut ? new Date(guest.checkOut).toLocaleDateString('en-GB') : 'End'}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em] border-b border-white/10">
                            <tr>
                                <th className="p-6">Entity</th>
                                <th className="p-6">Demographics</th>
                                <th className="p-6">Assignment</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Timeline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {guests.map((guest: any, idx: number) => (
                                <tr key={guest.id || idx} className="hover:bg-white/[0.03] transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-orange-500/20 group-hover:border-orange-500/30 transition-all font-bold">
                                                {guest.name.charAt(0)}
                                            </div>
                                            <div className="font-bold text-white group-hover:text-orange-400 transition-colors uppercase tracking-tight">{guest.name}</div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-gray-400 text-sm font-medium">
                                        {guest.age} years / {guest.gender}
                                    </td>
                                    <td className="p-6">
                                        <div className="text-orange-400 text-base font-black tracking-tighter">{guest.tentName}</div>
                                        <div className="text-[10px] text-gray-600 font-bold uppercase tracking-widest">{guest.sectorName}</div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${guest.bookingStatus === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                                            guest.bookingStatus === 'CHECKED_IN' ? 'bg-blue-500/20 text-blue-400' :
                                                'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {guest.bookingStatus}
                                        </span>
                                    </td>
                                    <td className="p-6 text-xs text-gray-500 font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>{guest.checkIn ? new Date(guest.checkIn).toLocaleDateString('en-GB') : 'N/A'}</span>
                                            <span className="opacity-30">→</span>
                                            <span className={guest.checkOut ? "" : "text-emerald-500/60"}>
                                                {guest.checkOut ? new Date(guest.checkOut).toLocaleDateString('en-GB') : 'STAY_ACTIVE'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {guests.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="p-20 text-center text-gray-600 italic">
                                        <div className="text-4xl mb-4 opacity-20">👥</div>
                                        Awaiting guest synchronization...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
