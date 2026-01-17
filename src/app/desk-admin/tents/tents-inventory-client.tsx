'use client';

import { useState } from 'react';
import {
    ChevronDownIcon,
    ChevronUpIcon,
    ChevronRightIcon,
    ClockIcon,
    PersonIcon,
    Cross2Icon
} from '@radix-ui/react-icons';
import Link from 'next/link';

interface Guest {
    id: string;
    name: string;
    age: number;
    gender: string;
    checkIn: string;
    checkOut: string;
    mobile: string;
}

interface TentData {
    id: string;
    name: string;
    capacity: number;
    occupied: number;
    status: 'AVAILABLE' | 'OCCUPIED' | 'FULL';
    guests: Guest[];
    sectorName: string;
    sectorId: string;
}

interface SectorData {
    id: string;
    name: string;
    tents: TentData[];
    total: number;
    available: number;
    occupiedCount: number;
}

export default function TentsInventoryClient({ initialSectors }: { initialSectors: SectorData[] }) {
    const [expandedSectors, setExpandedSectors] = useState<string[]>(initialSectors.map(s => s.id));
    const [selectedTent, setSelectedTent] = useState<TentData | null>(null);

    const toggleSector = (id: string) => {
        setExpandedSectors(prev =>
            prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                    Tents Inventory
                </h1>
                <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Manage and view all tents across sectors</p>
            </div>

            <div className="space-y-6">
                {initialSectors.map(sector => (
                    <div key={sector.id} className="bg-white rounded-3xl border border-border overflow-hidden shadow-sm">
                        {/* Sector Header */}
                        <div
                            onClick={() => toggleSector(sector.id)}
                            className="p-6 bg-white flex items-center justify-between cursor-pointer hover:bg-secondary/30 transition-colors border-b border-border/50"
                        >
                            <div className="flex items-center gap-6">
                                <div className="w-1 h-8 bg-primary rounded-full" />
                                <div>
                                    <h2 className="text-xl font-black text-foreground uppercase tracking-tight">{sector.name}</h2>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">{sector.total} Total</span>
                                        <span className="text-muted-foreground/30">•</span>
                                        <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">{sector.available} Available</span>
                                        <span className="text-muted-foreground/30">•</span>
                                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-widest">{sector.occupiedCount} Occupied</span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-muted-foreground">
                                {expandedSectors.includes(sector.id) ? (
                                    <ChevronUpIcon className="w-6 h-6" />
                                ) : (
                                    <ChevronDownIcon className="w-6 h-6" />
                                )}
                            </div>
                        </div>

                        {/* Tents List */}
                        {expandedSectors.includes(sector.id) && (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead className="bg-secondary/30 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] border-b border-border">
                                        <tr>
                                            <th className="px-6 py-4">Tent</th>
                                            <th className="px-6 py-4">Occupancy</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4">All Guests</th>
                                            <th className="px-6 py-4">Timeline</th>
                                            <th className="px-6 py-4 text-right">Details</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border/50">
                                        {sector.tents.map(tent => (
                                            <tr key={tent.id} className="hover:bg-secondary/20 transition-all group cursor-pointer" onClick={() => setSelectedTent(tent)}>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col">
                                                        <span className="font-black text-foreground text-sm tracking-tight uppercase group-hover:text-primary transition-colors">{tent.name}</span>
                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{sector.name}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex flex-col gap-1">
                                                        <div className="flex justify-between items-center w-24">
                                                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Present</span>
                                                            <span className="text-sm font-black text-foreground">{tent.occupied} / {tent.capacity}</span>
                                                        </div>
                                                        <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full transition-all duration-500 rounded-full ${tent.occupied >= tent.capacity ? 'bg-orange-500' : 'bg-primary'
                                                                    }`}
                                                                style={{ width: `${Math.min((tent.occupied / tent.capacity) * 100, 100)}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${tent.status === 'AVAILABLE'
                                                        ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                        : tent.status === 'FULL'
                                                            ? 'bg-orange-100 text-orange-700 border border-orange-200'
                                                            : 'bg-primary/10 text-primary border border-primary/20'
                                                        }`}>
                                                        {tent.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-3">
                                                        {tent.guests.length > 0 ? (
                                                            <div className="flex flex-col">
                                                                <div className="flex -space-x-2 overflow-hidden mb-1">
                                                                    {tent.guests.slice(0, 4).map((g, i) => (
                                                                        <div
                                                                            key={g.id}
                                                                            className="w-7 h-7 rounded-full border-2 border-white bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary"
                                                                        >
                                                                            {g.name.charAt(0).toUpperCase()}
                                                                        </div>
                                                                    ))}
                                                                    {tent.guests.length > 4 && (
                                                                        <div className="w-7 h-7 rounded-full border-2 border-white bg-primary text-white flex items-center justify-center text-[8px] font-black">
                                                                            +{tent.guests.length - 4}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <span className="text-[11px] font-bold text-muted-foreground truncate max-w-[200px]">
                                                                    {tent.guests.map(g => g.name.toLowerCase()).join(', ')}
                                                                </span>
                                                            </div>
                                                        ) : (
                                                            <span className="text-muted-foreground/30 font-bold italic text-xs">No active guests</span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5" onClick={(e) => e.stopPropagation()}>
                                                    <Link
                                                        href="/desk-admin/history"
                                                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border border-border bg-white text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary hover:text-foreground transition-all shadow-sm"
                                                    >
                                                        <ClockIcon className="w-3.5 h-3.5" />
                                                        History
                                                    </Link>
                                                </td>
                                                <td className="px-6 py-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                    <Link
                                                        href={`/desk-admin/booking?sector=${sector.id}&tent=${tent.id}`}
                                                        className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-border text-muted-foreground hover:bg-primary hover:text-white hover:border-primary transition-all group/btn shadow-sm"
                                                    >
                                                        <ChevronRightIcon className="w-5 h-5 transition-transform group-hover/btn:translate-x-0.5" />
                                                    </Link>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                ))}

                {initialSectors.length === 0 && (
                    <div className="p-20 text-center text-muted-foreground italic border-2 border-dashed border-border rounded-3xl flex flex-col items-center gap-4 bg-white/50">
                        <PersonIcon className="w-12 h-12 opacity-20" />
                        <div>
                            <p className="font-bold text-lg">Inventory is empty</p>
                            <p className="text-sm opacity-60">No tents found for the assigned event.</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Tent Details Modal (Desk Admin Copy) */}
            {selectedTent && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setSelectedTent(null)} />
                    <div className="bg-white rounded-[2rem] w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl relative animate-in zoom-in-95 duration-200">
                        {/* Modal Header */}
                        <div className="p-8 border-b border-border bg-gradient-to-br from-white to-secondary/20 relative">
                            <button
                                onClick={() => setSelectedTent(null)}
                                className="absolute top-8 right-8 p-3 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
                            >
                                <Cross2Icon className="w-6 h-6" />
                            </button>

                            <div className="flex items-center gap-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg border ${selectedTent.status === 'AVAILABLE' ? 'bg-emerald-500 text-white' : 'bg-primary text-white'
                                    }`}>
                                    <PersonIcon className="w-8 h-8" />
                                </div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">{selectedTent.name}</h2>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-black tracking-widest uppercase border ${selectedTent.status === 'AVAILABLE' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-orange-100 text-orange-700 border-orange-200'
                                            }`}>
                                            {selectedTent.status}
                                        </span>
                                    </div>
                                    <p className="text-sm text-muted-foreground font-bold mt-1 uppercase tracking-widest">{selectedTent.sectorName} SECTOR</p>
                                </div>
                            </div>
                        </div>

                        {/* Modal Content */}
                        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)] space-y-8 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Capacity</p>
                                    <p className="text-2xl font-black text-foreground uppercase">{selectedTent.capacity} Persons</p>
                                </div>
                                <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Occupied</p>
                                    <p className="text-2xl font-black text-primary uppercase">{selectedTent.occupied} Present</p>
                                </div>
                                <div className="bg-secondary/30 p-6 rounded-2xl border border-border">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-2">Available</p>
                                    <p className="text-2xl font-black text-emerald-600 uppercase">{selectedTent.capacity - selectedTent.occupied} Left</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <h3 className="text-xl font-black text-foreground uppercase tracking-tight">Active Occupants</h3>
                                {selectedTent.guests.length > 0 ? (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {selectedTent.guests.map((guest) => (
                                            <div key={guest.id} className="p-4 bg-white border border-border rounded-2xl shadow-sm hover:border-primary/30 transition-all group">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black group-hover:bg-primary group-hover:text-white transition-colors">
                                                        {guest.name.charAt(0).toUpperCase()}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <p className="text-base font-black text-foreground truncate uppercase">{guest.name.toLowerCase()}</p>
                                                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">
                                                            {guest.age} Y • {guest.gender}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-2 gap-4">
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Check In</p>
                                                        <p className="text-[11px] font-bold text-foreground italic">{new Date(guest.checkIn).toLocaleDateString()}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest mb-1">Stay Till</p>
                                                        <p className="text-[11px] font-bold text-orange-600 italic">{new Date(guest.checkOut).toLocaleDateString()}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-12 text-center border-2 border-dashed border-border rounded-3xl bg-secondary/10">
                                        <PersonIcon className="w-10 h-10 mx-auto opacity-10 mb-2" />
                                        <p className="text-muted-foreground font-bold italic">No guests currently checked in.</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="p-6 border-t border-border bg-white flex justify-end gap-4">
                            <button
                                onClick={() => setSelectedTent(null)}
                                className="px-8 py-3 rounded-xl bg-secondary text-sm font-black uppercase tracking-widest text-muted-foreground hover:bg-secondary/80 transition-all border border-border active:scale-95"
                            >
                                Close
                            </button>
                            <Link
                                href={`/desk-admin/booking?sector=${selectedTent.sectorId}&tent=${selectedTent.id}`}
                                className="px-8 py-3 rounded-xl bg-primary text-white text-sm font-black uppercase tracking-widest shadow-lg shadow-primary/25 hover:bg-primary/90 transition-all active:scale-95"
                            >
                                Manage Booking
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
