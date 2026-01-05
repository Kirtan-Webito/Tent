'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';
import StatsCard from '@/components/ui/StatsCard';
import { CubeIcon } from '@radix-ui/react-icons';

type Member = {
    id: string;
    name: string;
    age: number;
    gender: string;
};

type Booking = {
    id: string;
    members: Member[];
    checkInDate: string | null;
    checkOutDate: string | null;
    status: string;
};

type Tent = {
    id: string;
    name: string;
    capacity: number;
    occupied: number;
    bookings?: Booking[];
};

type Sector = {
    id: string;
    name: string;
    tents: Tent[];
};

export default function BookingInterface({ sectors }: { sectors: Sector[] }) {
    const [selectedSectorId, setSelectedSectorId] = useState<string>('');
    const [selectedTentId, setSelectedTentId] = useState<string>('');
    const [members, setMembers] = useState<{ name: string, age: string, gender: string }[]>([{ name: '', age: '', gender: 'MALE' }]);
    const [mobile, setMobile] = useState('');
    const [notes, setNotes] = useState('');
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');
    const [loading, setLoading] = useState(false);

    // Validation Errors
    const [errors, setErrors] = useState<{
        mobile?: string;
        members?: { [key: number]: { name?: string; age?: string } };
        tent?: string;
    }>({});

    // Modal State
    const [modalConfig, setModalConfig] = useState<{
        isOpen: boolean;
        type: 'confirm' | 'alert' | 'input';
        title: string;
        message?: string;
        onConfirm?: (inputValue?: string) => void;
    }>({ isOpen: false, type: 'alert', title: '' });

    const router = useRouter();

    const selectedSector = sectors.find(s => s.id === selectedSectorId);
    const selectedTent = selectedSector?.tents.find(t => t.id === selectedTentId);

    // Calculated Stats
    const totalBookings = sectors.flatMap(s => s.tents.flatMap(t => t.bookings || [])).filter(b => b.status === 'CONFIRMED').length;
    const totalOccupancy = sectors.flatMap(s => s.tents).reduce((sum, t) => sum + t.occupied, 0);
    const totalCapacity = sectors.flatMap(s => s.tents).reduce((sum, t) => sum + t.capacity, 0);

    const closeModal = () => setModalConfig({ ...modalConfig, isOpen: false });

    const showConfirm = (title: string, message: string, onConfirm: () => void) => {
        setModalConfig({
            isOpen: true,
            type: 'confirm',
            title,
            message,
            onConfirm
        });
    };

    const showAlert = (title: string, message: string) => {
        setModalConfig({
            isOpen: true,
            type: 'alert',
            title,
            message,
            onConfirm: () => closeModal()
        });
    };

    const showInput = (title: string, message: string, onConfirm: (val?: string) => void) => {
        setModalConfig({
            isOpen: true,
            type: 'input',
            title,
            message,
            onConfirm
        });
    };

    // Validation Functions
    const validateMobile = (value: string): string | undefined => {
        if (!value.trim()) return 'Mobile number is required';
        if (!/^[0-9]{10}$/.test(value.trim())) return 'Mobile number must be 10 digits';
        return undefined;
    };

    const validateMemberName = (value: string): string | undefined => {
        if (!value.trim()) return 'Name is required';
        if (value.trim().length < 2) return 'Name must be at least 2 characters';
        return undefined;
    };

    const validateAge = (value: string): string | undefined => {
        if (!value.trim()) return 'Age is required';
        const age = parseInt(value);
        if (isNaN(age)) return 'Age must be a number';
        if (age < 15) return 'Age must be 15 or above';
        if (age > 120) return 'Please enter a valid age';
        return undefined;
    };

    const validateForm = (): boolean => {
        const newErrors: typeof errors = {};

        // Validate mobile
        const mobileError = validateMobile(mobile);
        if (mobileError) newErrors.mobile = mobileError;

        // Validate tent selection
        if (!selectedTentId) newErrors.tent = 'Please select a tent';

        // Validate members
        newErrors.members = {};
        members.forEach((member, idx) => {
            const nameError = validateMemberName(member.name);
            const ageError = validateAge(member.age);

            if (nameError || ageError) {
                newErrors.members![idx] = {
                    name: nameError,
                    age: ageError
                };
            }
        });

        if (Object.keys(newErrors.members).length === 0) {
            delete newErrors.members;
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const addMemberRow = () => {
        setMembers([...members, { name: '', age: '', gender: 'MALE' }]);
    };

    const removeMemberRow = (index: number) => {
        setMembers(members.filter((_, i) => i !== index));
        // Clear errors for this member
        if (errors.members?.[index]) {
            const newErrors = { ...errors };
            delete newErrors.members![index];
            setErrors(newErrors);
        }
    };

    const updateMember = (index: number, field: string, value: string) => {
        const newMembers = [...members];
        newMembers[index] = { ...newMembers[index], [field]: value };
        setMembers(newMembers);

        // Clear error for this field when user types
        if (errors.members?.[index]?.[field as 'name' | 'age']) {
            const newErrors = { ...errors };
            if (newErrors.members?.[index]) {
                delete newErrors.members[index][field as 'name' | 'age'];
                if (Object.keys(newErrors.members[index]).length === 0) {
                    delete newErrors.members[index];
                }
                if (Object.keys(newErrors.members).length === 0) {
                    delete newErrors.members;
                }
            }
            setErrors(newErrors);
        }
    };

    const handleMemberKeyPress = (e: React.KeyboardEvent, index: number) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            // Validate current member before adding new one
            const nameError = validateMemberName(members[index].name);
            const ageError = validateAge(members[index].age);

            if (!nameError && !ageError) {
                addMemberRow();
            } else {
                // Show errors for current member
                const newErrors = { ...errors };
                if (!newErrors.members) newErrors.members = {};
                newErrors.members[index] = {
                    name: nameError,
                    age: ageError
                };
                setErrors(newErrors);
            }
        }
    };

    const handleSubmit = async () => {
        // Validate form first
        if (!validateForm()) {
            showAlert('Validation Error', 'Please fix all errors before submitting');
            return;
        }

        if (!selectedTentId) return;

        // Capacity Check
        const currentOccupancy = selectedTent?.occupied || 0;
        const capacity = selectedTent?.capacity || 0;
        const newTotal = currentOccupancy + members.length;

        const proceed = async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/bookings', {
                    method: 'POST',
                    body: JSON.stringify({
                        tentId: selectedTentId,
                        members,
                        mobile,
                        notes,
                        checkInDate,
                        checkOutDate
                    }),
                    headers: { 'Content-Type': 'application/json' }
                });

                if (res.ok) {
                    showAlert('Success', 'Booking Successful!');
                    router.refresh();
                    resetForm();
                } else {
                    showAlert('Error', 'Booking Failed');
                }
            } catch (e) {
                console.error(e);
                showAlert('Error', 'An unexpected error occurred.');
            } finally {
                setLoading(false);
            }
        };

        if (newTotal > capacity) {
            showConfirm(
                'Capacity Warning',
                `Tent capacity exceeded! (${newTotal}/${capacity}). Overbook?`,
                proceed
            );
        } else {
            proceed();
        }
    };

    const resetForm = () => {
        setMembers([{ name: '', age: '', gender: 'MALE' }]);
        setMobile('');
        setNotes('');
        setCheckInDate('');
        setCheckOutDate('');
        setSelectedTentId('');
        setErrors({});
    };

    const handleCheckout = (bookingId: string) => {
        showConfirm('Confirm Checkout', 'Are you sure you want to check out this booking?', async () => {
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
                } else {
                    showAlert('Error', 'Checkout failed');
                }
            } catch (e) {
                console.error(e);
                showAlert('Error', 'Error during checkout');
            } finally {
                setLoading(false);
            }
        });
    };

    const handleAutoCheckout = () => {
        showConfirm('Run Auto-Checkout', 'Check out ALL expired bookings?', async () => {
            setLoading(true);
            try {
                const res = await fetch('/api/bookings/auto-cleanup', {
                    method: 'POST'
                });
                const data = await res.json();
                if (res.ok) {
                    showAlert('Complete', `Auto-Checkout Complete. ${data.count} bookings updated.`);
                    router.refresh();
                } else {
                    showAlert('Error', 'Auto-Checkout failed');
                }
            } catch (e) {
                console.error(e);
                showAlert('Error', 'Error during auto-checkout');
            } finally {
                setLoading(false);
            }
        });
    };

    const handleExtend = (bookingId: string) => {
        showInput('Extend Stay', 'Enter new Check-Out Date (YYYY-MM-DD):', async (newDate) => {
            if (!newDate) return;
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
                } else {
                    showAlert('Error', 'Extension failed');
                }
            } catch (e) {
                console.error(e);
                showAlert('Error', 'Error extending booking');
            } finally {
                setLoading(false);
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
                    <StatsCard label="Quick Actions" value="Auto Checkout" subtext="Tap to run >" className="hover:bg-primary/5 border-primary/20" />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                {/* Left Panel: Navigation & Tent Selection */}
                <div className="lg:col-span-4 space-y-6">
                    {/* Sector List */}
                    <div className="bg-white rounded-2xl p-6 border border-border shadow-sm">
                        <h3 className="text-lg font-bold text-foreground mb-4">1. Select Sector</h3>
                        <div className="space-y-2">
                            {sectors.map(sector => (
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
                        <div className="bg-white rounded-2xl p-6 animate-in slide-in-from-left-4 duration-300 border border-border shadow-sm">
                            <h3 className="text-lg font-bold text-foreground mb-4">2. Select Tent</h3>
                            <div className="grid grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                                {selectedSector.tents.map(tent => {
                                    const percent = Math.min((tent.occupied / tent.capacity) * 100, 100);
                                    const isFull = tent.occupied >= tent.capacity;
                                    const isSelected = selectedTentId === tent.id;

                                    return (
                                        <button
                                            key={tent.id}
                                            onClick={() => setSelectedTentId(tent.id)}
                                            className={`p-3 rounded-xl border text-left transition-all relative overflow-hidden group ${isSelected
                                                ? 'bg-primary text-white border-primary shadow-lg'
                                                : 'bg-card border-border hover:border-primary/50'
                                                }`}
                                        >
                                            <div className="relative z-10">
                                                <div className="font-bold text-sm mb-1">{tent.name}</div>
                                                <div className="text-xs opacity-80 flex justify-between">
                                                    <span>{tent.occupied}/{tent.capacity}</span>
                                                    <span>{isFull ? 'FULL' : 'OPEN'}</span>
                                                </div>
                                            </div>

                                            {/* Progress Bar Background */}
                                            <div
                                                className={`absolute bottom-0 left-0 h-1 transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-primary'}`}
                                                style={{ width: `${percent}%` }}
                                            />
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
                        <div className="bg-white rounded-2xl p-8 animate-in slide-in-from-right-4 duration-300 border border-border shadow-sm">
                            <div className="flex justify-between items-start mb-8 pb-6 border-b border-border">
                                <div>
                                    <h2 className="text-3xl font-bold text-foreground text-gradient">Booking: {selectedTent.name}</h2>
                                    <p className="text-gray-400 mt-1">Manage occupants for this tent</p>
                                </div>
                                <div className={`px-4 py-2 rounded-full text-xs font-bold tracking-wide border ${selectedTent.occupied >= selectedTent.capacity
                                    ? 'bg-red-100 text-red-700 border-red-200'
                                    : 'bg-emerald-100 text-emerald-700 border-emerald-200'
                                    }`}>
                                    {selectedTent.occupied >= selectedTent.capacity ? 'MAX CAPACITY' : 'AVAILABLE'}
                                </div>
                            </div>

                            {/* Active Occupants */}
                            {selectedTent.bookings && selectedTent.bookings.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-4">Current Occupants</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {selectedTent.bookings
                                            .filter(b => b.status === 'CONFIRMED')
                                            .flatMap(b => b.members.map(m => ({ ...m, booking: b })))
                                            .map((member) => {
                                                const isOverdue = member.booking.checkOutDate && new Date(member.booking.checkOutDate) < new Date();
                                                return (
                                                    <div key={member.id} className={`flex justify-between items-center p-3 rounded-xl border transition-all ${isOverdue ? 'bg-red-500/10 border-red-500/20' : 'bg-secondary border-border hover:bg-secondary/80'}`}>
                                                        <div>
                                                            <div className="font-bold text-foreground flex items-center gap-2">
                                                                {member.name}
                                                                {isOverdue && <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-sm">OVERDUE</span>}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-0.5">
                                                                {member.booking.checkOutDate ? `Out: ${new Date(member.booking.checkOutDate).toLocaleDateString()}` : 'Indefinite'}
                                                            </div>
                                                        </div>
                                                        <div className="flex gap-2">
                                                            <button
                                                                onClick={() => handleExtend(member.booking.id)}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition"
                                                            >
                                                                Extend
                                                            </button>
                                                            <button
                                                                onClick={() => handleCheckout(member.booking.id)}
                                                                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-red-100 text-red-700 border border-red-200 hover:bg-red-200 transition"
                                                            >
                                                                Check Out
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })
                                        }
                                        {selectedTent.bookings.filter(b => b.status === 'CONFIRMED').length === 0 && (
                                            <div className="col-span-2 text-center py-4 text-gray-500 italic border border-dashed border-white/10 rounded-xl">
                                                No active occupants found.
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* New Booking Form */}
                            <div className="space-y-6 pt-6 border-t border-white/10">
                                <h4 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">New Booking Details</h4>

                                {/* Members Input */}
                                <div className="space-y-3">
                                    {members.map((member, idx) => (
                                        <div key={idx} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="flex gap-3 items-start">
                                                <div className="flex-none w-8 pt-3 text-center text-gray-500 text-xs font-mono">{String(idx + 1).padStart(2, '0')}</div>
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-12 gap-2">
                                                    <div className="col-span-12 sm:col-span-6">
                                                        <input
                                                            className={`input-primary w-full ${errors.members?.[idx]?.name ? 'border-red-500 focus:border-red-500' : ''}`}
                                                            placeholder="Full Name *"
                                                            value={member.name}
                                                            onChange={e => updateMember(idx, 'name', e.target.value)}
                                                            onKeyPress={e => handleMemberKeyPress(e, idx)}
                                                        />
                                                        {errors.members?.[idx]?.name && (
                                                            <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.members[idx].name}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-6 sm:col-span-3">
                                                        <input
                                                            className={`input-primary w-full ${errors.members?.[idx]?.age ? 'border-red-500 focus:border-red-500' : ''}`}
                                                            placeholder="Age *"
                                                            type="number"
                                                            value={member.age}
                                                            onChange={e => updateMember(idx, 'age', e.target.value)}
                                                            onKeyPress={e => handleMemberKeyPress(e, idx)}
                                                        />
                                                        {errors.members?.[idx]?.age && (
                                                            <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.members[idx].age}</p>
                                                        )}
                                                    </div>
                                                    <div className="col-span-6 sm:col-span-3">
                                                        <select
                                                            className="input-primary w-full"
                                                            value={member.gender}
                                                            onChange={e => updateMember(idx, 'gender', e.target.value)}
                                                        >
                                                            <option value="MALE">Male</option>
                                                            <option value="FEMALE">Female</option>
                                                            <option value="OTHER">Other</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                {members.length > 1 && (
                                                    <button
                                                        onClick={() => removeMemberRow(idx)}
                                                        className="flex-none p-2 text-red-400/50 hover:text-red-400 transition"
                                                        title="Remove"
                                                    >
                                                        ✕
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ))}

                                    <button
                                        onClick={addMemberRow}
                                        className="ml-11 text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-primary/5 transition w-fit"
                                    >
                                        + Add Member (or press Enter)
                                    </button>
                                </div>

                                {/* Contact & Notes */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <input
                                            className={`input-primary w-full ${errors.mobile ? 'border-red-500 focus:border-red-500' : ''}`}
                                            placeholder="Mobile Number *"
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
                                            <p className="text-red-400 text-[10px] mt-1 ml-1">{errors.mobile}</p>
                                        )}
                                    </div>
                                    <textarea
                                        className="input-primary w-full resize-none"
                                        placeholder="Notes (optional)"
                                        rows={1}
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>

                                {/* Dates */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Check-In</label>
                                        <input
                                            type="date"
                                            className="input-primary w-full"
                                            value={checkInDate}
                                            onChange={e => setCheckInDate(e.target.value)}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1 ml-1">Check-Out</label>
                                        <input
                                            type="date"
                                            className="input-primary w-full"
                                            value={checkOutDate}
                                            onChange={e => setCheckOutDate(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 flex justify-end">
                                    <button
                                        onClick={handleSubmit}
                                        disabled={loading}
                                        className="btn-primary w-full md:w-auto px-8 py-3 text-base shadow-lg shadow-primary/20"
                                    >
                                        {loading ? 'Processing...' : `Confirm Booking (${members.length})`}
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center text-gray-500 border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">
                            <div className="p-4 rounded-full bg-white/5 mb-4">
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
                        <button onClick={closeModal} className="px-4 py-2 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition">
                            Cancel
                        </button>
                        <button
                            onClick={() => {
                                if (modalConfig.type === 'input') {
                                    // Handle input logic separately if needed, but for prompt mainly using internal state or passing value
                                    // For simplicity in this reusable structure, we might need a Ref for input.
                                    // Implementing simple input ref here:
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
        </div>
    );
}
