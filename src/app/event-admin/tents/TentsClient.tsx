'use client';

import { useState } from 'react';
import TentDetailsModal from './TentDetailsModal';

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

    const handleTentClick = (tent: any, sector: { id: string, name: string }) => {
        setSelectedTent({
            ...tent,
            sector
        });
        setIsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                    Tents Inventory
                </h1>
                <p className="text-gray-400">Live status of all deployed tents - Click to view details</p>
            </div>

            <div className="space-y-12">
                {tents.length === 0 ? (
                    <div className="py-20 glass rounded-[2rem] border-dashed border-white/10 text-center text-gray-500">
                        <div className="text-4xl mb-4 opacity-20">⛺</div>
                        No sectors or tents found. Go to Sectors to create some.
                    </div>
                ) : (
                    tents.map(sector => (
                        <div key={sector.id} className="space-y-6">
                            <div className="flex items-center gap-4">
                                <h2 className="text-xl font-black text-white uppercase tracking-widest">{sector.name}</h2>
                                <div className="h-px flex-1 bg-white/5" />
                                <span className="text-[10px] text-gray-500 font-bold uppercase">{sector.tents.length} Units</span>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4 animate-in slide-in-from-bottom-4 duration-500">
                                {sector.tents.length === 0 ? (
                                    <div className="col-span-full py-8 text-center text-gray-600 italic text-sm">
                                        No tents in this sector.
                                    </div>
                                ) : (
                                    sector.tents.map((item) => (
                                        <div
                                            key={item.id}
                                            onClick={() => handleTentClick(item, { id: sector.id, name: sector.name })}
                                            className={`p-5 rounded-2xl border cursor-pointer transition-all hover:scale-105 hover:shadow-2xl active:scale-95 group ${item.status === 'Available' ? 'bg-emerald-500/5 border-emerald-500/20 hover:bg-emerald-500/10' :
                                                item.status === 'Occupied' ? 'bg-blue-500/5 border-blue-500/20 hover:bg-blue-500/10' :
                                                    'bg-gray-500/5 border-gray-500/20 opacity-75'
                                                }`}
                                        >
                                            <div className="flex justify-between items-start mb-3">
                                                <span className={`font-black text-xl tracking-tighter transition-colors ${item.status === 'Available' ? 'text-emerald-400 group-hover:text-emerald-300' :
                                                    item.status === 'Occupied' ? 'text-blue-400 group-hover:text-blue-300' :
                                                        'text-gray-400'
                                                    }`} title={item.name}>
                                                    {item.name}
                                                </span>
                                            </div>
                                            <div className="flex flex-col gap-2">
                                                <div className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest text-center border ${item.status === 'Available' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                    item.status === 'Occupied' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                                    }`}>
                                                    {item.status}
                                                </div>
                                            </div>
                                            {item.currentBooking && (
                                                <div className="mt-4 pt-4 border-t border-white/5 flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                                                        {item.currentBooking.members.length} GUEST{item.currentBooking.members.length !== 1 ? 'S' : ''}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    ))
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
