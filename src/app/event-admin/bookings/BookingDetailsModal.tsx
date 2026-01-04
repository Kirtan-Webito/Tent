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
    const [loadingNotes, setLoadingNotes] = useState(false);

    useEffect(() => {
        if (booking) {
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

    if (!booking) return null;

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="Booking Details"
            maxWidth="max-w-4xl" // Wider modal for tablets
            actions={
                <button
                    onClick={onClose}
                    className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl transition shadow-sm active:scale-95"
                >
                    Close
                </button>
            }
        >
            <div className="space-y-4 sm:space-y-6">
                {/* Header Status Bar - Shows on all screens */}
                <div className="bg-white border border-border rounded-2xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">Tent</span>
                            <h3 className="text-xl sm:text-2xl font-black text-foreground">{booking.tent.name}</h3>
                        </div>
                        <p className="text-xs text-muted-foreground font-mono mt-1">ID: #{booking.id.slice(0, 8)}</p>
                    </div>
                    <div className="flex items-center gap-3 self-start sm:self-auto">
                        <span className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-sm ${booking.status === 'CONFIRMED' ? 'bg-emerald-500 text-white' :
                            booking.status === 'PENDING' ? 'bg-orange-500 text-white' :
                                'bg-secondary text-muted-foreground'
                            }`}>
                            {booking.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    {/* Left Column: Key Details & Guests */}
                    <div className="space-y-4 sm:space-y-6">
                        {/* Dates & Contact */}
                        <div className="bg-secondary/30 rounded-2xl p-4 md:p-5 border border-border">
                            <div className="grid grid-cols-2 gap-3 md:gap-4 mb-4">
                                <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-border/50">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Check-in</span>
                                    </div>
                                    <p className="text-base md:text-lg font-bold text-foreground">
                                        {booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric'
                                        }) : '--'}
                                        <span className="text-xs text-muted-foreground font-normal ml-1 hidden sm:inline">
                                            {booking.checkInDate ? new Date(booking.checkInDate).getFullYear() : ''}
                                        </span>
                                    </p>
                                </div>
                                <div className="bg-white rounded-xl p-3 md:p-4 shadow-sm border border-border/50">
                                    <div className="flex items-center gap-2 text-muted-foreground mb-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" /></svg>
                                        <span className="text-[10px] md:text-xs font-bold uppercase tracking-wider">Check-out</span>
                                    </div>
                                    <p className="text-base md:text-lg font-bold text-foreground">
                                        {booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString('en-US', {
                                            month: 'short', day: 'numeric'
                                        }) : '--'}
                                        <span className="text-xs text-muted-foreground font-normal ml-1 hidden sm:inline">
                                            {booking.checkOutDate ? new Date(booking.checkOutDate).getFullYear() : ''}
                                        </span>
                                    </p>
                                </div>
                            </div>

                            {booking.mobile ? (
                                <div className="bg-white rounded-xl p-3 flex items-center justify-between shadow-sm border border-border/50">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                            <svg className="w-4 h-4 md:w-5 md:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                                        </div>
                                        <div>
                                            <p className="text-[10px] md:text-xs text-muted-foreground font-bold uppercase">Contact</p>
                                            <p className="font-bold text-sm md:text-base text-foreground">{booking.mobile}</p>
                                        </div>
                                    </div>
                                    <a href={`tel:${booking.mobile}`} className="px-3 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition active:scale-95">
                                        <span className="text-xs font-bold text-primary">Call</span>
                                    </a>
                                </div>
                            ) : (
                                <div className="text-center p-3 text-muted-foreground text-sm italic">No contact number provided</div>
                            )}
                        </div>

                        {/* Guests List */}
                        <div className="bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm max-h-[300px] md:max-h-[400px] overflow-y-auto custom-scrollbar">
                            <div className="flex items-center justify-between mb-4 sticky top-0 bg-white py-2 z-10 border-b border-border/50">
                                <h3 className="font-black text-foreground uppercase tracking-wide flex items-center gap-2">
                                    <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    Guests
                                </h3>
                                <span className="px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-black shadow-sm">
                                    {booking.members.length}
                                </span>
                            </div>
                            <div className="space-y-3">
                                {booking.members.map((member, idx) => (
                                    <div
                                        key={member.id}
                                        className="flex items-center gap-3 p-3 bg-secondary/30 hover:bg-secondary/60 rounded-xl border border-transparent hover:border-border transition-all"
                                    >
                                        <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-white font-black text-lg md:text-xl shadow-sm shrink-0 ${idx === 0 ? 'bg-gradient-to-br from-primary to-orange-400' : 'bg-slate-300'
                                            }`}>
                                            {member.name.charAt(0).toUpperCase()}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <p className="font-bold text-foreground text-base md:text-lg truncate">{member.name}</p>
                                                {idx === 0 && (
                                                    <span className="px-2 py-0.5 bg-orange-100 text-orange-700 rounded-md text-[10px] font-black uppercase tracking-wider shrink-0">
                                                        Primary
                                                    </span>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs md:text-sm text-muted-foreground">
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                    {member.age} yrs
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300"></span>
                                                    {member.gender}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Notes & History */}
                    <div className="flex flex-col h-full bg-white border border-border rounded-2xl p-4 md:p-5 shadow-sm min-h-[350px] md:min-h-[500px]">
                        <h3 className="font-black text-foreground uppercase tracking-wide mb-4 flex items-center gap-2">
                            <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                            Notes & History
                        </h3>

                        {/* Notes List - Flex grow to fill space */}
                        <div className="flex-1 mb-4 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-border scrollbar-track-secondary/50 space-y-3">
                            {loadingNotes ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground gap-3">
                                    <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                    <p className="text-sm font-medium">Loading history...</p>
                                </div>
                            ) : notes.length > 0 ? (
                                notes.map((note) => (
                                    <div key={note.id} className="p-3 md:p-4 bg-secondary/30 rounded-2xl border border-border/50 hover:border-border transition-colors group">
                                        <p className="text-foreground text-sm leading-relaxed whitespace-pre-wrap">{note.content}</p>
                                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-border/10 text-[10px] md:text-xs text-muted-foreground">
                                            <span className="font-bold bg-white px-2 py-1 rounded-md shadow-sm border border-border/20 text-primary">
                                                {note.author}
                                            </span>
                                            <span>
                                                {new Date(note.createdAt).toLocaleString('en-US', {
                                                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-8 bg-secondary/10 rounded-2xl border-2 border-dashed border-border/50">
                                    <span className="text-4xl mb-3 opacity-20">📝</span>
                                    <p className="font-bold">No notes yet</p>
                                    <p className="text-xs mt-1 text-center max-w-[200px]">Add a note below to track history or special requests.</p>
                                </div>
                            )}
                        </div>

                        {/* Add Note Input - Fixed at bottom */}
                        <div className="pt-4 border-t border-border mt-auto">
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    placeholder="Type a note..."
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleAddNote()}
                                    className="flex-1 px-4 py-3 bg-secondary border border-border rounded-xl text-sm md:text-base text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition"
                                />
                                <button
                                    onClick={handleAddNote}
                                    disabled={!newNote.trim()}
                                    className="px-4 md:px-6 py-3 bg-primary text-white hover:bg-primary/90 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl text-xs md:text-sm font-black uppercase tracking-wide transition shadow-lg shadow-primary/20 active:translate-y-0.5"
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Metadata */}
                <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground font-medium py-2">
                    <span>Created {new Date(booking.createdAt).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                    <span className="w-1 h-1 rounded-full bg-border" />
                    <span>{new Date(booking.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
            </div>
        </Modal>
    );
}
