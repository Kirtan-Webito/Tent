import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { formatDistanceToNow } from 'date-fns';
import { FileTextIcon, MagnifyingGlassIcon, MixerHorizontalIcon } from '@radix-ui/react-icons';

async function getLogs(eventId: string) {
    // Find all users associated with this event
    const eventUsers = await prisma.user.findMany({
        where: {
            OR: [
                { assignedEventId: eventId },
                { role: 'SUPER_ADMIN' }
            ]
        },
        select: { id: true }
    });

    const logs = await prisma.log.findMany({
        where: {
            userId: { in: eventUsers.map((u: any) => u.id) }
        },
        include: { user: true },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    return logs;
}

export default async function EventLogsPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;

    if (!eventId) return <div className="p-8">Access Denied.</div>;

    const logs = await getLogs(eventId);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Event Audit Trail</h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Comprehensive historical log of all command decisions.</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search tactical logs..."
                            className="bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-500/50 focus:bg-white/[0.08] transition-all w-64"
                        />
                    </div>
                </div>
            </div>

            <div className="glass rounded-[2rem] border-white/5 overflow-hidden shadow-2xl">
                <div className="p-6 md:p-8 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <FileTextIcon className="w-5 h-5 text-emerald-400" /> Recent Operations
                    </h3>
                    <button className="p-2 bg-white/5 rounded-lg border border-white/10 text-gray-400 hover:text-white transition-colors">
                        <MixerHorizontalIcon className="w-4 h-4" />
                    </button>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-white/[0.01] text-[10px] text-gray-500 uppercase tracking-widest font-black border-b border-white/5">
                                <th className="px-8 py-4">Timestamp</th>
                                <th className="px-8 py-4">Action</th>
                                <th className="px-8 py-4">Operator</th>
                                <th className="px-8 py-4">Target Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5">
                            {logs.map((log) => (
                                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                                    <td className="px-8 py-5">
                                        <div className="text-xs text-gray-300 font-mono">
                                            {new Date(log.createdAt).toLocaleDateString()}
                                            <span className="text-gray-600 ml-2">
                                                {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-gray-500 mt-0.5">
                                            {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase border border-emerald-500/20">
                                            {log.action.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 border border-white/10 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">
                                                {log.user.name?.charAt(0) || 'S'}
                                            </div>
                                            <div>
                                                <div className="text-sm text-gray-200 font-bold">{log.user.name || 'System'}</div>
                                                <div className="text-[10px] text-gray-500 uppercase tracking-tighter">{log.user.role}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-5">
                                        <p className="text-xs text-gray-400 max-w-md line-clamp-2 leading-relaxed italic">
                                            "{log.details}"
                                        </p>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-center">
                    <button className="text-[10px] font-black text-gray-500 hover:text-emerald-400 uppercase tracking-widest transition-all">
                        LOAD MORE ARCHIVE DATA
                    </button>
                </div>
            </div>
        </div>
    );
}
