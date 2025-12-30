export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function getLogs(eventId: string) {
    // Fetch logs related to the event
    const logs = await prisma.log.findMany({
        where: {
            user: {
                assignedEventId: eventId
            }
        },
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            user: true
        }
    });

    return logs;
}

export default async function ActivityPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    const sectorIds = (session as any)?.assignedSectorIds;

    if (!eventId) return <div className="p-8 text-gray-500">No event assigned.</div>;

    const logs = await getLogs(eventId);

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Activity Log</h1>
                <p className="text-gray-400">Recent system actions and audit trails.</p>
            </div>

            <div className="glass rounded-2xl overflow-hidden border border-white/5 p-6">
                <div className="space-y-6">
                    {logs.map((log: any) => (
                        <div key={log.id} className="flex gap-4 items-start border-b border-white/5 pb-6 last:border-0 last:pb-0">
                            <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-lg flex-none">
                                📝
                            </div>
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="font-bold text-white">{log.action}</span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">{log.entityType}</span>
                                </div>
                                <p className="text-gray-400 text-sm mb-2">{log.details}</p>
                                <div className="flex items-center gap-4 text-xs text-gray-600">
                                    <span>By: {log.user?.name || log.user?.email || 'System'}</span>
                                    <span>•</span>
                                    <span>{new Date(log.createdAt).toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No activity recorded yet.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
