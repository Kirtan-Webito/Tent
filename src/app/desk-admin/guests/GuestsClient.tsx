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
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                        Guest List
                    </h1>
                    <p className="text-gray-400">All guests currently registered</p>
                </div>
                <input
                    className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white"
                    placeholder="Search guest or tent..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            <div className="border border-white/10 rounded-xl overflow-hidden bg-white/5">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-400 uppercase text-xs">
                        <tr>
                            <th className="p-4">Guest Name</th>
                            <th className="p-4">Contact</th>
                            <th className="p-4">Tent</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {filteredGuests.length === 0 ? (
                            <tr><td colSpan={5} className="p-8 text-center text-gray-500">No guests found.</td></tr>
                        ) : (
                            filteredGuests.map((guest) => (
                                <tr key={guest.id} className="hover:bg-white/5 transition">
                                    <td className="p-4 font-bold text-white">
                                        {guest.name}
                                        <div className="text-xs text-gray-500 font-normal">{guest.age} • {guest.gender}</div>
                                    </td>
                                    <td className="p-4 text-gray-400">{guest.contact || '-'}</td>
                                    <td className="p-4">
                                        <div className="font-medium text-orange-400">{guest.tent}</div>
                                        <div className="text-xs text-gray-500">{guest.sector}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-2 py-1 rounded text-xs font-bold ${guest.status === 'CHECKED_IN' ? 'bg-blue-500/20 text-blue-400' :
                                                guest.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                                                    'bg-gray-500/20 text-gray-400'
                                            }`}>
                                            {guest.status}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        {guest.status === 'CONFIRMED' && (
                                            <button
                                                onClick={() => handleCheckIn(guest.bookingId)}
                                                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-600 text-white rounded text-xs font-bold"
                                            >
                                                Check In
                                            </button>
                                        )}
                                        {guest.status === 'CHECKED_IN' && (
                                            <button
                                                onClick={() => handleCheckOut(guest.bookingId)}
                                                className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded text-xs font-bold"
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
