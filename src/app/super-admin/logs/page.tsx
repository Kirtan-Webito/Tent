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
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 via-pink-300 to-indigo-500 bg-clip-text text-transparent tracking-tight">
                        System Audit Trail
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Immutable ledger of global system operations and security events.</p>
                </div>
                <div className="px-4 py-2 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    Live Sync Active
                </div>
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {logs.length === 0 ? (
                    <div className="col-span-full py-20 glass rounded-[2rem] border-dashed border-white/10 text-center text-gray-500">
                        No audit events found in current cycle.
                    </div>
                ) : (
                    logs.map((log: any) => (
                        <div
                            key={log.id}
                            className="glass p-5 rounded-2xl border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-xl"
                        >
                            <div className="flex justify-between items-start mb-4">
                                <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                    log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                        log.action.includes('UPDATE') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                            'bg-white/5 text-gray-400 border-white/10'
                                    }`}>
                                    {log.action}
                                </span>
                                <span className="text-[10px] text-gray-600 font-mono">
                                    {new Date(log.createdAt).toLocaleTimeString()}
                                </span>
                            </div>

                            <p className="text-sm text-gray-300 mb-4 line-clamp-2 italic font-medium">"{log.details || 'No extended details available'}"</p>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-bold text-gray-400">
                                        {log.user?.name.charAt(0) || 'S'}
                                    </div>
                                    <div className="text-[10px] text-gray-500 font-bold uppercase tracking-tight">
                                        {log.user?.name || 'SYSTEM_DAEMON'}
                                    </div>
                                </div>
                                <div className="text-[10px] text-gray-600 font-bold uppercase">
                                    {new Date(log.createdAt).toLocaleDateString('en-GB')}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2x">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Timestamp</th>
                            <th className="p-6">Action_Type</th>
                            <th className="p-6">Originating_Entity</th>
                            <th className="p-6">Payload_Overview</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {logs.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-gray-600 italic">
                                    <div className="text-4xl mb-4 opacity-20">📜</div>
                                    No audit sequences detected...
                                </td>
                            </tr>
                        ) : (
                            logs.map((log: any) => (
                                <tr key={log.id} className="hover:bg-white/[0.03] transition-all group font-mono text-xs">
                                    <td className="p-6 text-gray-500 whitespace-nowrap group-hover:text-purple-400 transition-colors">
                                        {new Date(log.createdAt).toLocaleString('en-GB')}
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-2 py-1 rounded-lg text-[10px] font-black border uppercase tracking-widest ${log.action.includes('DELETE') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                            log.action.includes('CREATE') ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                log.action.includes('UPDATE') ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                    'bg-gray-500/10 text-gray-400 border-gray-500/20'
                                            }`}>
                                            {log.action}
                                        </span>
                                    </td>
                                    <td className="p-6">
                                        {log.user ? (
                                            <div>
                                                <div className="font-bold text-white uppercase tracking-tight">{log.user.name}</div>
                                                <div className="text-[10px] text-gray-500 font-black uppercase tracking-[0.2em]">{log.user.role}</div>
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 font-bold uppercase tracking-widest">SYSTEM_KERNEL</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-gray-400 max-w-md truncate italic" title={log.details || ''}>
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
