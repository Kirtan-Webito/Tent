import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import AddUserButton from '@/app/super-admin/users/add-user-button'; // Reuse? Need slight mod or new component

import AddDeskAdminButton from '@/app/event-admin/team/add-desk-admin-button';
import RemoveDeskAdminButton from '@/app/event-admin/team/remove-desk-admin-button';

export const dynamic = 'force-dynamic';

async function getDeskAdmins(eventId: string) {
    return await prisma.user.findMany({
        where: {
            role: 'DESK_ADMIN',
            assignedEventId: eventId
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            assignedSector: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

async function getSectors(eventId: string) {
    return await prisma.sector.findMany({
        where: { eventId },
        orderBy: { name: 'asc' }
    });
}

export default async function TeamPage() {
    const session = await getSession();
    const eventId = (session as any).assignedEventId;
    const users = await getDeskAdmins(eventId);
    const sectors = await getSectors(eventId);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-purple-400 to-pink-300 bg-clip-text text-transparent tracking-tight">
                        Desk Operations Team
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Management of on-ground personnel and desk administration rights.</p>
                </div>
                <AddDeskAdminButton eventId={eventId} sectors={sectors} />
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {users.length === 0 ? (
                    <div className="col-span-full py-20 glass rounded-[2rem] border-dashed border-white/10 text-center text-gray-500">
                        <div className="text-4xl mb-4 opacity-20">👋</div>
                        No desk operators assigned to this sector.
                    </div>
                ) : (
                    users.map((user: any) => (
                        <div
                            key={user.id}
                            className="glass p-5 rounded-2xl border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-xl text-purple-400 font-bold">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-lg">{user.name}</h3>
                                    <div className="text-[10px] text-gray-500 font-mono">{user.email}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <div className="flex flex-col gap-1 items-end">
                                    <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                                        DESK_ADMIN
                                    </span>
                                    {user.assignedSector && (
                                        <span className="text-[9px] text-gray-500 font-bold uppercase tracking-tighter">
                                            Sector: {user.assignedSector.name}
                                        </span>
                                    )}
                                </div>
                                <RemoveDeskAdminButton userId={user.id} userName={user.name!} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Personnel Identity</th>
                            <th className="p-6">Connectivity Path</th>
                            <th className="p-6">Assigned Sector</th>
                            <th className="p-6">Authorization Level</th>
                            <th className="p-6 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-gray-600 italic">
                                    <div className="text-4xl mb-4 opacity-20">👥</div>
                                    No administrative units detected in current cluster...
                                </td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-white/[0.03] transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 font-bold group-hover:bg-purple-500 group-hover:text-white transition-all">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-purple-400 transition-colors">{user.name}</div>
                                                <div className="text-[10px] font-mono text-gray-600 uppercase">UID: {user.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-gray-400 font-medium">{user.email}</td>
                                    <td className="p-6">
                                        {user.assignedSector ? (
                                            <div className="flex items-center gap-2">
                                                <div className="w-2 h-2 rounded-full bg-purple-400/40" />
                                                <span className="text-white font-bold">{user.assignedSector.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-600 italic">Unassigned</span>
                                        )}
                                    </td>
                                    <td className="p-6">
                                        <span className="px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-[10px] font-black uppercase tracking-widest">
                                            DESK_ADMIN
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <RemoveDeskAdminButton userId={user.id} userName={user.name!} />
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
