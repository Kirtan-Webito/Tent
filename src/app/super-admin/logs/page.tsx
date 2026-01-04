export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

async function getLogs() {
    return await prisma.log.findMany({
        include: {
            user: {
                select: { name: true, email: true, role: true }
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 100 // Limit to last 100 logs for performance
    });
}

export default async function LogsPage() {
    const session = await getSession();
    const user = session as any;

    if (!user || user.role !== 'SUPER_ADMIN') {
        redirect('/login');
    }

    const logs = await getLogs();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        System Audit Trail
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Immutable ledger of global system operations and security events.</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-secondary border border-border text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    Live Sync Active
                </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {logs.length === 0 ? (
                    <div className="col-span-full py-20 bg-card rounded-[2rem] border-dashed border-2 border-muted text-center text-muted-foreground">
                        No audit events found in current cycle.
                    </div>
                ) : (
                    logs.map((log: any) => (
                        <div
                            key={log.id}
                            className="bg-card p-5 rounded-2xl border border-border shadow-sm"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${log.action.includes('DELETE') ? 'bg-red-100 text-red-600 border-red-200' :
                                    log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                                        log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                            'bg-secondary text-muted-foreground border-border'
                                    }`}>
                                    {log.action}
                                </span>
                                <span className="text-[10px] text-muted-foreground font-mono">
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                            </div>

                            <p className="text-sm text-foreground mb-4 line-clamp-2 italic font-medium">"{log.details || 'No extended details available'}"</p>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-secondary border border-border flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                                        {log.user?.name.charAt(0) || 'S'}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-tight">
                                        {log.user?.name || 'SYSTEM_DAEMON'}
                                    </div>
                                </div>
                                <div className="text-[10px] text-muted-foreground font-bold uppercase">
                                    {new Date(log.createdAt).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block glass rounded-[2rem] overflow-hidden border border-border bg-card shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Timestamp</th>
                            <th className="p-6">Action_Type</th>
                            <th className="p-6">Originating_Entity</th>
                            <th className="p-6">Payload_Overview</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-muted-foreground italic">
                                    <div className="text-4xl mb-4 opacity-50">📜</div>
                                    No audit sequences detected...
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-secondary/30 transition-all group font-mono text-xs">
                                    <td className="p-6 text-muted-foreground whitespace-nowrap group-hover:text-primary transition-colors">
                                        {new Date(log.createdAt).toLocaleString('en-GB')}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${log.action.includes('DELETE') ? 'bg-red-100 text-red-600 border-red-200' :
                                            log.action.includes('CREATE') ? 'bg-emerald-100 text-emerald-600 border-emerald-200' :
                                                log.action.includes('UPDATE') ? 'bg-blue-100 text-blue-600 border-blue-200' :
                                                    'bg-secondary text-muted-foreground border-border'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        {log.user ? (
                                            <div>
                                                <div className="font-bold text-foreground uppercase tracking-tight">{log.user.name}</div>
                                                <div className="text-[10px] text-muted-foreground font-black uppercase tracking-[0.2em]">{log.user.role}</div>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground font-bold uppercase tracking-widest">SYSTEM_KERNEL</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-muted-foreground max-w-md truncate italic" title={log.details || ''}>
                                        {log.details || 'NULL_DATA'}
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
