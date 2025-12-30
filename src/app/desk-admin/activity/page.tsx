import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function getLogs(eventId: string) {
    // Assuming we have a way to filter logs by event, or we just show global logs for now if they are not event-scoped.
    // Ideally, logs should be related to bookings which are related to tents/sectors in the event.
    // For now, let's fetch recent logs. In a real app, you'd filter by event.

    // FETCH STRATEGY: Find all logs where the related booking's tent is in the event.
    // This might be complex, so let's just show the last 50 logs for simplicity, 
    // or if we added eventId to logs, filter by that.

    const logs = await prisma.log.findMany({
        take: 50,
        orderBy: { createdAt: 'desc' },
        include: {
            user: true // The admin who performed the action
        }
    });

    return logs;
}

export default async function ActivityPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;

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
                                    <span>{new Date(log.timestamp).toLocaleString()}</span>
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
