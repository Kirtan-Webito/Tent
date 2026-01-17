'use client';

import { PersonIcon, CalendarIcon, CubeIcon, ArchiveIcon } from '@radix-ui/react-icons';

interface Member {
    id: string;
    name: string;
}

interface Tent {
    id: string;
    name: string;
    sector: {
        name: string;
    };
}

interface Booking {
    id: string;
    members: Member[];
    tent: Tent;
    checkInDate: string | null;
    checkOutDate: string | null;
    mobile: string | null;
    status: string;
}

export default function HistoryClient({ bookings }: { bookings: Booking[] }) {
    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        Booking Archive
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">A comprehensive history of your desk registrations.</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white border border-border text-xs font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
                    {bookings.length} Total Sessions
                </div>
            </div>

            {/* Mobile View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {bookings.length === 0 ? (
                    <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed border-border text-center text-muted-foreground">
                        No history logs found.
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.id} className="bg-white p-5 rounded-2xl border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div className="font-mono text-[10px] text-muted-foreground">#{booking.id.slice(0, 8)}</div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'CHECKED_OUT' ? 'bg-secondary text-muted-foreground' : 'bg-emerald-100 text-emerald-700'
                                    }`}>
                                    {booking.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary font-bold">
                                    {booking.members[0]?.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-foreground">{booking.members[0]?.name}</div>
                                    <div className="text-xs text-muted-foreground">{booking.mobile || 'No contact'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-black text-primary uppercase">{booking.tent.name}</div>
                                    <div className="text-[10px] text-muted-foreground font-bold">{booking.members.length} GUEST(S)</div>
                                </div>
                            </div>
                            <div className="pt-4 border-t border-border grid grid-cols-2 gap-2 text-[10px]">
                                <div>
                                    <div className="text-muted-foreground uppercase font-black tracking-tighter">In</div>
                                    <div className="font-medium">{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-GB') : '-'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-muted-foreground uppercase font-black tracking-tighter">Out</div>
                                    <div className="font-medium">{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-GB') : '-'}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop View */}
            <div className="hidden lg:block bg-white rounded-[2rem] overflow-hidden border border-border shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Resident Identity</th>
                            <th className="p-6">Assignment</th>
                            <th className="p-6">Timeline</th>
                            <th className="p-6">Occupancy</th>
                            <th className="p-6">Status</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {bookings.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-muted-foreground italic font-medium">
                                    <ArchiveIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    The archives are currently empty...
                                </td>
                            </tr>
                        ) : (
                            bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-secondary/30 transition-all group">
                                    <td className="p-6 text-foreground font-bold">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-all">
                                                <PersonIcon className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-black text-foreground group-hover:text-primary transition-colors">{booking.members[0]?.name}</div>
                                                <div className="text-[10px] font-mono text-muted-foreground uppercase">#{booking.id.slice(0, 8)} • {booking.mobile || 'NO_MOB'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <div className="font-bold text-primary tracking-tight">{booking.tent.name}</div>
                                        <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{booking.tent.sector.name}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                            <span className="text-foreground">{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-GB') : '-'}</span>
                                            <span className="opacity-30">→</span>
                                            <span className="text-foreground">{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-GB') : '-'}</span>
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest shadow-sm">
                                            {booking.members.length} GUEST{booking.members.length !== 1 ? 'S' : ''}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border shadow-sm ${booking.status === 'CHECKED_OUT'
                                            ? 'bg-secondary text-muted-foreground border-border'
                                            : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                            }`}>
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
