'use client';

import { useState, useEffect } from 'react';
import Modal from '@/components/ui/Modal';

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

interface Note {
    id: string;
    content: string;
    author: string;
    createdAt: string;
}

export default function BookingDetailsModal({
    booking,
    isOpen,
    onClose
}: {
    booking: Booking | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [notes, setNotes] = useState<Note[]>([]);
    const [newNote, setNewNote] = useState('');
    const [isVIP, setIsVIP] = useState(false);
    const [loadingNotes, setLoadingNotes] = useState(false);

    useEffect(() => {
        if (booking) {
            setIsVIP(booking.isVIP);
            fetchNotes(booking.id);
        }
    }, [booking]);

    const fetchNotes = async (bookingId: string) => {
        setLoadingNotes(true);
        try {
            const res = await fetch(`/api/bookings/notes?bookingId=${bookingId}`);
            if (!res.ok) {
                const text = await res.text();
                console.error('Fetch notes error:', res.status, text);
                return;
            }
            const data = await res.json();
            setNotes(data.notes || []);
        } catch (error) {
            console.error('Failed to fetch notes:', error);
        } finally {
            setLoadingNotes(false);
        }
    };

    const handleAddNote = async () => {
        if (!booking || !newNote.trim()) return;

        try {
            const res = await fetch('/api/bookings/notes', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, content: newNote })
            });
            if (res.ok) {
                const data = await res.json();
                setNotes([data.note, ...notes]);
                setNewNote('');
            }
        } catch (error) {
            console.error('Failed to add note:', error);
        }
    };

    const toggleVIP = async () => {
        if (!booking) return;
        const newStatus = !isVIP;
        setIsVIP(newStatus); // Optimistic update

        try {
            await fetch('/api/bookings/vip', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bookingId: booking.id, isVIP: newStatus })
            });
        } catch (error) {
            setIsVIP(!newStatus); // Revert on error
            console.error('Failed to toggle VIP:', error);
        }
    };

    if (!booking) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Booking Details"
            actions={
                <button
                    onClick={onClose}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                >
                    Close
                </button>
            }
        >
            <div className="space-y-6">
                {/* VIP Banner */}
                <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${isVIP ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/20 text-gray-400'}`}>
                            👑
                        </div>
                        <div>
                            <h3 className="font-bold text-white">VIP Status</h3>
                            <p className="text-xs text-gray-500">Mark this booking as high priority</p>
                        </div>
                    </div>
                    <button
                        onClick={toggleVIP}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isVIP ? 'bg-yellow-500' : 'bg-gray-700'}`}
                    >
                        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isVIP ? 'translate-x-6' : 'translate-x-1'}`} />
                    </button>
                </div>

                {/* Booking Info */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-bold text-emerald-400 mb-3">Booking Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500">Booking ID:</span>
                            <p className="font-mono text-xs mt-1">#{booking.id.slice(0, 12)}...</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Tent:</span>
                            <p className="font-bold mt-1">{booking.tent.name}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Check-in:</span>
                            <p className="mt-1">
                                {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">Check-out:</span>
                            <p className="mt-1">
                                {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : 'Not set'}
                            </p>
                        </div>
                        <div>
                            <span className="text-gray-500">Status:</span>
                            <p className="mt-1">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${booking.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                                    'bg-gray-500/20 text-gray-400'
                                    }`}>
                                    {booking.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Guests List */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-bold text-blue-400 mb-3">
                        Guests ({booking.members.length})
                    </h3>
                    <div className="space-y-2">
                        {booking.members.map((member, idx) => (
                            <div
                                key={member.id}
                                className="flex items-center justify-between p-3 bg-black/20 rounded-lg"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold text-sm">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="font-bold text-white">
                                            {member.name}
                                            {idx === 0 && (
                                                <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                                    Primary
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {member.age} yrs • {member.gender}
                                            {member.contact && ` • ${member.contact}`}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Notes & History */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-bold text-purple-400 mb-3">Notes & History</h3>

                    {/* Add Note */}
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            placeholder="Add a note..."
                            value={newNote}
                            onChange={(e) => setNewNote(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                            className="flex-1 px-3 py-2 bg-black/20 border border-white/10 rounded-lg text-sm text-white focus:outline-none focus:border-purple-500/50"
                        />
                        <button
                            onClick={handleAddNote}
                            className="px-3 py-2 bg-purple-500/20 text-purple-400 hover:bg-purple-500/30 rounded-lg text-sm font-bold transition"
                        >
                            Add
                        </button>
                    </div>

                    {/* Notes List */}
                    <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                        {loadingNotes ? (
                            <div className="text-center text-gray-500 text-xs py-2">Loading notes...</div>
                        ) : notes.length > 0 ? (
                            notes.map((note) => (
                                <div key={note.id} className="p-3 bg-black/20 rounded-lg text-sm">
                                    <p className="text-gray-300">{note.content}</p>
                                    <div className="flex justify-between items-center mt-2 text-xs text-gray-500">
                                        <span>{note.author}</span>
                                        <span>{new Date(note.createdAt).toLocaleString()}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-gray-500 text-xs py-4">No notes yet</div>
                        )}
                    </div>
                </div>

                {/* Metadata */}
                <div className="text-xs text-gray-500 text-center">
                    Created on {new Date(booking.createdAt).toLocaleString()}
                </div>
            </div>
        </Modal>
    );
}
