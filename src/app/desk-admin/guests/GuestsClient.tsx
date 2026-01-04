'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Guest {
    id: string;
    name: string;
    age: number;
    gender: string;
    contact: string | null;
    tent: string;
    sector: string;
    bookingId: string;
    status: string;
    checkInDate: Date | null;
    checkOutDate: Date | null;
}

export default function GuestsClient({ initialGuests }: { initialGuests: Guest[] }) {
    const router = useRouter();
    const [guests, setGuests] = useState(initialGuests);
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGuests = guests.filter(guest =>
        guest.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.tent.toLowerCase().includes(searchTerm.toLowerCase()) ||
        guest.contact?.includes(searchTerm)
    );

    const handleCheckIn = async (bookingId: string) => {
        const res = await fetch('/api/bookings/checkin', {
            method: 'POST',
            body: JSON.stringify({ bookingId })
        });
        if (res.ok) {
            setGuests(prev => prev.map(g => g.bookingId === bookingId ? { ...g, status: 'CHECKED_IN' } : g));
            router.refresh();
        }
    };

    const handleCheckOut = async (bookingId: string) => {
        if (!confirm('Confirm check-out?')) return;
        const res = await fetch('/api/bookings/checkout', {
            method: 'POST',
            body: JSON.stringify({ bookingId })
        });
        if (res.ok) {
            setGuests(prev => prev.map(g => g.bookingId === bookingId ? { ...g, status: 'CHECKED_OUT' } : g));
            router.refresh();
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        Guest List
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Comprehensive roster of all event participants.</p>
                </div>
                <div className="relative w-full md:w-72">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <input
                        className="w-full pl-10 pr-4 py-2.5 bg-white border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 shadow-sm transition-all"
                        placeholder="Search guest or tent..."
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:hidden">
                {filteredGuests.length === 0 ? (
                    <div className="col-span-full py-20 bg-secondary/30 rounded-3xl border border-dashed border-border text-center text-muted-foreground italic">
                        No guests found.
                    </div>
                ) : (
                    filteredGuests.map((guest) => (
                        <div
                            key={guest.id}
                            className="bg-white p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl">
                                    {guest.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-foreground text-lg truncate">{guest.name}</h3>
                                    <p className="text-xs text-muted-foreground">{guest.contact || 'No contact'}</p>
                                </div>
                                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${guest.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                    guest.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                        'bg-secondary text-muted-foreground border border-border'
                                    }`}>
                                    {guest.status}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 py-4 border-y border-border/50 text-sm">
                                <div>
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-1">Assignment</span>
                                    <p className="font-bold text-primary truncate">{guest.tent}</p>
                                    <p className="text-[10px] text-muted-foreground uppercase">{guest.sector}</p>
                                </div>
                                <div>
                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest block mb-1">Details</span>
                                    <p className="text-foreground font-medium">{guest.age} years</p>
                                    <p className="text-foreground font-medium">{guest.gender}</p>
                                </div>
                            </div>

                            <div className="mt-4 flex justify-end">
                                {guest.status === 'CONFIRMED' && (
                                    <button
                                        onClick={() => handleCheckIn(guest.bookingId)}
                                        className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-emerald-600/20 active:scale-95 transition-all"
                                    >
                                        Check In
                                    </button>
                                )}
                                {guest.status === 'CHECKED_IN' && (
                                    <button
                                        onClick={() => handleCheckOut(guest.bookingId)}
                                        className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-black uppercase tracking-widest shadow-lg shadow-red-600/20 active:scale-95 transition-all"
                                    >
                                        Check Out
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block border border-border rounded-[2rem] overflow-hidden bg-white shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground uppercase text-[10px] font-black tracking-widest">
                        <tr>
                            <th className="p-6">Guest Identity</th>
                            <th className="p-6">Contact Info</th>
                            <th className="p-6">Assignment</th>
                            <th className="p-6">Current Status</th>
                            <th className="p-6 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {filteredGuests.length === 0 ? (
                            <tr><td colSpan={5} className="p-20 text-center text-muted-foreground italic">Awaiting guest registration...</td></tr>
                        ) : (
                            filteredGuests.map((guest) => (
                                <tr key={guest.id} className="hover:bg-secondary/30 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                                {guest.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground group-hover:text-primary transition-colors text-base">{guest.name}</div>
                                                <div className="text-[10px] text-muted-foreground font-mono uppercase">UID: {guest.id.slice(0, 8)} • {guest.age}Y • {guest.gender}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-muted-foreground font-medium">{guest.contact || 'NONE_SPECIFIED'}</td>
                                    <td className="p-6">
                                        <div className="font-black text-primary text-lg tracking-tighter">{guest.tent}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{guest.sector}</div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${guest.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700 border border-blue-200' :
                                            guest.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' :
                                                'bg-secondary text-muted-foreground border border-border'
                                            }`}>
                                            {guest.status}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        {guest.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => handleCheckIn(guest.bookingId)}
                                                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                                            >
                                                Check In
                                            </button>
                                        )}
                                        {guest.status === 'CHECKED_IN' && (
                                            <button
                                                onClick={() => handleCheckOut(guest.bookingId)}
                                                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md active:scale-95 transition-all"
                                            >
                                                Check Out
                                            </button>
                                        )}
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
