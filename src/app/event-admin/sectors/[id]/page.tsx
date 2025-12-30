export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import BulkCreateTents from './bulk-create-tents';
import BulkDeleteTents from './bulk-delete-tents';
import DeleteTentButton from '../delete-tent-button';

async function getSector(id: string) {
    return await prisma.sector.findUnique({
        where: { id },
        include: {
            tents: {
                orderBy: { name: 'asc' }
            }
        }
    });
}

export default async function SectorDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const sector = await getSector(id);

    if (!sector) return (
        <div className="p-20 text-center animate-in fade-in duration-500">
            <div className="text-4xl mb-4 opacity-20">🔍</div>
            <h2 className="text-2xl font-bold text-gray-500">Sector record not found in registry</h2>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div>
                    <div className="text-[10px] text-primary font-black uppercase tracking-[0.2em] mb-1">SECTOR_NODE_DETAIL</div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">
                        {sector.name}
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-2 font-medium italic opacity-70">Inventory management and deployment controls for this sector.</p>
                </div>

                <div className="flex gap-3 flex-wrap">
                    <BulkCreateTents sectorId={sector.id} />
                    <BulkDeleteTents sectorId={sector.id} />
                </div>
            </div>

            <div className="glass rounded-[2.5rem] overflow-hidden border-white/5 shadow-2xl bg-gradient-to-br from-white/[0.03] to-transparent">
                <div className="p-8 border-b border-white/5 flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl text-primary font-bold">
                            📦
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">Campsite Inventory</h3>
                            <div className="text-[10px] text-gray-500 font-black uppercase tracking-widest mt-0.5">Deployment Nodes: {sector.tents.length} Units</div>
                        </div>
                    </div>
                </div>

                <div className="p-6 md:p-8">
                    {sector.tents.length === 0 ? (
                        <div className="py-24 text-center">
                            <div className="text-4xl mb-4 opacity-10">🏕️</div>
                            <p className="text-gray-500 font-medium italic">No active deployments detected. Use the Bulk Generator to initialize inventory.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                            {sector.tents.map((tent: any) => (
                                <div
                                    key={tent.id}
                                    className="group relative p-4 rounded-2xl border border-white/5 bg-black/20 hover:bg-white/5 hover:border-primary/30 transition-all duration-300 hover:scale-105"
                                >
                                    <DeleteTentButton tentId={tent.id} tentName={tent.name} />
                                    <div className="flex flex-col items-center text-center">
                                        <div className="text-[8px] font-black text-gray-600 uppercase tracking-widest mb-1 group-hover:text-primary transition-colors">NODEID</div>
                                        <div className="font-black text-lg text-white group-hover:text-primary transition-colors tracking-tighter mb-1">{tent.name}</div>
                                        <div className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] font-bold text-gray-500 uppercase">CAP: {tent.capacity}</div>
                                    </div>
                                    <div className="absolute inset-x-0 -bottom-1 h-0.5 bg-primary opacity-0 group-hover:opacity-100 transition-opacity blur-sm" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
