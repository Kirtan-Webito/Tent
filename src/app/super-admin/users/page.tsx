export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import AddUserButton from '@/app/super-admin/users/add-user-button';
import EditEventAdminButton from '@/app/super-admin/users/edit-event-admin-button';
import { PersonIcon, LockClosedIcon } from '@radix-ui/react-icons';

async function getUsers() {
    return await prisma.user.findMany({
        where: {
            role: 'EVENT_ADMIN'
        },
        include: {
            assignedEvent: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

async function getEvents() {
    return await prisma.event.findMany({
        select: { id: true, name: true }
    });
}

export default async function UsersPage() {
    const users = await getUsers();
    const events = await getEvents();

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        Privileged Users
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Administrative authority management and event assignments.</p>
                </div>
                <AddUserButton events={events} />
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {users.length === 0 ? (
                    <div className="col-span-full py-20 bg-card rounded-[2rem] border-dashed border-2 border-muted text-center text-muted-foreground">
                        <PersonIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        No privileged users found.
                    </div>
                ) : (
                    users.map((user: any) => (
                        <div
                            key={user.id}
                            className="bg-card p-5 rounded-2xl border border-border shadow-sm"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl text-primary font-bold">
                                    {user.name?.[0] || user.email[0].toUpperCase()}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-foreground text-lg">{user.name}</h3>
                                    <div className="text-[10px] text-muted-foreground font-mono">{user.email}</div>
                                </div>
                            </div>

                            <div className="p-4 bg-secondary/50 rounded-xl border border-border mb-4">
                                <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">ASSIGNED_OPERATIONAL_NODE</div>
                                {user.assignedEvent ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                        <div className="text-xs font-bold text-foreground">{user.assignedEvent.name}</div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-muted-foreground italic">No node assignment</div>
                                )}
                            </div>

                            <div className="flex justify-end gap-3">
                                <EditEventAdminButton user={user} events={events} />
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                            <tr>
                                <th className="text-left p-6">Administrator</th>
                                <th className="text-left p-6">Access Role</th>
                                <th className="text-left p-6">Deployment Node</th>
                                <th className="text-right p-6">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-20 text-center text-muted-foreground italic">
                                        <LockClosedIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        No administrative entities found...
                                    </td>
                                </tr>
                            ) : (
                                users.map((user: any) => (
                                    <tr key={user.id} className="group hover:bg-secondary/30 transition-colors">
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                                    {user.name?.[0] || user.email[0].toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</div>
                                                    <div className="text-[10px] text-muted-foreground font-mono uppercase">UID: {user.id.slice(0, 8)}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <div className="inline-flex items-center px-2 py-1 rounded-lg bg-secondary border border-border text-[10px] font-bold text-foreground">
                                                {user.role}
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            {user.assignedEvent ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                    <span className="font-bold text-foreground text-xs">{user.assignedEvent.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-2 opacity-50">
                                                    <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                                                    <div className="text-xs text-muted-foreground italic">No node assignment</div>
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-6 text-right">
                                            <EditEventAdminButton user={user} events={events} />
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
