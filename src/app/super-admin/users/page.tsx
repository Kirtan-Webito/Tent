import { prisma } from '@/lib/prisma';
import AddUserButton from '@/app/super-admin/users/add-user-button';
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
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-300 bg-clip-text text-transparent tracking-tight">
                        Event Admin Hub
                    </h1>
                    <p className="text-sm md:text-base text-gray-400 mt-1 font-medium italic">Administrative authority management and event assignments.</p>
                </div>
                <AddUserButton events={events} />
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {users.length === 0 ? (
                    <div className="col-span-full py-20 glass rounded-[2rem] border-dashed border-white/10 text-center text-gray-500">
                        <PersonIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                        No event admins found in the registry.
                    </div>
                ) : (
                    users.map((user: any) => (
                        <div
                            key={user.id}
                            className="glass p-5 rounded-2xl border-white/5 bg-gradient-to-br from-white/[0.05] to-transparent shadow-xl"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-xl text-cyan-400 font-bold">
                                    {user.name.charAt(0)}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-white text-lg">{user.name}</h3>
                                    <div className="text-[10px] text-gray-500 font-mono">{user.email}</div>
                                </div>
                            </div>

                            <div className="p-4 bg-black/20 rounded-xl border border-white/5 mb-4">
                                <div className="text-[8px] font-black text-gray-500 uppercase tracking-widest mb-1">ASSIGNED_OPERATIONAL_NODE</div>
                                {user.assignedEvent ? (
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                                        <div className="text-xs font-bold text-cyan-400">{user.assignedEvent.name}</div>
                                    </div>
                                ) : (
                                    <div className="text-xs text-gray-600 italic">No node assignment</div>
                                )}
                            </div>

                            <div className="flex justify-end">
                                <button className="px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest bg-red-500/10 hover:bg-red-500/20 text-red-400 transition-all active:scale-95">
                                    Deactivate
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block glass rounded-[2rem] overflow-hidden border border-white/5 shadow-2xl">
                <table className="w-full text-left text-sm">
                    <thead className="bg-white/5 border-b border-white/10 text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">
                        <tr>
                            <th className="p-6">Administrator Identity</th>
                            <th className="p-6">Connectivity Path</th>
                            <th className="p-6">Deployment Node</th>
                            <th className="p-6 text-right">System Access</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="p-20 text-center text-gray-600 italic">
                                    <LockClosedIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                    No administrative entities found in current sector...
                                </td>
                            </tr>
                        ) : (
                            users.map((user: any) => (
                                <tr key={user.id} className="hover:bg-white/[0.03] transition-all group">
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 font-bold group-hover:bg-cyan-500 group-hover:text-white transition-all">
                                                {user.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-white group-hover:text-cyan-400 transition-colors">{user.name}</div>
                                                <div className="text-[10px] font-mono text-gray-600 uppercase">UID: {user.id.slice(0, 8)}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-gray-400 font-medium">{user.email}</td>
                                    <td className="p-6">
                                        {user.assignedEvent ? (
                                            <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest">
                                                {user.assignedEvent.name}
                                            </span>
                                        ) : (
                                            <span className="text-gray-600 italic text-[10px] font-bold uppercase tracking-widest">UNASSIGNED_NODE</span>
                                        )}
                                    </td>
                                    <td className="p-6 text-right">
                                        <button className="text-red-400 hover:text-red-300 font-black text-[10px] uppercase tracking-widest transition-colors">Deactivate</button>
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
