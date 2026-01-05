export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AddEventButton from '@/app/super-admin/events/add-event-button';
import EventOperations from '@/app/super-admin/events/event-operations';
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
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        Global Event Registry
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Command center for all active and scheduled deployments.</p>
                </div>
                <AddEventButton />
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {events.length === 0 ? (
                    <div className="col-span-full py-20 bg-card rounded-[2rem] border-dashed border-2 border-muted text-center text-muted-foreground">
                        <GlobeIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        No events found. Initialize your first node.
                    </div>
                ) : (
                    events.map((event: any) => {
                        const isExpired = new Date() > new Date(event.endDate);
                        return (
                            <div
                                key={event.id}
                                className={`bg-card p-5 rounded-2xl border shadow-sm ${isExpired ? 'border-red-200' : 'border-border'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <div className="text-[10px] text-primary font-black uppercase tracking-widest mb-1">EVENT_ID: {event.id.slice(0, 8)}</div>
                                        <div className="flex items-center gap-2">
                                            <h3 className="text-xl font-bold text-foreground">{event.name}</h3>
                                            {isExpired && (
                                                <span className="px-1.5 py-0.5 rounded bg-red-100 text-[9px] font-bold text-red-600 border border-red-200 uppercase tracking-wider">
                                                    EXPIRED
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className={`p-2 rounded-xl border font-bold group-hover:scale-110 transition-transform ${isExpired ? 'bg-red-100 border-red-200 text-red-600' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                        <SewingPinFilledIcon className={`w-5 h-5 ${isExpired ? 'text-red-600' : 'text-primary'}`} />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3 mb-4">
                                    <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                                        <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">LOCATION</div>
                                        <div className="text-xs font-bold text-foreground">{event.location}</div>
                                    </div>
                                    <div className="p-3 rounded-xl bg-secondary/50 border border-border">
                                        <div className="text-[8px] font-black text-muted-foreground uppercase mb-1">SECTORS</div>
                                        <div className="text-xs font-bold text-foreground">{event._count.sectors} Units</div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-border">
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase">
                                        END: {new Date(event.endDate).toLocaleDateString('en-GB')}
                                    </div>
                                    <EventOperations event={event} />
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block glass rounded-[2rem] overflow-hidden border border-border bg-card shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Registry Detail</th>
                            <th className="p-6">Geographic Node</th>
                            <th className="p-6">Initialization</th>
                            <th className="p-6">Sector Count</th>
                            <th className="p-6 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {events.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-muted-foreground italic">
                                    <RadiobuttonIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    No nodes matching global synchronization criteria...
                                </td>
                            </tr>
                        ) : (
                            events.map((event: any) => {
                                const isExpired = new Date() > new Date(event.endDate);
                                return (
                                    <tr key={event.id} className="hover:bg-secondary/30 transition-all group">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center font-bold group-hover:scale-110 transition-transform ${isExpired ? 'bg-red-100 border-red-200 text-red-600' : 'bg-primary/10 border-primary/20 text-primary'}`}>
                                                    E
                                                </div>
                                                <div>
                                                    <div className="flex items-center gap-2">
                                                        <div className="font-bold text-foreground group-hover:text-primary transition-colors">{event.name}</div>
                                                        {isExpired && (
                                                            <span className="px-1.5 py-0.5 rounded bg-red-100 text-[9px] font-bold text-red-600 border border-red-200 uppercase tracking-wider">
                                                                EXPIRED
                                                            </span>
                                                        )}
                                                    </div>
                                                    <div className="text-[10px] font-mono text-muted-foreground">ID: {event.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6 text-muted-foreground font-medium">{event.location}</td>
                                        <td className="p-6">
                                            <div className="text-xs text-foreground font-bold">{new Date(event.startDate).toLocaleDateString('en-GB')}</div>
                                            <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mt-0.5">
                                                To: {new Date(event.endDate).toLocaleDateString('en-GB')}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-100 rounded-full">
                                                <span className="font-bold text-indigo-700">{event._count.sectors}</span>
                                                <span className="text-[9px] font-black text-indigo-400 uppercase tracking-widest">SECTORS</span>
                                            </div>
                                        </td>
                                        <td className="p-6 text-right">
                                            <EventOperations event={event} />
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
