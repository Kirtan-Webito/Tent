'use client';

import { useState } from 'react';
import TentDetailsModal from './TentDetailsModal';
import { CubeIcon } from '@radix-ui/react-icons';

interface Member {
    id: string;
    name: string;
    age: number;
    gender: string;
    contact: string | null;
}

interface Booking {
    id: string;
    members: Member[];
    checkInDate: Date | null;
    checkOutDate: Date | null;
    status: string;
    mobile: string | null;
}

interface SectorItem {
    id: string;
    name: string;
    tents: TentItem[];
}

interface TentItem {
    id: string;
    name: string;
    capacity: number;
    status: string;
    currentBooking?: Booking;
}

export default function TentsClient({ tents }: { tents: SectorItem[] }) {
    const [selectedTent, setSelectedTent] = useState<any>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [expandedSectors, setExpandedSectors] = useState<Set<string>>(new Set());

    const handleTentClick = (tent: any, sector: { id: string, name: string }) => {
        setSelectedTent({
            ...tent,
            sector
        });
        setIsModalOpen(true);
    };

    const toggleSector = (sectorId: string) => {
        const newExpanded = new Set(expandedSectors);
        if (newExpanded.has(sectorId)) {
            newExpanded.delete(sectorId);
        } else {
            newExpanded.add(sectorId);
        }
        setExpandedSectors(newExpanded);
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent">
                        Tents Inventory
                    </h1>
                    <p className="text-muted-foreground">Manage and view all tents across sectors</p>
                </div>
            </div>

            <div className="space-y-4 animate-in fade-in duration-500">
                {tents.length === 0 ? (
                    <div className="py-20 bg-card border border-dashed border-border rounded-[2rem] text-center text-muted-foreground">
                        <CubeIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        No sectors found.
                    </div>
                ) : (
                    tents.map(sector => {
                        const isExpanded = expandedSectors.has(sector.id);
                        const availableTents = sector.tents.filter(t => t.status === 'Available').length;
                        const occupiedTents = sector.tents.filter(t => t.status === 'Occupied').length;

                        return (
                            <div key={sector.id} className="bg-white rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                {/* Accordion Header */}
                                <button
                                    onClick={() => toggleSector(sector.id)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-secondary/50 transition-colors"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`w-1 h-10 rounded-full transition-colors ${isExpanded ? 'bg-primary' : 'bg-border'}`} />
                                        <div className="text-left">
                                            <h2 className="text-lg font-black text-foreground uppercase tracking-wide">
                                                {sector.name}
                                            </h2>
                                            <div className="flex items-center gap-3 mt-1">
                                                <span className="text-xs text-muted-foreground font-medium">
                                                    {sector.tents.length} Total
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-xs text-emerald-600 font-medium">
                                                    {availableTents} Available
                                                </span>
                                                <span className="w-1 h-1 rounded-full bg-border" />
                                                <span className="text-xs text-orange-600 font-medium">
                                                    {occupiedTents} Occupied
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                                        <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </div>
                                </button>

                                {/* Accordion Content - Table View */}
                                {isExpanded && (
                                    <div className="animate-in fade-in slide-in-from-top-2 duration-300 border-t border-border">
                                        {sector.tents.length === 0 ? (
                                            <div className="py-8 text-center text-muted-foreground italic text-sm">
                                                No tents in this sector.
                                            </div>
                                        ) : (
                                            <div className="overflow-x-auto">
                                                <table className="w-full text-left text-sm">
                                                    <thead className="bg-secondary/30 text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">
                                                        <tr>
                                                            <th className="px-6 py-4">Tent</th>
                                                            <th className="px-6 py-4">Status</th>
                                                            <th className="px-6 py-4">Guests</th>
                                                            <th className="px-6 py-4">Timeline</th>
                                                            <th className="px-6 py-4 text-right">Details</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody className="divide-y divide-border">
                                                        {sector.tents.map((item) => (
                                                            <tr
                                                                key={item.id}
                                                                onClick={() => handleTentClick(item, { id: sector.id, name: sector.name })}
                                                                className="group hover:bg-secondary/50 transition-colors cursor-pointer"
                                                            >
                                                                <td className="px-6 py-4">
                                                                    <span className="font-bold text-foreground text-base group-hover:text-primary transition-colors">
                                                                        {item.name}
                                                                    </span>
                                                                    <div className="text-[10px] text-muted-foreground font-mono">
                                                                        CAP: {item.capacity}
                                                                    </div>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border ${item.status === 'Available' ? 'bg-emerald-100/50 text-emerald-700 border-emerald-200' :
                                                                            item.status === 'Occupied' ? 'bg-orange-100/50 text-orange-700 border-orange-200' :
                                                                                'bg-secondary text-muted-foreground border-border'
                                                                        }`}>
                                                                        {item.status}
                                                                    </span>
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    {item.currentBooking ? (
                                                                        <div className="flex items-center gap-2">
                                                                            <div className="flex -space-x-2">
                                                                                {item.currentBooking.members.slice(0, 3).map((m, i) => (
                                                                                    <div key={i} className="w-6 h-6 rounded-full bg-primary/10 border border-white flex items-center justify-center text-[8px] font-bold text-primary ring-2 ring-white">
                                                                                        {m.name.charAt(0)}
                                                                                    </div>
                                                                                ))}
                                                                                {item.currentBooking.members.length > 3 && (
                                                                                    <div className="w-6 h-6 rounded-full bg-secondary border border-white flex items-center justify-center text-[8px] font-bold text-muted-foreground ring-2 ring-white">
                                                                                        +{item.currentBooking.members.length - 3}
                                                                                    </div>
                                                                                )}
                                                                            </div>
                                                                            <span className="text-xs font-medium text-foreground">
                                                                                {item.currentBooking.members[0].name}
                                                                                {item.currentBooking.members.length > 1 && <span className="text-muted-foreground"> +{item.currentBooking.members.length - 1}</span>}
                                                                            </span>
                                                                        </div>
                                                                    ) : (
                                                                        <span className="text-xs text-muted-foreground italic">-</span>
                                                                    )}
                                                                </td>
                                                                <td className="px-6 py-4">
                                                                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border bg-white text-xs font-semibold text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all active:scale-95">
                                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                                                        History
                                                                    </button>
                                                                </td>
                                                                <td className="px-6 py-4 text-right">
                                                                    <div className="w-8 h-8 rounded-full bg-white border border-border flex items-center justify-center text-muted-foreground group-hover:text-primary group-hover:border-primary transition-all">
                                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                                                                    </div>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
            </div>

            <TentDetailsModal
                tent={selectedTent}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />
        </div>
    );
}
