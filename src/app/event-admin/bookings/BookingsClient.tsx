'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingDetailsModal from './BookingDetailsModal';

interface Member {
    id: string;
    name: string;
    age: number;
    gender: string;
    contact: string | null;
}

interface Tent {
    id: string;
    name: string;
}

interface Booking {
    id: string;
    tent: Tent;
    members: Member[];
    checkInDate: Date | null;
    checkOutDate: Date | null;
    status: string;
    mobile: string | null;
    notes: string | null;
    isVIP: boolean;
    createdAt: Date;
}

export default function BookingsClient({ initialBookings }: { initialBookings: Booking[] }) {
    const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [bookings, setBookings] = useState<Booking[]>(initialBookings);

    const [statusFilter, setStatusFilter] = useState('ALL');
    const searchParams = useSearchParams();

    useEffect(() => {
        const highlightId = searchParams.get('highlight');
        if (highlightId) {
            const booking = bookings.find(b => b.id === highlightId);
            if (booking) {
                setSelectedBooking(booking);
                setIsModalOpen(true);
            }
        }
    }, [searchParams, bookings]);

    const filteredBookings = bookings.filter(booking => {
        const primaryGuest = booking.members[0];
        const searchLower = searchTerm.toLowerCase();

        const matchesSearch =
            booking.tent.name.toLowerCase().includes(searchLower) ||
            primaryGuest?.name.toLowerCase().includes(searchLower) ||
            booking.id.toLowerCase().includes(searchLower) ||
            booking.mobile?.toLowerCase().includes(searchLower);

        const matchesStatus = statusFilter === 'ALL' || booking.status === statusFilter;

        return matchesSearch && matchesStatus;
    });

    const handleBookingClick = (booking: Booking) => {
        setSelectedBooking(booking);
        setIsModalOpen(true);
    };

    const handleCheckIn = async (bookingId: string) => {
        const res = await fetch('/api/bookings/checkin', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId })
        });
        if (res.ok) {
            setBookings(bookings.map(b =>
                b.id === bookingId ? { ...b, status: 'CHECKED_IN', checkInDate: new Date() } : b
            ));
        }
    };

    const handleCheckOut = async (bookingId: string) => {
        if (!confirm('Are you sure you want to check out this guest?')) return;

        const res = await fetch('/api/bookings/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bookingId })
        });
        if (res.ok) {
            setBookings(bookings.map(b =>
                b.id === bookingId ? { ...b, status: 'CHECKED_OUT', checkOutDate: new Date() } : b
            ));
        }
    };

    return (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 via-teal-300 to-emerald-500 bg-clip-text text-transparent tracking-tight">
                        Bookings & Guests
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Comprehensive oversight of all event reservations.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 sm:w-40 px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:border-emerald-500/50 transition-all hover:bg-white/10"
                        >
                            <option value="ALL" className="bg-gray-900">All Status</option>
                            <option value="CONFIRMED" className="bg-gray-900">Confirmed</option>
                            <option value="CHECKED_IN" className="bg-gray-900">Checked In</option>
                            <option value="CHECKED_OUT" className="bg-gray-900">Checked Out</option>
                            <option value="CANCELLED" className="bg-gray-900">Cancelled</option>
                        </select>
                        <div className="hidden lg:block h-8 w-px bg-white/10 mx-1" />
                        <div className="lg:hidden text-[10px] font-black text-gray-500 uppercase flex flex-col justify-center">
                            <span>{filteredBookings.length}</span>
                            <span>RES</span>
                        </div>
                    </div>

                    <div className="relative flex-1 sm:w-64">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">🔍</span>
                        <input
                            type="text"
                            placeholder="Guest, tent, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-500 text-sm focus:outline-none focus:border-emerald-500/50 transition-all hover:bg-white/10"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Card View (Hidden on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {filteredBookings.length === 0 ? (
                    <div className="col-span-full p-12 glass rounded-3xl border-dashed border-white/10 text-center text-gray-500">
                        No bookings found.
                    </div>
                ) : (
                    filteredBookings.map((booking) => {
                        const primaryGuest = booking.members[0];
                        return (
                            <div
                                key={booking.id}
                                onClick={() => handleBookingClick(booking)}
                                className="glass p-5 rounded-2xl border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-xl active:scale-95 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="font-mono text-[10px] text-gray-500">#{booking.id.slice(0, 8)}</div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                                            booking.status === 'CHECKED_IN' ? 'bg-blue-500/20 text-blue-400' :
                                                booking.status === 'CHECKED_OUT' ? 'bg-gray-500/20 text-gray-400' :
                                                    'bg-red-500/20 text-red-400'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xl">
                                        👤
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-white text-lg">{primaryGuest?.name || 'Unknown'}</div>
                                        <div className="text-xs text-gray-500">{booking.mobile || 'No contact'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-emerald-400 uppercase tracking-tighter">{booking.tent.name}</div>
                                        <div className="text-[10px] text-gray-600 font-bold">{booking.members.length} GUEST(S)</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-white/5">
                                    <div className="text-[10px] text-gray-500">
                                        <div className="font-black uppercase tracking-widest text-[8px] mb-1">Check In</div>
                                        <div className="text-white font-medium">{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-GB') : 'TBD'}</div>
                                    </div>
                                    <div className="text-[10px] text-gray-500 text-right">
                                        <div className="font-black uppercase tracking-widest text-[8px] mb-1">Check Out</div>
                                        <div className="text-white font-medium">{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-GB') : 'TBD'}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden lg:block border border-white/10 rounded-[2rem] overflow-hidden bg-white/[0.03] backdrop-blur-md shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/[0.05] border-b border-white/10 text-gray-500 uppercase text-[10px] font-black tracking-widest">
                        <tr>
                            <th className="p-6">Resident Hub</th>
                            <th className="p-6">Assignment</th>
                            <th className="p-6">Occupancy</th>
                            <th className="p-6">Timeline</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-20 text-center text-gray-600 italic">
                                    <div className="text-4xl mb-4 opacity-20">📭</div>
                                    {searchTerm || statusFilter !== 'ALL' ? 'No matches found in current node.' : 'Awaiting guest synchronization...'}
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking) => {
                                const primaryGuest = booking.members[0];
                                return (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-white/[0.04] transition-all cursor-pointer group"
                                        onClick={() => handleBookingClick(booking)}
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-emerald-500/20 group-hover:border-emerald-500/30 transition-all">
                                                    <span className="text-lg">👤</span>
                                                </div>
                                                <div>
                                                    <div className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                                                        {primaryGuest ? primaryGuest.name : 'Unknown Guest'}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-gray-500 uppercase tracking-tighter">
                                                        ID: {booking.id.slice(0, 8)} • {booking.mobile || 'NO_MOB'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-black text-emerald-400 tracking-tighter text-lg">{booking.tent.name}</div>
                                            <div className="text-[10px] text-gray-600 font-bold uppercase">SEC: 01_GLOBAL</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                                {booking.members.length} GUEST{booking.members.length !== 1 ? 'S' : ''}
                                            </span>
                                        </td>
                                        <td className="p-6 text-gray-400">
                                            <div className="flex items-center gap-2 text-xs font-medium">
                                                <span>{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-GB') : 'TBD'}</span>
                                                <span className="opacity-30">→</span>
                                                <span>{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-GB') : 'TBD'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    booking.status === 'CHECKED_IN' ? 'bg-blue-500/20 text-blue-400' :
                                                        booking.status === 'CHECKED_OUT' ? 'bg-gray-500/20 text-gray-400' :
                                                            'bg-red-500/20 text-red-400'
                                                }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex justify-end gap-2">
                                                {booking.status === 'CONFIRMED' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCheckIn(booking.id);
                                                        }}
                                                        className="px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 text-emerald-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                                                    >
                                                        Check In
                                                    </button>
                                                )}
                                                {booking.status === 'CHECKED_IN' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleCheckOut(booking.id);
                                                        }}
                                                        className="px-4 py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 text-red-400 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                                                    >
                                                        Check Out
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>

            <BookingDetailsModal
                booking={selectedBooking}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
