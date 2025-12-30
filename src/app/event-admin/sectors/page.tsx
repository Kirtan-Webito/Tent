import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import AddSectorButton from '@/app/event-admin/sectors/add-sector-button';
import DeleteSectorButton from '@/app/event-admin/sectors/delete-sector-button';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

async function getSectors(eventId: string) {
    return await prisma.sector.findMany({
        where: { eventId },
        include: {
            _count: { select: { tents: true } }
        }
    });
}

export default async function SectorsPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;

    if (!eventId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>No event assigned. Please contact a Super Admin or try logging out and back in.</p>
            </div>
        );
    }

    const sectors = await getSectors(eventId);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent tracking-tight">
                        Operational Sectors
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">High-level management of deployment zones and inventory clusters.</p>
                </div>
                <AddSectorButton eventId={eventId} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectors.length === 0 ? (
                    <div className="col-span-full py-20 glass rounded-[2rem] border-dashed border-white/10 text-center text-gray-500">
                        <div className="text-4xl mb-4 opacity-20">📐</div>
                        No sectors initialized for this event node.
                    </div>
                ) : (
                    sectors.map((sector: any) => (
                        <div key={sector.id} className="group relative">
                            <Link href={`/event-admin/sectors/${sector.id}`} className="block">
                                <div className="glass p-8 rounded-[2rem] border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-xl hover:shadow-primary/10 transition-all duration-500 hover:-translate-y-2 group-hover:border-primary/20 relative overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500" />

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">SEC_NODE</div>
                                            <h3 className="text-2xl font-black text-white group-hover:text-primary transition-colors">{sector.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-white">{sector._count.tents}</span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">Inventory Units</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                            →
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Action Overlay */}
                            <div className="absolute top-5 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 z-10">
                                <div className="p-1 rounded-2xl bg-black/40 border border-white/5 text-white/50 group-hover:text-primary group-hover:border-primary/20 transition-all">
                                    <DeleteSectorButton sectorId={sector.id} sectorName={sector.name} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
