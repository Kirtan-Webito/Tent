'use client';

import { useState, useEffect, useRef } from 'react';
import { updateMember } from './actions';
import Modal from '@/components/ui/Modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import {
    PersonIcon,
    MobileIcon,
    CalendarIcon,
    InfoCircledIcon,
    Pencil1Icon,
    GroupIcon,
    CheckCircledIcon,
    ExitIcon
} from '@radix-ui/react-icons';

type Member = {
    id: string;
    name: string;
    age: number;
    gender: string;
};

type Guest = Member & {
    bookingId: string;
    bookingStatus: string;
    tentName: string;
    sectorName: string;
    checkIn: string | null;
    checkOut: string | null;
    mobile?: string;
    groupMembers: Member[];
};

export default function GuestsClient({ initialGuests, userRole }: { initialGuests: Guest[], userRole: string }) {
    const { showToast } = useToast();
    const [guests, setGuests] = useState(initialGuests);
    const [selectedGuest, setSelectedGuest] = useState<Guest | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState<{
        name: string;
        age: string;
        gender: string;
        mobile: string;
        notes: string;
        checkInDate: string;
        checkOutDate: string;
    }>({
        name: '',
        age: '',
        gender: '',
        mobile: '',
        notes: '',
        checkInDate: '',
        checkOutDate: ''
    });
    const [viewMode, setViewMode] = useState<'TEAM_LEADERS' | 'ALL'>('TEAM_LEADERS');
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        setGuests(initialGuests);
    }, [initialGuests]);

    const router = useRouter();
    const searchParams = useSearchParams();
    const highlightId = searchParams.get('highlight');
    const rowRefs = useRef<{ [key: string]: HTMLTableRowElement | null }>({});

    useEffect(() => {
        if (highlightId) {
            // Find guest with this booking ID
            const targetGuest = guests.find(g => g.bookingId === highlightId);
            if (targetGuest) {
                // Scroll to the first matching guest
                const element = document.getElementById(`guest-${targetGuest.id}`);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    element.classList.add('bg-primary/10', 'border-l-4', 'border-primary');
                    setTimeout(() => element.classList.remove('bg-primary/10', 'border-l-4', 'border-primary'), 3000);
                }
            }
        }
    }, [highlightId, guests]);

    const handleGuestClick = (guest: Guest) => {
        setSelectedGuest(guest);
        setIsEditing(false);
        setEditForm({
            name: guest.name,
            age: guest.age.toString(),
            gender: guest.gender,
            mobile: guest.mobile || '',
            notes: (guest as any).notes || '',
            checkInDate: guest.checkIn ? new Date(guest.checkIn).toISOString().split('T')[0] : '',
            checkOutDate: guest.checkOut ? new Date(guest.checkOut).toISOString().split('T')[0] : ''
        });
    };

    const handleSave = async () => {
        if (!selectedGuest) return;
        setLoading(true);
        try {
            const res = await updateMember(selectedGuest.id, {
                name: editForm.name,
                age: parseInt(editForm.age) || 0,
                gender: editForm.gender,
                mobile: editForm.mobile,
                notes: editForm.notes,
                checkInDate: editForm.checkInDate,
                checkOutDate: editForm.checkOutDate
            });

            if (res.success) {
                // Update local state to reflect changes immediately
                const updatedGuests = guests.map(g => {
                    if (g.id === selectedGuest.id) {
                        return { ...g, ...editForm, age: parseInt(editForm.age) || 0 };
                    }
                    // For group members, we update shared booking info (mobile) but members list needs care
                    // If shared booking, update mobile for all in that booking
                    if (g.bookingId === selectedGuest.bookingId) {
                        // Update this guest's view of mobile
                        g.mobile = editForm.mobile;
                    }

                    const updatedGroupMembers = g.groupMembers.map(m =>
                        m.id === selectedGuest.id ? { ...m, ...editForm, age: parseInt(editForm.age) || 0 } : m
                    );
                    return { ...g, groupMembers: updatedGroupMembers };
                });

                setGuests(updatedGuests);
                setSelectedGuest({ ...selectedGuest, ...editForm, age: parseInt(editForm.age) || 0 });
                setIsEditing(false);
                showToast('Guest details updated successfully', 'success');
                router.refresh(); // Refresh server data
            } else {
                showToast('Failed to update member', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('An error occurred', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleCheckout = async (bookingId: string) => {
        if (!confirm('Are you sure you want to check out this guest group?')) return;
        setLoading(true);
        try {
            const res = await fetch('/api/bookings/checkout', {
                method: 'POST',
                body: JSON.stringify({ bookingId }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                showToast('Guest checked out successfully', 'success');
                setGuests(guests.filter(g => g.bookingId !== bookingId));
                setSelectedGuest(null);
                router.refresh();
            } else {
                showToast('Failed to check out guest', 'error');
            }
        } catch (error) {
            console.error(error);
            showToast('Error during check-out', 'error');
        } finally {
            setLoading(false);
        }
    };

    // Filter logic based on search and view mode
    const filteredBySearch = guests.filter(guest => {
        const query = searchTerm.toLowerCase();
        return (
            guest.name.toLowerCase().includes(query) ||
            guest.mobile?.toLowerCase().includes(query) ||
            guest.tentName.toLowerCase().includes(query) ||
            guest.sectorName.toLowerCase().includes(query)
        );
    });

    const displayedGuests = viewMode === 'TEAM_LEADERS'
        ? filteredBySearch.filter((guest, index, self) =>
            index === self.findIndex((t) => t.bookingId === guest.bookingId)
        )
        : filteredBySearch;

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-primary to-orange-400 bg-clip-text text-transparent tracking-tight">
                        Guest Directory
                    </h1>
                    <p className="text-sm md:text-base text-muted-foreground mt-1 font-medium italic">Synchronized registry of all active event participants.</p>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    {/* Search Input */}
                    <div className="relative w-full sm:w-64">
                        <input
                            type="text"
                            placeholder="Search guests, mobile, tent..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-border text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                        />
                        <svg className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="bg-secondary/50 p-1 rounded-2xl border border-border flex gap-1">
                        <button
                            onClick={() => setViewMode('TEAM_LEADERS')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'TEAM_LEADERS'
                                ? 'bg-white text-primary shadow-sm ring-1 ring-border'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            Team Heads
                        </button>
                        <button
                            onClick={() => setViewMode('ALL')}
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${viewMode === 'ALL'
                                ? 'bg-white text-primary shadow-sm ring-1 ring-border'
                                : 'text-muted-foreground hover:text-foreground'
                                }`}
                        >
                            All Members
                        </button>
                    </div>

                    <div className="px-4 py-2 rounded-2xl bg-white border border-border text-xs font-bold text-muted-foreground uppercase tracking-widest shadow-sm">
                        {guests.length} Registered Guests
                    </div>
                </div>
            </div>

            {/* Mobile/Tablet Card Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
                {displayedGuests.length === 0 ? (
                    <div className="col-span-full p-12 bg-white rounded-3xl border-dashed border-border text-center text-muted-foreground shadow-sm">
                        No guests currently registered.
                    </div>
                ) : (
                    displayedGuests.map((guest, idx) => (
                        <div
                            key={guest.id || idx}
                            onClick={() => handleGuestClick(guest)}
                            className="bg-white p-5 rounded-2xl border border-border shadow-sm cursor-pointer hover:border-primary/50 transition-all"
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center">
                                    <PersonIcon className="w-6 h-6 text-primary" />
                                </div>
                                <div className="flex-1">
                                    <div className="font-bold text-foreground text-lg">{guest.name}</div>
                                    <div className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">{guest.age}Y • {guest.gender}</div>
                                </div>
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${(guest.bookingStatus === 'CONFIRMED' || guest.bookingStatus === 'CHECKED_IN')
                                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                    : 'bg-secondary text-muted-foreground border border-border'
                                    }`}>
                                    {(guest.bookingStatus === 'CONFIRMED' || guest.bookingStatus === 'CHECKED_IN') ? 'CHECKED IN' : guest.bookingStatus}
                                </span>
                            </div>

                            <div className="grid grid-cols-2 gap-4 p-4 bg-secondary/50 rounded-xl border border-border mb-4">
                                <div>
                                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">LOCATION</div>
                                    <div className="text-xs font-bold text-primary tracking-tight">{guest.tentName}</div>
                                    <div className="text-[10px] text-muted-foreground font-medium">{guest.sectorName}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1">STAY_PERIOD</div>
                                    <div className="text-[10px] font-medium text-foreground">
                                        {guest.checkIn ? new Date(guest.checkIn).toLocaleDateString('en-GB') : 'N/A'}
                                    </div>
                                    <div className="text-[10px] text-muted-foreground">to {guest.checkOut ? new Date(guest.checkOut).toLocaleDateString('en-GB') : 'End'}</div>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:block bg-white rounded-[2rem] overflow-hidden border border-border shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-secondary/50 text-muted-foreground text-[10px] font-black uppercase tracking-[0.2em] border-b border-border">
                            <tr>
                                <th className="p-6">Entity</th>
                                <th className="p-6">Demographics</th>
                                <th className="p-6">Contact</th>
                                <th className="p-6">Assignment</th>
                                <th className="p-6">Status</th>
                                <th className="p-6">Timeline</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {displayedGuests.map((guest, idx) => (
                                <tr
                                    key={guest.id || idx}
                                    id={`guest-${guest.id}`}
                                    onClick={() => userRole !== 'EVENT_ADMIN' && handleGuestClick(guest)}
                                    className={`transition-all group ${userRole === 'EVENT_ADMIN' ? 'cursor-default' : 'cursor-pointer'} ${highlightId && guest.bookingId === highlightId ? 'bg-primary/5 ring-1 ring-primary/20' : 'hover:bg-secondary/30'
                                        }`}
                                >
                                    <td className="p-6">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 flex items-center justify-center font-bold text-primary transition-all">
                                                {guest.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <div className="font-bold text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">{guest.name}</div>
                                                {guest.groupMembers.length > 1 && (
                                                    <div className="text-[10px] text-muted-foreground font-medium">+ {guest.groupMembers.length - 1} others</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-6 text-muted-foreground text-sm font-medium">
                                        {guest.age} years / {guest.gender}
                                    </td>
                                    <td className="p-6 text-sm font-mono text-muted-foreground/80">
                                        {guest.mobile || 'N/A'}
                                    </td>
                                    <td className="p-6">
                                        <div className="text-primary text-base font-black tracking-tighter">{guest.tentName}</div>
                                        <div className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">{guest.sectorName}</div>
                                    </td>
                                    <td className="p-6">
                                        <div className="flex flex-col items-start gap-1">
                                            <span className={`px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase ${(guest.bookingStatus === 'CONFIRMED' || guest.bookingStatus === 'CHECKED_IN')
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                                                : 'bg-secondary text-muted-foreground border border-border'
                                                }`}>
                                                {(guest.bookingStatus === 'CONFIRMED' || guest.bookingStatus === 'CHECKED_IN') ? 'CHECKED IN' : 'CHECKED OUT'}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="p-6 text-xs text-muted-foreground font-medium">
                                        <div className="flex items-center gap-2">
                                            <span>{guest.checkIn ? new Date(guest.checkIn).toLocaleDateString('en-GB') : 'N/A'}</span>
                                            <span className="opacity-30">→</span>
                                            <span className={guest.checkOut ? "" : "text-emerald-600"}>
                                                {guest.checkOut ? new Date(guest.checkOut).toLocaleDateString('en-GB') : 'STAY_ACTIVE'}
                                            </span>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {displayedGuests.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="p-20 text-center text-muted-foreground italic">
                                        <div className="flex justify-center mb-4 opacity-20">
                                            <PersonIcon className="w-12 h-12" />
                                        </div>
                                        Awaiting guest synchronization...
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Details Modal */}
            <Modal
                isOpen={!!selectedGuest}
                onClose={() => setSelectedGuest(null)}
                title={isEditing ? "Edit Guest Details" : "Guest Full Details"}
                actions={
                    <>
                        {isEditing ? (
                            <>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={loading}
                                    className="btn-primary"
                                >
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    onClick={() => setSelectedGuest(null)}
                                    className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition"
                                >
                                    Close
                                </button>
                                {userRole !== 'EVENT_ADMIN' && selectedGuest && (
                                    <>
                                        <button
                                            onClick={() => handleCheckout(selectedGuest.bookingId)}
                                            className="px-4 py-2 rounded-xl text-sm font-bold text-red-600 hover:bg-red-50 transition border border-red-100 flex items-center gap-2"
                                            disabled={loading}
                                        >
                                            <ExitIcon className="w-4 h-4" />
                                            Check Out
                                        </button>
                                        <button
                                            onClick={() => setIsEditing(true)}
                                            className="btn-primary"
                                            disabled={loading}
                                        >
                                            Edit Details
                                        </button>
                                    </>
                                )}
                            </>
                        )}
                    </>
                }
            >
                {selectedGuest && (
                    <div className="space-y-6">
                        {isEditing ? (
                            <div className="grid gap-4">
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Full Name</label>
                                    <input
                                        className="input-primary w-full"
                                        value={editForm.name}
                                        onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                        placeholder="Full Name"
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Age</label>
                                        <input
                                            type="number"
                                            className="input-primary w-full"
                                            value={editForm.age}
                                            onChange={(e) => setEditForm({ ...editForm, age: e.target.value })}
                                            placeholder="Age"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Gender</label>
                                        <select
                                            className="input-primary w-full"
                                            value={editForm.gender}
                                            onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                                        >
                                            <option value="MALE">MALE</option>
                                            <option value="FEMALE">FEMALE</option>
                                            <option value="OTHER">OTHER</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Booking Mobile Number (Shared)</label>
                                    <input
                                        type="tel"
                                        className="input-primary w-full"
                                        value={editForm.mobile}
                                        onChange={(e) => setEditForm({ ...editForm, mobile: e.target.value })}
                                        placeholder="Mobile Number"
                                    />
                                    <p className="text-[10px] text-orange-400 mt-1 pl-1 flex items-center gap-1">
                                        <InfoCircledIcon className="w-3 h-3" />
                                        Updating this changes the contact for the entire group.
                                    </p>
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Notes</label>
                                    <textarea
                                        className="input-primary w-full min-h-[80px]"
                                        value={editForm.notes}
                                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                                        placeholder="Group notes..."
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Check-In</label>
                                        <input
                                            type="date"
                                            className="input-primary w-full"
                                            value={editForm.checkInDate}
                                            onChange={(e) => setEditForm({ ...editForm, checkInDate: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Check-Out</label>
                                        <input
                                            type="date"
                                            className="input-primary w-full"
                                            value={editForm.checkOutDate}
                                            onChange={(e) => setEditForm({ ...editForm, checkOutDate: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6">
                                {/* Profile Header */}
                                <div className="flex items-center gap-4 p-4 bg-secondary/30 rounded-2xl border border-border">
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-orange-400/20 text-primary border border-primary/20 flex items-center justify-center text-3xl font-bold">
                                        {selectedGuest.name.charAt(0)}
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-foreground">{selectedGuest.name}</h3>
                                        <div className="text-sm text-muted-foreground font-medium flex gap-2 items-center">
                                            <span>{selectedGuest.age} Years</span>
                                            <span className="w-1 h-1 rounded-full bg-muted-foreground/30" />
                                            <span>{selectedGuest.gender}</span>
                                        </div>
                                        {selectedGuest.mobile && (
                                            <div className="text-xs font-mono text-primary mt-1 flex items-center gap-1.5">
                                                <MobileIcon className="w-3.5 h-3.5" />
                                                {selectedGuest.mobile}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Booking Info */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 bg-secondary/10 rounded-xl border border-border">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Accommodation</div>
                                        <div className="font-bold text-primary">{selectedGuest.tentName}</div>
                                        <div className="text-xs text-muted-foreground">{selectedGuest.sectorName}</div>
                                    </div>
                                    <div className="p-4 bg-secondary/10 rounded-xl border border-border">
                                        <div className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Status</div>
                                        <div className="font-bold text-foreground">{selectedGuest.bookingStatus}</div>
                                        <div className="text-xs text-muted-foreground">
                                            {selectedGuest.checkIn ? new Date(selectedGuest.checkIn).toLocaleDateString() : 'N/A'} - {selectedGuest.checkOut ? new Date(selectedGuest.checkOut).toLocaleDateString() : 'Active'}
                                        </div>
                                    </div>
                                </div>

                                {/* Group Members */}
                                {selectedGuest.groupMembers.length > 0 && (
                                    <div>
                                        <h4 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3 pl-1">Group Members ({selectedGuest.groupMembers.length})</h4>
                                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scrollbar">
                                            {selectedGuest.groupMembers.map(member => (
                                                <div
                                                    key={member.id}
                                                    className={`p-3 rounded-xl border flex justify-between items-center ${member.id === selectedGuest.id
                                                        ? 'bg-primary/5 border-primary/20'
                                                        : 'bg-white border-border'
                                                        }`}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center text-xs font-bold text-muted-foreground">
                                                            {member.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="text-sm font-bold text-foreground flex items-center gap-2">
                                                                {member.name}
                                                                {member.id === selectedGuest.id && <span className="text-[9px] bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-1">YOU</span>}
                                                            </div>
                                                            <div className="text-[10px] text-muted-foreground">{member.age}Y • {member.gender}</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </Modal>
        </div>
    );
}
