export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { PersonIcon, GroupIcon } from '@radix-ui/react-icons';
import AddUserButton from '@/app/super-admin/users/add-user-button'; // Reuse? Need slight mod or new component

import AddDeskAdminButton from '@/app/event-admin/team/add-desk-admin-button';
import RemoveDeskAdminButton from '@/app/event-admin/team/remove-desk-admin-button';
import EditDeskAdminButton from '@/app/event-admin/team/edit-desk-admin-button';

async function getTeamMembers(eventId: string) {
    return await prisma.user.findMany({
        where: {
            role: { in: ['DESK_ADMIN', 'TEAM_HEAD'] },
            assignedEventId: eventId
        },
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            assignedSectors: {
                select: { id: true, name: true }
            }
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
    const users = await getTeamMembers(eventId);
    const sectors = await getSectors(eventId);

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        Desk Operations Team
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Management of on-ground personnel and desk administration rights.</p>
                </div>
                <AddDeskAdminButton eventId={eventId} sectors={sectors} />
            </div>

            {/* Mobile/Tablet Card View */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {users.length === 0 ? (
                    <div className="col-span-full py-20 bg-card rounded-[2rem] border-dashed border-2 border-muted text-center text-muted-foreground">
                        <div className="flex justify-center mb-4 opacity-30">
                            <PersonIcon className="w-12 h-12" />
                        </div>
                        No desk operators assigned to this sector.
                    </div>
                ) : (
                    users.map((user: any) => (
                        <div
                            key={user.id}
                            className="bg-card p-5 rounded-2xl border border-border shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-xl text-primary font-bold">
                                    {user.name?.charAt(0) || 'U'}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-foreground text-lg">{user.name}</h3>
                                    <div className="text-[10px] text-muted-foreground font-mono">{user.email}</div>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-border">
                                <div className="flex flex-col gap-1 items-end">
                                    <span className={`px-2 py-0.5 rounded-full text-[8px] font-black uppercase tracking-widest border ${user.role === 'TEAM_HEAD'
                                        ? 'bg-orange-50 text-orange-600 border-orange-100'
                                        : 'bg-blue-50 text-blue-600 border-blue-100'
                                        }`}>
                                        {user.role.replace('_', ' ')}
                                    </span>
                                    {user.assignedSectors && user.assignedSectors.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1 justify-end">
                                            {user.assignedSectors.map((s: any) => (
                                                <span key={s.id} className="text-[8px] text-muted-foreground font-bold uppercase tracking-tighter bg-secondary px-1.5 py-0.5 rounded border border-border">
                                                    {s.name}
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    <EditDeskAdminButton user={user} allSectors={sectors} />
                                    <RemoveDeskAdminButton userId={user.id} userName={user.name!} />
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table View */}
            <div className="hidden lg:block bg-white rounded-[2rem] overflow-hidden border border-border shadow-sm">
                <table className="w-full text-left text-sm">
                    <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Personnel Identity</th>
                            <th className="p-6">Connectivity Path</th>
                            <th className="p-6">Assigned Sector</th>
                            <th className="p-6">Authorization Level</th>
                            <th className="p-6 text-right">Operations</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="p-20 text-center text-muted-foreground italic">
                                    <div className="flex justify-center mb-4 opacity-30">
                                        <GroupIcon className="w-12 h-12" />
                                    </div>
                                    No administrative units detected in current cluster...
                                </td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-secondary/30 transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                                {user.name?.charAt(0) || 'U'}
                                            </div>
                                            <div>
                                                <div className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</div>
                                                <div className="text-[10px] font-mono text-muted-foreground uppercase">UID: {user.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-muted-foreground font-medium">{user.email}</td>
                                    <td className="p-6">
                                        <div className="flex flex-wrap gap-2">
                                            {user.assignedSectors && user.assignedSectors.length > 0 ? (
                                                user.assignedSectors.map((s: any) => (
                                                    <div key={s.id} className="flex items-center gap-2 bg-secondary px-2 py-1 rounded-lg border border-border">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400" />
                                                        <span className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{s.name}</span>
                                                    </div>
                                                ))
                                            ) : (
                                                <span className="text-muted-foreground italic">Unassigned</span>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${user.role === 'TEAM_HEAD'
                                            ? 'bg-orange-50 text-orange-600 border-orange-100'
                                            : 'bg-blue-50 text-blue-600 border-blue-100'
                                            }`}>
                                            {user.role.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="p-6 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <EditDeskAdminButton user={user} allSectors={sectors} />
                                            <RemoveDeskAdminButton userId={user.id} userName={user.name!} />
                                        </div>
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
