'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import BookingDetailsModal from './BookingDetailsModal';
import { MagnifyingGlassIcon, PersonIcon, MobileIcon, ArchiveIcon, HomeIcon } from '@radix-ui/react-icons';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

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
    const [isCheckOutOpen, setIsCheckOutOpen] = useState(false);
    const [checkOutBookingId, setCheckOutBookingId] = useState<string | null>(null);
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
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary via-orange-500 to-red-500 bg-clip-text text-transparent tracking-tight">
                        Bookings & Guests
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Comprehensive oversight of all event reservations.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    <div className="flex-1 flex items-center gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="flex-1 sm:w-40 px-4 py-2.5 bg-white border border-border rounded-xl text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-secondary"
                        >
                            <option value="ALL">All Status</option>
                            <option value="CONFIRMED">Confirmed</option>
                            <option value="CHECKED_IN">Checked In</option>
                            <option value="CHECKED_OUT">Checked Out</option>
                            <option value="CANCELLED">Cancelled</option>
                        </select>
                        <div className="hidden lg:block h-8 w-px bg-border mx-1" />
                        <div className="lg:hidden text-[10px] font-black text-muted-foreground uppercase flex flex-col justify-center">
                            <span>{filteredBookings.length}</span>
                            <span>RES</span>
                        </div>
                    </div>

                    <div className="relative flex-1 sm:w-64">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Guest, tent, or ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2.5 bg-white border border-border rounded-xl text-foreground placeholder-muted-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all hover:bg-secondary"
                        />
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Card View (Hidden on Desktop) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {filteredBookings.length === 0 ? (
                    <div className="col-span-full p-12 bg-white rounded-3xl border border-dashed border-border text-center text-muted-foreground">
                        No bookings found.
                    </div>
                ) : (
                    filteredBookings.map((booking) => {
                        const primaryGuest = booking.members[0];
                        return (
                            <div
                                key={booking.id}
                                onClick={() => handleBookingClick(booking)}
                                className="bg-white p-5 rounded-2xl border border-border shadow-sm active:scale-95 transition-all"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="font-mono text-[10px] text-muted-foreground">#{booking.id.slice(0, 8)}</div>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                        booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                            booking.status === 'CHECKED_OUT' ? 'bg-secondary text-muted-foreground border border-border' :
                                                'bg-red-100 text-red-700 border border-red-200'
                                        }`}>
                                        {booking.status}
                                    </span>
                                </div>
                                <div className="flex items-center gap-4 mb-4">
                                    <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-600">
                                        <PersonIcon className="w-5 h-5" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-bold text-foreground text-lg">{primaryGuest?.name || 'Unknown'}</div>
                                        <div className="text-xs text-muted-foreground">{booking.mobile || 'No contact'}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-xs font-black text-emerald-600 uppercase tracking-tighter">{booking.tent.name}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold">{booking.members.length} GUEST(S)</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-border">
                                    <div className="text-[10px]">
                                        <div className="font-black uppercase tracking-widest text-[8px] text-muted-foreground mb-1">Check In</div>
                                        <div className="text-foreground font-medium">{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-GB') : 'TBD'}</div>
                                    </div>
                                    <div className="text-[10px] text-right">
                                        <div className="font-black uppercase tracking-widest text-[8px] text-muted-foreground mb-1">Check Out</div>
                                        <div className="text-foreground font-medium">{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-GB') : 'TBD'}</div>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table View (Hidden on Mobile) */}
            <div className="hidden lg:block border border-border rounded-[2rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                        <tr>
                            <th className="p-6">Resident Hub</th>
                            <th className="p-6">Assignment</th>
                            <th className="p-6">Occupancy</th>
                            <th className="p-6">Timeline</th>
                            <th className="p-6">Status</th>
                            <th className="p-6 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredBookings.length === 0 ? (
                            <tr>
                                <td colSpan={6} className="p-20 text-center text-muted-foreground italic">
                                    <ArchiveIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    {searchTerm || statusFilter !== 'ALL' ? 'No matches found in current node.' : 'Awaiting guest synchronization...'}
                                </td>
                            </tr>
                        ) : (
                            filteredBookings.map((booking) => {
                                const primaryGuest = booking.members[0];
                                return (
                                    <tr
                                        key={booking.id}
                                        className="hover:bg-secondary/50 transition-all cursor-pointer group"
                                        onClick={() => handleBookingClick(booking)}
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-all">
                                                    <PersonIcon className="w-5 h-5 text-muted-foreground group-hover:text-primary" />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">
                                                        {primaryGuest ? primaryGuest.name : 'Unknown Guest'}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-muted-foreground uppercase tracking-tighter">
                                                        #{booking.id.slice(0, 8)} • {booking.mobile || 'NO_MOB'}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="font-black text-emerald-600 tracking-tighter text-lg">{booking.tent.name}</div>
                                            <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">SEC: 01_GLOBAL</div>
                                        </td>
                                        <td className="p-6">
                                            <span className="px-3 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-700 text-[10px] font-black uppercase tracking-widest">
                                                {booking.members.length} GUEST{booking.members.length !== 1 ? 'S' : ''}
                                            </span>
                                        </td>
                                        <td className="p-6">
                                            <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
                                                <span className="text-foreground">{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-GB') : 'TBD'}</span>
                                                <span className="opacity-30">→</span>
                                                <span className="text-foreground">{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-GB') : 'TBD'}</span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                                    booking.status === 'CHECKED_OUT' ? 'bg-secondary text-muted-foreground border border-border' :
                                                        'bg-red-100 text-red-700 border border-red-200'
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
                                                        className="px-4 py-2 bg-emerald-100 border border-emerald-200 hover:bg-emerald-600 text-emerald-700 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
                                                    >
                                                        Check In
                                                    </button>
                                                )}
                                                {booking.status === 'CHECKED_IN' && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setCheckOutBookingId(booking.id);
                                                            setIsCheckOutOpen(true);
                                                        }}
                                                        className="px-4 py-2 bg-red-100 border border-red-200 hover:bg-red-600 text-red-700 hover:text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all active:scale-95"
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

            <ConfirmDialog
                isOpen={isCheckOutOpen}
                onClose={() => {
                    setIsCheckOutOpen(false);
                    setCheckOutBookingId(null);
                }}
                onConfirm={() => {
                    if (checkOutBookingId) {
                        handleCheckOut(checkOutBookingId);
                    }
                }}
                title="Check Out Guest"
                message="Are you sure you want to check out this guest?"
                confirmText="Check Out"
                variant="danger"
            />
        </div>
    );
}
