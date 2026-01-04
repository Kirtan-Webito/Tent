export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import AddSectorButton from '@/app/event-admin/sectors/add-sector-button';
import DeleteSectorButton from '@/app/event-admin/sectors/delete-sector-button';
import Link from 'next/link';

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
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        Operational Sectors
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">High-level management of deployment zones and inventory clusters.</p>
                </div>
                <AddSectorButton eventId={eventId} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {sectors.length === 0 ? (
                    <div className="col-span-full py-20 px-8 rounded-[2rem] border-dashed border-2 border-muted-foreground/20 text-center text-muted-foreground">
                        <div className="text-4xl mb-4 opacity-50">📐</div>
                        No sectors initialized for this event node.
                    </div>
                ) : (
                    sectors.map((sector: any) => (
                        <div key={sector.id} className="group relative">
                            <Link href={`/event-admin/sectors/${sector.id}`} className="block">
                                <div className="p-8 rounded-[2rem] border border-border bg-card shadow-sm hover:shadow-lg hover:shadow-primary/5 transition-all duration-500 hover:-translate-y-2 group-hover:border-primary/50 relative overflow-hidden">
                                    {/* Decorative background element */}
                                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/10 transition-all duration-500" />

                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <div className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">SEC_NODE</div>
                                            <h3 className="text-2xl font-black text-foreground group-hover:text-primary transition-colors">{sector.name}</h3>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-6 border-t border-border">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-2xl font-black text-foreground">{sector._count.tents}</span>
                                            <span className="text-[10px] text-muted-foreground font-bold uppercase">Inventory Units</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full bg-secondary border border-border flex items-center justify-center text-muted-foreground group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all">
                                            →
                                        </div>
                                    </div>
                                </div>
                            </Link>

                            {/* Action Overlay - kept somewhat distinct for visibility */}
                            <div className="absolute top-5 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-90 group-hover:scale-100 z-10">
                                <div className="p-1 rounded-2xl bg-white/80 dark:bg-black/40 border border-border shadow-sm text-muted-foreground group-hover:text-destructive group-hover:border-destructive/20 transition-all">
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
