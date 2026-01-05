'use client';

import { useState } from 'react';
import { PersonIcon, LockClosedIcon } from '@radix-ui/react-icons';
import clsx from 'clsx';
import UserOperations from '@/app/super-admin/users/user-operations';
import AddUserButton from '@/app/super-admin/users/add-user-button';
import Modal from '@/components/ui/Modal'; // Import Modal

// Types (mirrored from Prisma/Server logic to ensure type safety)
// Types (mirrored from Prisma/Server logic to ensure type safety)
interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    assignedEventId: string | null;
    assignedEvent?: { id: string; name: string } | null;
    assignedSectors: { id: string; name: string }[];
}

interface Event {
    id: string;
    name: string;
}

interface Guest {
    id: string;
    name: string;
    age: number;
    gender: string;
    contact: string | null;
    createdAt: Date;
    booking: {
        tent: {
            name: string;
            sector: {
                name: string;
            }
        };
        status: string;
        checkInDate: Date | null;
        mobile: string | null; // Added mobile
        members: {            // Added members list
            id: string;
            name: string;
            age: number;
            gender: string;
        }[];
    };
}

interface UsersClientProps {
    initialUsers: User[];
    events: Event[];
    guests: Guest[];
}

export default function UsersClient({ initialUsers, events, guests }: UsersClientProps) {
    const [activeTab, setActiveTab] = useState('ALL');
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null); // State for selected guest

    // Filter Users in Memory
    const filteredUsers = initialUsers.filter(user => {
        if (activeTab === 'ALL') return true;
        if (activeTab === 'GUESTS') return false;
        return user.role === activeTab;
    });

    // Counts Calculation
    const getCount = (role: string) => {
        if (role === 'ALL') return initialUsers.length;
        if (role === 'GUESTS') return guests.length;
        return initialUsers.filter(u => u.role === role).length;
    };

    const tabs = [
        { id: 'ALL', label: 'All Users' },
        { id: 'EVENT_ADMIN', label: 'Event Admins' },
        { id: 'DESK_ADMIN', label: 'Desk Admins' },
        { id: 'GUESTS', label: 'Guests' },
    ];

    // Helper function to get role badge styling
    function getRoleBadge(role: string) {
        const badges: Record<string, { bg: string; text: string; border: string; label: string }> = {
            EVENT_ADMIN: { bg: 'bg-orange-100', text: 'text-orange-700', border: 'border-orange-200', label: 'EVENT ADMIN' },
            DESK_ADMIN: { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200', label: 'DESK ADMIN' },
            PUBLIC: { bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-200', label: 'PUBLIC USER' }
        };
        return badges[role] || { bg: 'bg-secondary', text: 'text-foreground', border: 'border-border', label: role };
    }

    return (
        <div className="space-y-8 animate-in fade-in duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        System Users
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">All registered users and their access permissions.</p>
                </div>
                {activeTab !== 'GUESTS' && <AddUserButton events={events} />}
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-border/50">
                {tabs.map(tab => {
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={clsx(
                                "flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                                isActive
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-secondary/50 text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            {tab.label}
                            <span className={clsx(
                                "px-1.5 py-0.5 rounded-full text-[9px]",
                                isActive ? "bg-white/20 text-white" : "bg-black/5 text-muted-foreground"
                            )}>
                                {getCount(tab.id)}
                            </span>
                        </button>
                    );
                })}
            </div>

            {/* Content Logic */}
            {activeTab === 'GUESTS' ? (
                <div className="bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                                <tr>
                                    <th className="text-left p-6">Guest Name</th>
                                    <th className="text-left p-6">Tent Assignment</th>
                                    <th className="text-left p-6">Status</th>
                                    <th className="text-right p-6">Check-in Info</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                {guests.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="p-20 text-center text-muted-foreground italic">
                                            No guests found...
                                        </td>
                                    </tr>
                                ) : (
                                    guests.map((guest) => (
                                        <tr
                                            key={guest.id}
                                            onClick={() => setSelectedGuest(guest)}
                                            className="group hover:bg-secondary/30 transition-colors cursor-pointer"
                                        >
                                            <td className="p-6">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center text-orange-700 font-bold">
                                                        {guest.name[0]}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-foreground">{guest.name}</div>
                                                        <div className="text-[10px] text-muted-foreground font-mono">{guest.age} years • {guest.gender}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground text-sm">{guest.booking.tent.name}</span>
                                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest">{guest.booking.tent.sector.name}</span>
                                                </div>
                                            </td>
                                            <td className="p-6">
                                                <span className={clsx(
                                                    "px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest border",
                                                    guest.booking.status === 'CONFIRMED'
                                                        ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                                                        : "bg-red-100 text-red-700 border-red-200"
                                                )}>
                                                    {guest.booking.status}
                                                </span>
                                            </td>
                                            <td className="p-6 text-right">
                                                <div className="text-xs font-medium text-foreground">
                                                    {guest.booking.checkInDate ? new Date(guest.booking.checkInDate).toLocaleDateString() : '-'}
                                                </div>
                                                <div className="text-[10px] text-muted-foreground">
                                                    Registered: {new Date(guest.createdAt).toLocaleDateString()}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <>
                    {/* Mobile/Tablet Card Layout */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                        {filteredUsers.length === 0 ? (
                            <div className="col-span-full py-20 bg-card rounded-[2rem] border-dashed border-2 border-muted text-center text-muted-foreground">
                                <PersonIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                No users found in this category.
                            </div>
                        ) : (
                            filteredUsers.map((user) => {
                                const roleBadge = getRoleBadge(user.role);
                                return (
                                    <div
                                        key={user.id}
                                        className="bg-card p-5 rounded-2xl border border-border shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    >
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-xl text-primary font-bold">
                                                {user.name?.[0] || user.email[0].toUpperCase()}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-foreground text-lg">{user.name}</h3>
                                                <div className="text-[10px] text-muted-foreground font-mono">{user.email}</div>
                                            </div>
                                            <span className={`px-2 py-1 rounded-lg ${roleBadge.bg} ${roleBadge.text} border ${roleBadge.border} text-[8px] font-black uppercase tracking-widest`}>
                                                {roleBadge.label}
                                            </span>
                                        </div>

                                        <div className="p-4 bg-secondary/50 rounded-xl border border-border mb-4">
                                            <div className="text-[8px] font-black text-muted-foreground uppercase tracking-widest mb-1">
                                                {user.role === 'DESK_ADMIN' ? 'ASSIGNED SECTORS' : 'ASSIGNED EVENT'}
                                            </div>
                                            {user.role === 'DESK_ADMIN' ? (
                                                user.assignedSectors.length > 0 ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {user.assignedSectors.map((sector) => (
                                                            <span key={sector.id} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded">
                                                                {sector.name}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-muted-foreground italic">No sectors assigned</div>
                                                )
                                            ) : user.assignedEvent ? (
                                                <div className="flex items-center gap-2">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                                    <div className="text-xs font-bold text-foreground">{user.assignedEvent.name}</div>
                                                </div>
                                            ) : (
                                                <div className="text-xs text-muted-foreground italic">No assignment</div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-border/50">
                                            <UserOperations user={user} events={events} />
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Desktop Table Layout */}
                    <div className="hidden lg:block bg-white rounded-[2rem] border border-border shadow-sm overflow-hidden min-h-[400px]">
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-secondary/50 border-b border-border text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em]">
                                    <tr>
                                        <th className="text-left p-6">User</th>
                                        <th className="text-left p-6">Access Role</th>
                                        <th className="text-left p-6">Assignment</th>
                                        <th className="text-right p-6">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-border">
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={4} className="p-20 text-center text-muted-foreground italic">
                                                <LockClosedIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                                No users found in this category...
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((user) => {
                                            const roleBadge = getRoleBadge(user.role);
                                            return (
                                                <tr key={user.id} className="group hover:bg-secondary/30 transition-colors animate-in fade-in duration-300">
                                                    <td className="p-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold group-hover:bg-primary group-hover:text-white transition-all">
                                                                {user.name?.[0] || user.email[0].toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <div className="font-bold text-foreground group-hover:text-primary transition-colors">{user.name}</div>
                                                                <div className="text-[10px] text-muted-foreground font-mono">{user.email}</div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="p-6">
                                                        <span className={`inline-flex items-center px-3 py-1 rounded-lg ${roleBadge.bg} ${roleBadge.text} border ${roleBadge.border} text-[10px] font-black uppercase tracking-widest`}>
                                                            {roleBadge.label}
                                                        </span>
                                                    </td>
                                                    <td className="p-6">
                                                        {user.role === 'DESK_ADMIN' ? (
                                                            user.assignedSectors.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1">
                                                                    {user.assignedSectors.map((sector) => (
                                                                        <span key={sector.id} className="px-2 py-1 bg-blue-100 text-blue-700 border border-blue-200 text-[10px] font-bold rounded-lg">
                                                                            {sector.name}
                                                                        </span>
                                                                    ))}
                                                                </div>
                                                            ) : (
                                                                <div className="text-xs text-muted-foreground italic">No sectors assigned</div>
                                                            )
                                                        ) : user.assignedEvent ? (
                                                            <div className="flex items-center gap-2">
                                                                <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                                                                <span className="font-bold text-foreground text-xs">{user.assignedEvent.name}</span>
                                                            </div>
                                                        ) : (
                                                            <div className="flex items-center gap-2 opacity-50">
                                                                <div className="w-2 h-2 rounded-full bg-muted-foreground"></div>
                                                                <div className="text-xs text-muted-foreground italic">No assignment</div>
                                                            </div>
                                                        )}
                                                    </td>
                                                    <td className="p-6 text-right">
                                                        <UserOperations user={user} events={events} />
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            )}

            {/* Guest Details Modal */}
            <Modal
                isOpen={!!selectedGuest}
                onClose={() => setSelectedGuest(null)}
                title={selectedGuest ? `Guest: ${selectedGuest.name}` : 'Guest Details'}
                maxWidth="max-w-2xl"
                actions={
                    <button
                        onClick={() => setSelectedGuest(null)}
                        className="w-full px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl transition border border-border shadow-sm active:scale-95"
                    >
                        Close
                    </button>
                }
            >
                {selectedGuest && (
                    <div className="space-y-6">
                        {/* Status Header */}
                        <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex items-center justify-between gap-4">
                            <div>
                                <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">{selectedGuest.name}</h3>
                                <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{selectedGuest.booking.tent.name} • {selectedGuest.booking.tent.sector.name}</p>
                            </div>
                            <div className={clsx(
                                "px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest shadow-sm border",
                                selectedGuest.booking.status === 'CONFIRMED'
                                    ? "bg-emerald-500 text-white border-emerald-600"
                                    : "bg-orange-500 text-white border-orange-600"
                            )}>
                                {selectedGuest.booking.status}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Mobile Number</p>
                                <p className="text-lg font-bold text-foreground">{selectedGuest.booking.mobile || 'N/A'}</p>
                            </div>
                            <div className="bg-secondary/30 rounded-xl p-4 border border-border">
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Check-in Date</p>
                                <p className="text-lg font-bold text-foreground">
                                    {selectedGuest.booking.checkInDate ? new Date(selectedGuest.booking.checkInDate).toLocaleDateString() : 'Pending'}
                                </p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em]">Family Members</h4>
                            <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar pr-1">
                                {selectedGuest.booking.members.map((member) => (
                                    <div key={member.id} className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl shadow-sm hover:border-primary/30 transition-colors">
                                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                                            {member.name.charAt(0)}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-bold text-foreground text-sm truncate">{member.name}</p>
                                            <p className="text-[10px] text-muted-foreground uppercase font-medium">
                                                {member.age} Y • {member.gender}
                                            </p>
                                        </div>
                                        {member.name === selectedGuest.booking.mobile ? (
                                            <span className="text-[8px] bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-black uppercase">Booker</span>
                                        ) : null}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
