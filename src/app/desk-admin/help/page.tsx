import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';

export default async function DeskAdminHelpPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    if (!eventId) redirect('/login');

    const [contacts, sops] = await Promise.all([
        prisma.emergencyContact.findMany({
            where: { eventId },
            orderBy: { order: 'asc' }
        }),
        prisma.sOP.findMany({
            where: { eventId },
            orderBy: { order: 'asc' }
        })
    ]);

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent">
                    Help & Support
                </h1>
                <p className="text-gray-400">Standard Operating Procedures and Emergency Contacts</p>
            </div>

            {/* Emergency Contacts */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">🚨 Emergency Contacts</h2>

                {contacts.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No emergency contacts available. Contact your Event Admin.</p>
                ) : (
                    <div className="grid md:grid-cols-3 gap-4">
                        {contacts.map(contact => (
                            <div key={contact.id} className="p-4 bg-gradient-to-br from-red-500/10 to-orange-500/5 border border-red-500/20 rounded-xl">
                                <div className="text-sm text-gray-400 mb-1">{contact.title}</div>
                                <div className="font-bold text-white text-lg mb-2">{contact.name}</div>
                                <a
                                    href={`tel:${contact.phone}`}
                                    className="inline-block px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition text-sm font-medium"
                                >
                                    📞 Call
                                </a>
                                <div className="text-xs text-gray-500 mt-2">{contact.phone}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* SOPs */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-6">
                <h2 className="text-xl font-bold text-white mb-4">📋 Quick Rules (SOP)</h2>

                {sops.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No SOPs available. Contact your Event Admin.</p>
                ) : (
                    <div className="space-y-3">
                        {sops.map((sop, idx) => (
                            <div key={sop.id} className="flex gap-3 p-4 bg-black/20 rounded-lg">
                                <div className="flex-none w-8 h-8 rounded-full bg-orange-500/20 text-orange-400 flex items-center justify-center font-bold">
                                    {idx + 1}
                                </div>
                                <div className="flex-1 text-gray-300 pt-1">{sop.rule}</div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="text-center text-xs text-gray-500 p-4 bg-white/5 rounded-lg">
                💡 For any questions or updates to this information, please contact your Event Admin
            </div>
        </div>
    );
}
