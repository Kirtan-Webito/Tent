'use client';

import { useState, useEffect } from 'react';
import { prisma } from '@/lib/prisma';
import {
    PlusIcon,
    TrashIcon,
    CheckIcon,
    ExclamationTriangleIcon,
    PersonIcon,
    TimerIcon,
    ExitIcon,
    Pencil1Icon,
    CalendarIcon,
    CubeIcon
} from '@radix-ui/react-icons';
import Modal from '@/components/ui/Modal';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/providers/ToastProvider';
import { updateMember } from '../guests/actions';
import Tooltip from '@/components/ui/Tooltip';

type Member = {
    id: string;
    name: string;
    age: number;
    gender: string;
};

type Booking = {
    id: string;
    checkInDate: string | null;
    checkOutDate: string | null;
    mobile: string | null;
    notes: string | null;
    status: string;
    members: Member[];
};

type Tent = {
    id: string;
    name: string;
    capacity: number;
    occupied: number;
    bookings: Booking[];
};

type Sector = {
    id: string;
    name: string;
    tents: Tent[];
};

function StatsCard({ label, value, subtext, className = "" }: { label: string, value: string | number, subtext: string, className?: string }) {
    return (
        <div className={`bg-white p-6 rounded-3xl border border-border shadow-sm flex flex-col justify-between h-32 transition-all ${className}`}>
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em]">{label}</span>
            <div>
                <div className="text-3xl font-black text-foreground tracking-tighter">{value}</div>
                <div className="text-[10px] font-bold text-muted-foreground mt-1 uppercase tracking-widest">{subtext}</div>
            </div>
        </div>
    );
}

export default function BookingInterface({ initialSectors }: { initialSectors: Sector[] }) {
    const router = useRouter();
    const { showToast } = useToast();
    const searchParams = useSearchParams();
    const [selectedSectorId, setSelectedSectorId] = useState(searchParams.get('sector') || initialSectors[0]?.id || '');
    const [selectedTentId, setSelectedTentId] = useState(searchParams.get('tent') || '');

    const [members, setMembers] = useState([{ name: '', age: '', gender: 'MALE' }]);
    const [mobile, setMobile] = useState('');
    const [notes, setNotes] = useState('');
    const [checkInDate, setCheckInDate] = useState(new Date().toISOString().split('T')[0]);
    const [checkOutDate, setCheckOutDate] = useState('');

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<any>({});
    const [editingMember, setEditingMember] = useState<{
        id: string;
        name: string;
        age: number;
        gender: string;
        mobile?: string;
        notes?: string;
        checkInDate?: string;
        checkOutDate?: string;
    } | null>(null);

    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        title: string;
        message?: string;
        type?: 'confirm' | 'alert' | 'input';
        onConfirm?: (value?: any) => void;
    }>({ isOpen: false, title: '' });

    const selectedSector = initialSectors.find(s => s.id === selectedSectorId);
    const selectedTent = selectedSector?.tents.find(t => t.id === selectedTentId);

    const totalBookings = initialSectors.reduce((acc, s) => acc + s.tents.reduce((ta, t) => ta + t.bookings.length, 0), 0);
    const totalCapacity = initialSectors.reduce((acc, s) => acc + s.tents.reduce((ta, t) => ta + t.capacity, 0), 0);
    const totalOccupancy = initialSectors.reduce((acc, s) => acc + s.tents.reduce((ta, t) => ta + t.occupied, 0), 0);

    const addMemberRow = () => setMembers([...members, { name: '', age: '', gender: 'MALE' }]);
    const removeMemberRow = (idx: number) => setMembers(members.filter((_, i) => i !== idx));
    const updateMemberField = (idx: number, field: string, value: string) => {
        const newMembers = [...members];
        (newMembers[idx] as any)[field] = value;
        setMembers(newMembers);
    };

    const handleMemberKeyPress = (e: React.KeyboardEvent, idx: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (idx === members.length - 1) {
                addMemberRow();
            }
        }
    };

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });
    // showAlert is kept for Modal-based Confirmations, but simple alerts use Toast
    const showAlert = (title: string, message: string) => showToast(message, title.toLowerCase() === 'error' ? 'error' : 'success');

    const validate = () => {
        const newErrors: any = { members: [] };
        let hasError = false;

        if (!mobile || !/^\d{10}$/.test(mobile)) {
            newErrors.mobile = "Valid 10-digit mobile number required";
            hasError = true;
        }

        members.forEach((m, i) => {
            const memberError: any = {};
            if (!m.name.trim()) {
                memberError.name = "Name required";
                hasError = true;
            }
            if (!m.age || parseInt(m.age) <= 0) {
                memberError.age = "Invalid age";
                hasError = true;
            }
            newErrors.members[i] = memberError;
        });

        setErrors(newErrors);
        return !hasError;
    };

    const handleSubmit = async () => {
        if (!validate()) return;
        if (!selectedTentId) return showAlert("Selection Required", "Please select a tent first.");

        // Check Capacity Override
        const currentOccupancy = selectedTent?.occupied || 0;
        const capacity = selectedTent?.capacity || 0;
        const newTotal = currentOccupancy + members.length;

        if (newTotal > capacity) {
            setModalConfig({
                isOpen: true,
                title: "Capacity Warning",
                message: `Tent ${selectedTent?.name} capacity is ${capacity}. This booking will overfill it to ${newTotal}. Do you want to proceed?`,
                type: 'confirm',
                onConfirm: () => performSubmit()
            });
        } else {
            performSubmit();
        }
    };

    const performSubmit = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/bookings', {
                method: 'POST',
                body: JSON.stringify({
                    tentId: selectedTentId,
                    mobile,
                    notes,
                    checkInDate,
                    checkOutDate,
                    members: members.map(m => ({ ...m, age: parseInt(m.age) }))
                }),
                headers: { 'Content-Type': 'application/json' }
            });

            if (res.ok) {
                router.refresh();
                setMembers([{ name: '', age: '', gender: 'MALE' }]);
                setMobile('');
                setNotes('');
                showAlert("Success", "Booking created successfully!");
            } else {
                const data = await res.json();
                showAlert("Error", data.error || "Failed to create booking");
            }
        } catch (e) {
            console.error(e);
            showAlert("Error", "A network error occurred");
        } finally {
            setLoading(false);
            closeModal();
        }
    };

    const handleCheckout = (bookingId: string) => {
        setModalConfig({
            isOpen: true,
            title: "Check Out Confirmation",
            message: "Are you sure you want to check out this booking?",
            type: 'confirm',
            onConfirm: async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/bookings/checkout', {
                        method: 'POST',
                        body: JSON.stringify({ bookingId }),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (res.ok) {
                        router.refresh();
                        closeModal();
                        showToast('Guest checked out successfully', 'success');
                    } else {
                        showAlert('Error', 'Check-out failed');
                    }
                } catch (e) {
                    console.error(e);
                    showAlert('Error', 'Error checking out');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleExtend = (bookingId: string) => {
        setModalConfig({
            isOpen: true,
            title: "Extend Stay",
            message: "Select the new check-out date:",
            type: 'input',
            onConfirm: async (newDate) => {
                setLoading(true);
                try {
                    const res = await fetch('/api/bookings/extend', {
                        method: 'POST',
                        body: JSON.stringify({ bookingId, newCheckOutDate: newDate }),
                        headers: { 'Content-Type': 'application/json' }
                    });
                    if (res.ok) {
                        router.refresh();
                        closeModal();
                        showToast('Stay extended successfully', 'success');
                    } else {
                        showAlert('Error', 'Extension failed');
                    }
                } catch (e) {
                    console.error(e);
                    showAlert('Error', 'Error extending booking');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const handleAutoCheckout = async () => {
        setModalConfig({
            isOpen: true,
            title: "Notify Overdue Bookings",
            message: "This will scan for all guests whose stay has ended and send a notification to process their check-out manually. Continue?",
            type: 'confirm',
            onConfirm: async () => {
                setLoading(true);
                try {
                    const res = await fetch('/api/bookings/auto-cleanup', { method: 'POST' });
                    if (res.ok) {
                        const data = await res.json();
                        showAlert('Success', `Scan complete. ${data.count} notifications sent.`);
                        router.refresh();
                    } else {
                        showAlert('Error', 'Auto-checkout failed');
                    }
                } catch (e) {
                    console.error(e);
                    showAlert('Error', 'An error occurred during auto-checkout');
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Quick Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                <StatsCard label="Total Bookings" value={totalBookings} subtext="Active bookings" />
                <StatsCard label="Occupancy Rate" value={`${Math.round((totalOccupancy / totalCapacity) * 100) || 0}%`} subtext={`${totalOccupancy} / ${totalCapacity} spots filled`} />
                <div onClick={handleAutoCheckout} className="cursor-pointer group sm:col-span-2 lg:col-span-1">
                    <StatsCard label="Quick Actions" value="Notify Expired" subtext="Tap to notify >" className="hover:bg-secondary/50 border-border group-hover:border-primary/30 transition-all" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Panel: Navigation & Tent Selection */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Sector List */}
                    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-4">Select Sector</h3>
                        <div className="space-y-2">
                            {initialSectors.map(sector => (
                                <button
                                    key={sector.id}
                                    onClick={() => { setSelectedSectorId(sector.id); setSelectedTentId(''); }}
                                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex justify-between items-center group ${selectedSectorId === sector.id
                                        ? 'bg-primary/20 border-primary text-primary shadow-sm'
                                        : 'bg-card border-border text-muted-foreground hover:bg-secondary hover:text-foreground'
                                        }`}
                                >
                                    <span className="font-medium">{sector.name}</span>
                                    <span className={`text-xs px-2 py-1 rounded-full transition font-bold ${selectedSectorId === sector.id
                                        ? 'bg-primary text-white shadow-sm'
                                        : 'bg-secondary text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary'
                                        }`}>
                                        {sector.tents.length} Tents
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Tent Grid */}
                    {selectedSector && (
                        <div className="bg-white rounded-2xl p-6 animate-in slide-in-from-left-4 duration-300 border border-border/60 shadow-sm">
                            <h3 className="text-lg font-bold text-foreground mb-4 flex items-center justify-between">
                                <span>Select Tent</span>
                                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-1 rounded-full">{selectedSector.tents.length} Available</span>
                            </h3>
                            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1 custom-scrollbar">
                                {selectedSector.tents.map(tent => {
                                    const percent = Math.min((tent.occupied / tent.capacity) * 100, 100);
                                    const isFull = tent.occupied >= tent.capacity;
                                    const isSelected = selectedTentId === tent.id;

                                    return (
                                        <button
                                            key={tent.id}
                                            onClick={() => setSelectedTentId(tent.id)}
                                            className={`p-3 rounded-xl border text-left transition-all duration-300 relative overflow-hidden group ${isSelected
                                                ? 'bg-primary text-white border-primary shadow-lg ring-1 ring-primary'
                                                : 'bg-white border-border hover:border-primary/50 hover:shadow-md'
                                                }`}
                                        >
                                            <div className="relative z-10 flex flex-col h-full">
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`font-bold text-sm ${isSelected ? 'text-white' : 'text-foreground'}`}>{tent.name}</span>
                                                    {isFull && <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />}
                                                </div>

                                                <div className="mt-auto">
                                                    <div className={`text-xs opacity-80 flex justify-between mb-1.5 ${isSelected ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                                                        <span>{tent.occupied} / {tent.capacity} Guests</span>
                                                    </div>
                                                    {/* Mini Progress Bar */}
                                                    <div className={`h-1.5 w-full rounded-full overflow-hidden ${isSelected ? 'bg-white/20' : 'bg-secondary'}`}>
                                                        <div
                                                            className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : (isSelected ? 'bg-white' : 'bg-primary')}`}
                                                            style={{ width: `${percent}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                {/* Right Panel: Booking Form & Details */}
                <div className="lg:col-span-8">
                    {selectedTent ? (
                        <div className="bg-white rounded-2xl p-8 animate-in slide-in-from-right-4 duration-300 border border-border/60 shadow-sm">
                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-border/50">
                                <div>
                                    <h2 className="text-2xl font-black text-foreground tracking-tight">Booking: {selectedTent.name}</h2>
                                    <p className="text-muted-foreground text-sm mt-1">Manage occupants and details for this tent</p>
                                </div>
                                <div className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-widest uppercase border ${selectedTent.occupied >= selectedTent.capacity
                                    ? 'bg-red-50 text-red-600 border-red-100'
                                    : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                                    }`}>
                                    {selectedTent.occupied >= selectedTent.capacity ? 'Full Capacity' : 'Available'}
                                </div>
                            </div>

                            {/* Active Occupants */}
                            {selectedTent.bookings && selectedTent.bookings.length > 0 && (
                                <div className="mb-10">
                                    <div className="flex items-center gap-2 mb-4">
                                        <h4 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Current Occupants</h4>
                                        <span className="text-xs font-semibold bg-secondary text-muted-foreground px-2 py-0.5 rounded-full">
                                            {selectedTent.bookings.filter(b => b.status === "CONFIRMED").reduce((acc, b) => acc + b.members.length, 0)}
                                        </span>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                                        {selectedTent.bookings
                                            .filter(b => b.status === 'CONFIRMED')
                                            .flatMap(b => b.members.map(m => ({ ...m, booking: b })))
                                            .sort((a, b) => {
                                                const aIsHead = a.id === a.booking.members[0]?.id;
                                                const bIsHead = b.id === b.booking.members[0]?.id;
                                                return aIsHead ? -1 : (bIsHead ? 1 : 0);
                                            })
                                            .map((member) => {
                                                const isOverdue = member.booking.checkOutDate && new Date(member.booking.checkOutDate) < new Date();
                                                return (
                                                    <div key={member.id} className={`group relative flex flex-col justify-between p-5 rounded-2xl border transition-all duration-300 hover:shadow-lg ${isOverdue ? 'bg-red-50/40 border-red-200' : 'bg-white border-border/40 shadow-sm hover:border-primary/30 hover:bg-secondary/5'}`}>
                                                        {/* Header */}
                                                        <div className="flex justify-between items-start mb-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm ${isOverdue ? 'bg-red-100 text-red-600' : 'bg-secondary text-foreground'}`}>
                                                                    {member.name.charAt(0).toUpperCase()}
                                                                </div>
                                                                <div>
                                                                    <h4 className="font-bold text-foreground text-sm leading-tight flex items-center gap-2">
                                                                        {member.name}
                                                                        {member.id === member.booking.members[0]?.id && (
                                                                            <span className="text-[8px] bg-primary text-white px-2 py-0.5 rounded-full font-black tracking-widest border border-primary/20">TEAM HEAD</span>
                                                                        )}
                                                                        {isOverdue && <span className="text-[9px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full font-extrabold tracking-wide border border-red-100">OVERDUE</span>}
                                                                    </h4>
                                                                    <div className="text-xs text-muted-foreground mt-1 flex items-center gap-1.5">
                                                                        <span className="font-medium bg-secondary px-1.5 py-0.5 rounded text-foreground/80 border border-border/50">{member.age} Yrs</span>
                                                                        <span className="text-muted-foreground/30">•</span>
                                                                        <span className="capitalize">{member.gender.toLowerCase()}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Details */}
                                                        <div className="space-y-2 mb-4">
                                                            <div className="bg-secondary/40 rounded-xl p-3 flex items-center justify-between border border-border/50">
                                                                <div className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
                                                                    <CalendarIcon className="w-3.5 h-3.5 text-muted-foreground/50" />
                                                                    <span>Out: <span className="text-foreground/80">{member.booking.checkOutDate ? new Date(member.booking.checkOutDate).toLocaleDateString() : 'N/A'}</span></span>
                                                                </div>
                                                                {member.booking.mobile && (
                                                                    <span className="text-[10px] font-mono text-primary font-bold">{member.booking.mobile}</span>
                                                                )}
                                                            </div>
                                                            {member.booking.notes && (
                                                                <div className="bg-orange-50/50 p-2.5 rounded-xl border border-orange-100/50 text-[10px] text-orange-800 line-clamp-2 italic leading-relaxed">
                                                                    &ldquo;{member.booking.notes}&rdquo;
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="grid grid-cols-3 gap-2 mt-auto">
                                                            <Tooltip text={`Edit`}>
                                                                <button
                                                                    onClick={() => setEditingMember({
                                                                        id: member.id,
                                                                        name: member.name,
                                                                        age: member.age,
                                                                        gender: member.gender,
                                                                        mobile: member.booking.mobile || '',
                                                                        notes: member.booking.notes || '',
                                                                        checkInDate: member.booking.checkInDate ? new Date(member.booking.checkInDate).toISOString().split('T')[0] : '',
                                                                        checkOutDate: member.booking.checkOutDate ? new Date(member.booking.checkOutDate).toISOString().split('T')[0] : ''
                                                                    })}
                                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-foreground border border-border hover:bg-secondary hover:border-primary/30 transition-all active:scale-95"
                                                                >
                                                                    <Pencil1Icon className="w-4 h-4" />
                                                                </button>
                                                            </Tooltip>

                                                            <Tooltip text={`Extend`}>
                                                                <button
                                                                    onClick={() => handleExtend(member.booking.id)}
                                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-primary border border-border hover:bg-primary/10 hover:border-primary/30 transition-all active:scale-95"
                                                                >
                                                                    <TimerIcon className="w-4 h-4" />
                                                                </button>
                                                            </Tooltip>

                                                            <Tooltip text={`Checkout`}>
                                                                <button
                                                                    onClick={() => handleCheckout(member.booking.id)}
                                                                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold bg-white text-red-600 border border-border hover:bg-red-50 hover:border-red-200 transition-all active:scale-95"
                                                                >
                                                                    <ExitIcon className="w-4 h-4" />
                                                                </button>
                                                            </Tooltip>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                        {selectedTent.bookings.filter(b => b.status === 'CONFIRMED').length === 0 && (
                                            <div className="col-span-2 text-center py-12 text-muted-foregrounditalic border-2 border-dashed border-border rounded-3xl flex flex-col items-center gap-2">
                                                <PersonIcon className="w-8 h-8 opacity-20" />
                                                No active occupants found in this tent.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* New Booking Form */}
                            <div className="space-y-6 pt-8 border-t border-border/50">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-lg font-bold text-foreground mb-1">New Booking</h4>
                                        <p className="text-sm text-muted-foreground">Fill in details to check in new guests.</p>
                                    </div>
                                    <div className="hidden sm:block">
                                        <button
                                            onClick={addMemberRow}
                                            className="text-xs font-bold text-white bg-primary hover:bg-primary/90 px-4 py-2 rounded-lg transition-all flex items-center gap-2 shadow-sm"
                                        >
                                            <PlusIcon className="w-3.5 h-3.5" />
                                            Add Guest
                                        </button>
                                    </div>
                                </div>

                                {/* Members Input List */}
                                <div className="space-y-4">
                                    {members.map((member, idx) => (
                                        <div key={idx} className="bg-secondary/20 p-5 rounded-2xl border border-border/60 animate-in fade-in slide-in-from-bottom-2 duration-300 relative group hover:border-primary/30 transition-colors">
                                            <div className="flex justify-between items-center mb-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-6 h-6 rounded-full bg-secondary text-muted-foreground flex items-center justify-center text-[10px] font-bold border border-border/50">
                                                        {idx + 1}
                                                    </span>
                                                    <span className="text-xs font-bold text-muted-foreground/60 uppercase tracking-widest">{idx === 0 ? 'Primary Guest (Team Head)' : 'Additional Guest'}</span>
                                                </div>
                                                {members.length > 1 && (
                                                    <button
                                                        onClick={() => removeMemberRow(idx)}
                                                        className="text-muted-foreground/30 hover:text-red-500 transition-colors p-1.5 hover:bg-red-50 rounded-lg"
                                                        title="Remove Guest"
                                                    >
                                                        <TrashIcon className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                                                <div className="col-span-12 sm:col-span-5">
                                                    <input
                                                        className={`w-full bg-white border outline-none text-sm px-4 py-2.5 rounded-xl transition-all ${errors.members?.[idx]?.name ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/5'}`}
                                                        placeholder="Full Name"
                                                        value={member.name}
                                                        onChange={e => updateMemberField(idx, 'name', e.target.value)}
                                                        onKeyPress={e => handleMemberKeyPress(e, idx)}
                                                    />
                                                    {errors.members?.[idx]?.name && (
                                                        <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-medium flex items-center gap-1"><ExclamationTriangleIcon className="w-3 h-3" /> {errors.members[idx].name}</p>
                                                    )}
                                                </div>
                                                <div className="col-span-6 sm:col-span-3">
                                                    <input
                                                        className={`w-full bg-white border outline-none text-sm px-4 py-2.5 rounded-xl transition-all ${errors.members?.[idx]?.age ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/5'}`}
                                                        placeholder="Age"
                                                        type="number"
                                                        value={member.age}
                                                        onChange={e => updateMemberField(idx, 'age', e.target.value)}
                                                        onKeyPress={e => handleMemberKeyPress(e, idx)}
                                                    />
                                                    {errors.members?.[idx]?.age && (
                                                        <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-medium">{errors.members[idx].age}</p>
                                                    )}
                                                </div>
                                                <div className="col-span-6 sm:col-span-4">
                                                    <div className="relative">
                                                        <select
                                                            className="w-full bg-white border border-border outline-none text-sm px-4 py-2.5 rounded-xl appearance-none focus:border-primary focus:ring-4 focus:ring-primary/5 transition-all cursor-pointer"
                                                            value={member.gender}
                                                            onChange={e => updateMemberField(idx, 'gender', e.target.value)}
                                                        >
                                                            <option value="MALE">Male</option>
                                                            <option value="FEMALE">Female</option>
                                                            <option value="OTHER">Other</option>
                                                        </select>
                                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none opacity-50">
                                                            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    <div className="sm:hidden">
                                        <button
                                            onClick={addMemberRow}
                                            className="w-full text-sm font-bold text-muted-foreground bg-secondary hover:bg-primary/10 border border-border rounded-xl px-4 py-3 transition flex items-center justify-center gap-2"
                                        >
                                            <PlusIcon className="w-4 h-4" />
                                            Add Another Guest
                                        </button>
                                    </div>
                                </div>

                                {/* Contact & Notes */}
                                <div className="space-y-5 pt-6 border-t border-dashed border-border/50">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Mobile Number <span className="text-red-500">*</span></label>
                                            <input
                                                className={`w-full bg-white border outline-none text-sm px-4 py-2.5 rounded-xl transition-all ${errors.mobile ? 'border-red-300 focus:border-red-500 focus:ring-4 focus:ring-red-100' : 'border-border focus:border-primary focus:ring-4 focus:ring-primary/5'}`}
                                                placeholder="10-digit number"
                                                value={mobile}
                                                onChange={e => {
                                                    setMobile(e.target.value);
                                                    if (errors.mobile) {
                                                        setErrors({ ...errors, mobile: undefined });
                                                    }
                                                }}
                                                maxLength={10}
                                            />
                                            {errors.mobile && (
                                                <p className="text-red-500 text-[10px] mt-1.5 ml-1 font-medium">{errors.mobile}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 block">Notes (Optional)</label>
                                            <input
                                                className="w-full bg-white border border-border outline-none text-sm px-4 py-2.5 rounded-xl transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                                                placeholder="Special requests, etc."
                                                value={notes}
                                                onChange={e => setNotes(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    {/* Dates */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                        <div>
                                            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Check-In Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    className="w-full bg-white border border-border outline-none text-sm px-4 py-2.5 rounded-xl transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                                                    value={checkInDate}
                                                    onChange={e => setCheckInDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2">Check-Out Date</label>
                                            <div className="relative">
                                                <input
                                                    type="date"
                                                    className="w-full bg-white border border-border outline-none text-sm px-4 py-2.5 rounded-xl transition-all focus:border-primary focus:ring-4 focus:ring-primary/5"
                                                    value={checkOutDate}
                                                    onChange={e => setCheckOutDate(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="w-full md:w-auto bg-primary text-white px-8 py-3.5 rounded-xl text-sm font-bold shadow-lg shadow-primary/10 hover:bg-primary/90 hover:shadow-xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {loading ? (
                                            <>Processing...</>
                                        ) : (
                                            <>
                                                <CheckIcon className="w-4 h-4" />
                                                Confirm Booking ({members.length} Guests)
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-muted-foreground border border-dashed border-border rounded-2xl bg-secondary/5">
                            <div className="p-4 rounded-full bg-secondary mb-4">
                                <CubeIcon className="w-12 h-12 opacity-50" />
                            </div>
                            <p className="font-medium text-lg">No Tent Selected</p>
                            <p className="text-sm opacity-60">Choose a sector and tent from the left to begin.</p>
                        </div>
                    )}
                </div>
            </div>

            <Modal
                isOpen={modalConfig.isOpen}
                onClose={closeModal}
                title={modalConfig.title}
                actions={
                    <>
                        <button onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (modalConfig.type === 'input') {
                                    const input = document.getElementById('modal-input') as HTMLInputElement;
                                    modalConfig.onConfirm?.(input?.value);
                                } else {
                                    modalConfig.onConfirm?.();
                                }
                            }}
                            className="btn-primary"
                        >
                            Confirm
                        </button>
                    </>
                }
            >
                <div>
                    {modalConfig.message && <p className="mb-4">{modalConfig.message}</p>}
                    {modalConfig.type === 'input' && (
                        <input
                            id="modal-input"
                            type="date"
                            className="input-primary w-full"
                            defaultValue={new Date().toISOString().split('T')[0]}
                        />
                    )}
                </div>
            </Modal>

            {/* Edit Member Modal */}
            <Modal
                isOpen={!!editingMember}
                onClose={() => setEditingMember(null)}
                title="Edit Occupant Details"
                actions={
                    <>
                        <button onClick={() => setEditingMember(null)} className="px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary transition">
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                if (!editingMember) return;
                                setLoading(true);
                                try {
                                    const res = await updateMember(editingMember.id, {
                                        name: editingMember.name,
                                        age: Number(editingMember.age),
                                        gender: editingMember.gender,
                                        mobile: editingMember.mobile,
                                        notes: editingMember.notes,
                                        checkInDate: editingMember.checkInDate,
                                        checkOutDate: editingMember.checkOutDate
                                    });
                                    if (res.success) {
                                        router.refresh();
                                        setEditingMember(null);
                                        showAlert('Success', 'Member and Booking updated successfully');
                                    } else {
                                        showAlert('Error', 'Failed to update member');
                                    }
                                } catch (e) {
                                    console.error(e);
                                    showAlert('Error', 'An error occurred');
                                } finally {
                                    setLoading(false);
                                }
                            }}
                            className="btn-primary"
                        >
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                    </>
                }
            >
                {editingMember && (
                    <div className="space-y-4">
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Full Name</label>
                            <input
                                className="input-primary w-full"
                                value={editingMember.name}
                                onChange={(e) => setEditingMember({ ...editingMember, name: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Age</label>
                                <input
                                    type="number"
                                    className="input-primary w-full"
                                    value={editingMember.age}
                                    onChange={(e) => setEditingMember({ ...editingMember, age: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Gender</label>
                                <select
                                    className="input-primary w-full"
                                    value={editingMember.gender}
                                    onChange={(e) => setEditingMember({ ...editingMember, gender: e.target.value })}
                                >
                                    <option value="MALE">MALE</option>
                                    <option value="FEMALE">FEMALE</option>
                                    <option value="OTHER">OTHER</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Mobile Number (Booking)</label>
                            <input
                                className="input-primary w-full"
                                value={editingMember.mobile}
                                onChange={(e) => setEditingMember({ ...editingMember, mobile: e.target.value })}
                                placeholder="Mobile Number"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Notes</label>
                            <textarea
                                className="input-primary w-full min-h-[80px]"
                                value={editingMember.notes}
                                onChange={(e) => setEditingMember({ ...editingMember, notes: e.target.value })}
                                placeholder="Group notes..."
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Check-In</label>
                                <input
                                    type="date"
                                    className="input-primary w-full"
                                    value={editingMember.checkInDate}
                                    onChange={(e) => setEditingMember({ ...editingMember, checkInDate: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest pl-1 mb-1 block">Check-Out</label>
                                <input
                                    type="date"
                                    className="input-primary w-full"
                                    value={editingMember.checkOutDate}
                                    onChange={(e) => setEditingMember({ ...editingMember, checkOutDate: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
