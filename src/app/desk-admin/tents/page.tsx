import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { LockClosedIcon, HomeIcon } from '@radix-ui/react-icons';

async function getInventory(eventId: string, sectorId?: string) {
    return await prisma.sector.findMany({
        where: {
            eventId,
            ...(sectorId ? { id: sectorId } : {})
        },
        include: {
            tents: {
                include: {
                    bookings: {
                        where: {
                            status: { in: ['CONFIRMED', 'CHECKED_IN'] }
                        }
                    }
                },
                orderBy: { name: 'asc' }
            }
        },
        orderBy: { name: 'asc' }
    });
}

export default async function DeskTentsPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    const sectorId = (session as any)?.assignedSectorId;

    if (!eventId) {
        return (
            <div className="p-10 glass rounded-[2rem] border-white/5 text-center">
                <LockClosedIcon className="w-12 h-12 mx-auto mb-4 opacity-20 text-red-500" />
                <h2 className="text-xl font-bold text-gray-500 italic">Security Protocol: No Event Assigned</h2>
            </div>
        );
    }

    const sectors = await getInventory(eventId, sectorId);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="text-[10px] text-orange-400 font-black uppercase tracking-[0.2em] mb-1">INVENTORY_PROTOCOL</div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                        Tent Inventory
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-2 font-medium italic opacity-70">Sector-wise occupancy visualization and deployment tracking.</p>
                </div>

                <div className="flex gap-4">
                    <div className="px-4 py-2 glass rounded-xl border-white/5 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Available</span>
                    </div>
                    <div className="px-4 py-2 glass rounded-xl border-white/5 flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-red-500" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Occupied</span>
                    </div>
                </div>
            </div>

            <div className="space-y-12">
                {sectors.map((sector: any) => (
                    <div key={sector.id} className="space-y-6">
                        <div className="flex items-center gap-4 group">
                            <div className="w-10 h-10 rounded-2xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-400 font-bold group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                                <HomeIcon className="w-5 h-5" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-white tracking-tight">{sector.name}</h2>
                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest">
                                    {sector.tents.length} Units Detected in Cluster
                                </div>
                            </div>
                            <div className="flex-1 h-px bg-white/5 ml-4" />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {sector.tents.map((tent: any) => {
                                const isOccupied = tent.bookings.length > 0;
                                return (
                                    <div
                                        key={tent.id}
                                        className={`group relative p-5 rounded-3xl border transition-all duration-500 hover:scale-105 overflow-hidden ${isOccupied
                                            ? 'bg-red-500/5 border-red-500/10'
                                            : 'bg-emerald-500/5 border-emerald-500/10 hover:border-emerald-500/40 hover:bg-emerald-500/10'
                                            }`}
                                    >
                                        {/* Status Glow */}
                                        <div className={`absolute -right-4 -top-4 w-12 h-12 rounded-full blur-xl opacity-20 ${isOccupied ? 'bg-red-500' : 'bg-emerald-500'
                                            }`} />

                                        <div className="flex flex-col items-center text-center relative z-10">
                                            <div className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-2 group-hover:text-white transition-colors">
                                                {isOccupied ? 'OCCUPIED' : 'VACANT'}
                                            </div>
                                            <div className={`font-black text-2xl tracking-tighter mb-1 transition-colors ${isOccupied ? 'text-red-400' : 'text-emerald-400 group-hover:text-white'
                                                }`}>
                                                {tent.name}
                                            </div>
                                            <div className="px-2.5 py-1 rounded-lg bg-black/20 text-[9px] font-black text-gray-500 uppercase tracking-tighter">
                                                CAP: {tent.capacity}
                                            </div>
                                        </div>

                                        {/* Indicator Dot */}
                                        <div className={`absolute bottom-3 right-3 w-1.5 h-1.5 rounded-full ${isOccupied ? 'bg-red-500' : 'bg-emerald-500 group-hover:animate-pulse'
                                            }`} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ))}

                {sectors.length === 0 && (
                    <div className="py-32 text-center glass rounded-[3rem] border-dashed border-white/10">
                        <HomeIcon className="w-12 h-12 mx-auto mb-6 opacity-10" />
                        <p className="text-gray-500 font-medium italic">No operational clusters found in current node...</p>
                    </div>
                )}
            </div>
        </div>
    );
}
