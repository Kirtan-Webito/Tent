export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AddEventButton from '@/app/super-admin/events/add-event-button';
import { GlobeIcon, SewingPinFilledIcon, RadiobuttonIcon } from '@radix-ui/react-icons';

async function getEvents() {
    return await prisma.event.findMany({
        include: {
            _count: {
                select: { sectors: true }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export default async function EventsPage() {
    const events = await getEvents();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-blue-400 via-indigo-300 to-purple-500 bg-clip-text text-transparent tracking-tight">
                        Global Event Registry
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Command center for all active and scheduled deployments.</p>
                </div>
                <AddEventButton />
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {events.length === 0 ? (
                    <div className="col-span-full py-20 glass rounded-[2rem] border-dashed border-white/10 text-center text-gray-500">
                        <GlobeIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        No events found. Initialize your first node.
                    </div>
                ) : (
                    events.map((event: any) => (
                        <div
                            key={event.id}
                            className="glass p-5 rounded-2xl border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-xl border border-white/5"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <div className="text-[10px] text-blue-400 font-black uppercase tracking-widest mb-1">EVENT_ID: {event.id.slice(0, 8)}</div>
                                    <h3 className="text-xl font-bold text-white">{event.name}</h3>
                                </div>
                                <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold group-hover:scale-110 transition-transform">
                                    <SewingPinFilledIcon className="w-5 h-5 text-blue-400" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                                    <div className="text-[8px] font-black text-gray-500 uppercase mb-1">LOCATION</div>
                                    <div className="text-xs font-bold text-gray-300">{event.location}</div>
                                </div>
                                <div className="p-3 rounded-xl bg-black/20 border border-white/5">
                                    <div className="text-[8px] font-black text-gray-500 uppercase mb-1">SECTORS</div>
                                    <div className="text-xs font-bold text-gray-300">{event._count.sectors} Units</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="text-[10px] text-gray-500 font-bold uppercase">
                                    START: {new Date(event.startDate).toLocaleDateString('en-GB')}
                                </div>
                                <div className="flex gap-2">
                                    <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white/5 hover:bg-white/10 text-white transition">Edit</button>
                                    <button className="px-3 py-1.5 rounded-lg text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 transition">Delete</button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2x">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Registry Detail</th>
                            <th className="p-6">Geographic Node</th>
                            <th className="p-6">Initialization</th>
                            <th className="p-6">Sector Count</th>
                            <th className="p-6 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-gray-600 italic">
                                    <RadiobuttonIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    No nodes matching global synchronization criteria...
                                </td>
                            </tr>
                        ) : (
                            events.map((event: any) => (
                                <tr key={event.id} className="hover:bg-white/[0.03] transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 font-bold group-hover:scale-110 transition-transform">
                                                E
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-blue-400 transition-colors">{event.name}</div>
                                                <div className="text-[10px] font-mono text-gray-500">ID: {event.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-gray-400 font-medium">{event.location}</td>
                                    <td className="p-6">
                                        <div className="text-xs text-white font-bold">{new Date(event.startDate).toLocaleDateString('en-GB')}</div>
                                        <div className="text-[10px] text-gray-600 font-black uppercase tracking-widest mt-0.5">ESTR_NODE</div>
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-[10px] font-black uppercase tracking-widest">
                                            {event._count.sectors} ACTIVE_SEC
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="text-blue-400 hover:text-blue-300 font-black text-[10px] uppercase tracking-widest mr-4 transition-colors">Modify</button>
                                        <button className="text-red-400 hover:text-red-300 font-black text-[10px] uppercase tracking-widest transition-colors">Purge</button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
