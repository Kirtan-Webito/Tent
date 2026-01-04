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

                                {/* Accordion Content */}
                                {isExpanded && (
                                    <div className="px-6 pb-6 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                                            {sector.tents.length === 0 ? (
                                                <div className="col-span-full py-8 text-center text-muted-foreground italic text-sm">
                                                    No tents in this sector.
                                                </div>
                                            ) : (
                                                sector.tents.map((item) => (
                                                    <div
                                                        key={item.id}
                                                        onClick={() => handleTentClick(item, { id: sector.id, name: sector.name })}
                                                        className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-105 hover:shadow-lg active:scale-95 group ${item.status === 'Available' ? 'bg-emerald-50 border-emerald-100 hover:bg-emerald-100' :
                                                            item.status === 'Occupied' ? 'bg-orange-50 border-orange-100 hover:bg-orange-100' :
                                                                'bg-secondary border-border opacity-75'
                                                            }`}
                                                    >
                                                        <div className="flex justify-between items-start mb-3">
                                                            <span className={`font-black text-xl tracking-tighter transition-colors ${item.status === 'Available' ? 'text-emerald-700' :
                                                                item.status === 'Occupied' ? 'text-primary' :
                                                                    'text-muted-foreground'
                                                                }`} title={item.name}>
                                                                {item.name}
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-col gap-2">
                                                            <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-center border ${item.status === 'Available' ? 'bg-emerald-100 text-emerald-700 border-emerald-200' :
                                                                item.status === 'Occupied' ? 'bg-orange-100 text-orange-700 border-orange-200' :
                                                                    'bg-secondary text-muted-foreground border-border'
                                                                }`}>
                                                                {item.status}
                                                            </div>
                                                        </div>
                                                        {item.currentBooking && (
                                                            <div className="mt-4 pt-4 border-t border-black/5 flex items-center gap-2">
                                                                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                                                                <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tighter">
                                                                    {item.currentBooking.members.length} GUEST{item.currentBooking.members.length !== 1 ? 'S' : ''}
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            )}
                                        </div>
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
