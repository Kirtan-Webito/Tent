import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function SettingsPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    if (!eventId) redirect('/login');

    const event = await prisma.event.findUnique({
        where: { id: eventId }
    });

    if (!event) return <div>Event not found</div>;

    return (
        <div className="max-w-2xl space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-200 bg-clip-text text-transparent">
                    Event Settings
                </h1>
                <p className="text-gray-400">Configuration for <strong>{event.name}</strong></p>
            </div>

            <div className="space-y-6">
                <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                    <h2 className="font-bold text-lg border-b border-white/10 pb-2">Event Details</h2>
                    <div className="flex items-center justify-between">
                        <span>Event Name</span>
                        <input type="text" value={event.name} className="bg-black/40 border border-white/20 rounded px-2 py-1 text-gray-300 cursor-not-allowed" readOnly />
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Location</span>
                        <input type="text" value={event.location} className="bg-black/40 border border-white/20 rounded px-2 py-1 text-gray-300 cursor-not-allowed" readOnly />
                    </div>
                    <div className="flex items-center justify-between">
                        <span>Dates</span>
                        <span className="text-gray-400 text-sm">
                            {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </span>
                    </div>
                </div>

                <div className="bg-white/5 border border-white/10 p-6 rounded-xl space-y-4">
                    <div className="p-4 bg-yellow-500/10 text-yellow-200 text-sm rounded border border-yellow-500/20">
                        ⚠ To change event details, please contact a Super Admin.
                    </div>
                </div>
            </div>
        </div>
    );
}
