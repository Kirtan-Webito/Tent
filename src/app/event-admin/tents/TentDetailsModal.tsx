'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '@/components/ui/Modal';

interface Member {
    id: string;
    name: string;
    age: number;
    gender: string;
    contact: string | null;
}

interface Booking {
    id: string;
    members: Member[];
    checkInDate: Date | null;
    checkOutDate: Date | null;
    status: string;
    mobile: string | null;
}

interface Sector {
    id: string;
    name: string;
}

interface TentDetails {
    id: string;
    name: string;
    capacity: number;
    sector: Sector;
    status: string;
    currentBooking?: Booking;
}

export default function TentDetailsModal({
    tent,
    isOpen,
    onClose
}: {
    tent: TentDetails | null;
    isOpen: boolean;
    onClose: () => void;
}) {
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    if (!tent) return null;

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete tent ${tent.name}? This cannot be undone.`)) return;

        setLoading(true);
        try {
            const res = await fetch(`/api/tents/${tent.id}`, {
                method: 'DELETE',
            });
            const data = await res.json();

            if (res.ok) {
                onClose();
                router.refresh();
            } else {
                alert(data.error || 'Failed to delete tent.');
            }
        } catch (error) {
            console.error('Delete error:', error);
            alert('An error occurred while deleting the tent.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Tent ${tent.name}`}
            maxWidth="max-w-4xl"
            actions={
                <div className="flex justify-between w-full">
                    <button
                        onClick={handleDelete}
                        disabled={loading || !!tent.currentBooking}
                        className="px-6 py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl transition disabled:opacity-30 disabled:hover:bg-red-50 active:scale-95"
                        title={tent.currentBooking ? "Cannot delete occupied tent" : "Delete Tent"}
                    >
                        {loading ? 'Deleting...' : 'Delete Tent'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground font-bold rounded-xl transition border border-border shadow-sm active:scale-95"
                    >
                        Close
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Tent Status Header */}
                <div className="bg-white border border-border rounded-2xl p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm ${tent.status === 'Available' ? 'bg-emerald-100 text-emerald-600' : 'bg-orange-100 text-orange-600'}`}>
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-foreground uppercase tracking-tight">{tent.name}</h3>
                            <p className="text-xs text-muted-foreground font-medium uppercase tracking-widest">{tent.sector.name} Sector</p>
                        </div>
                    </div>
                    <div className={`px-4 py-2 rounded-xl text-sm font-black uppercase tracking-widest shadow-sm border ${tent.status === 'Available' ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-orange-500 text-white border-orange-600'}`}>
                        {tent.status}
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {/* Left: General Info */}
                    <div className="space-y-4">
                        <div className="bg-secondary/30 rounded-2xl p-5 border border-border h-full">
                            <h4 className="text-xs font-black text-muted-foreground uppercase tracking-[0.2em] mb-4">Specifications</h4>
                            <div className="grid grid-cols-1 gap-4">
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-border/50 flex items-center justify-between">
                                    <span className="text-sm font-bold text-muted-foreground">Capacity</span>
                                    <span className="text-lg font-black text-primary">{tent.capacity} Persons</span>
                                </div>
                                <div className="bg-white rounded-xl p-4 shadow-sm border border-border/50 flex items-center justify-between">
                                    <span className="text-sm font-bold text-muted-foreground">Occupancy Status</span>
                                    <span className={`text-sm font-black uppercase tracking-tighter ${tent.status === 'Available' ? 'text-emerald-600' : 'text-orange-600'}`}>
                                        {tent.status === 'Available' ? 'Free to Book' : 'Currently Occupied'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right: Occupancy/Action */}
                    <div className="space-y-4">
                        {tent.currentBooking ? (
                            <div className="bg-white border border-border rounded-2xl p-5 shadow-sm h-full">
                                <h4 className="text-xs font-black text-primary uppercase tracking-[0.2em] mb-4">Current Booking</h4>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-xl border border-border/50">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase text-muted-foreground">Dates</span>
                                            <span className="text-sm font-bold text-foreground">
                                                {tent.currentBooking.checkInDate ? new Date(tent.currentBooking.checkInDate).toLocaleDateString() : 'N/A'} - {tent.currentBooking.checkOutDate ? new Date(tent.currentBooking.checkOutDate).toLocaleDateString() : 'N/A'}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="space-y-2 max-h-[200px] overflow-y-auto custom-scrollbar pr-1">
                                        {tent.currentBooking.members.map((member, idx) => (
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
                                                {idx === 0 && <span className="text-[8px] bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-black uppercase">Host</span>}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-emerald-50/50 rounded-2xl p-8 border border-emerald-100 text-center flex flex-col items-center justify-center h-full">
                                <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600 mb-4 shadow-sm border border-emerald-200">
                                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                </div>
                                <p className="text-emerald-700 font-black text-xl uppercase tracking-tight">Available</p>
                                <p className="text-xs text-emerald-600/70 mt-2 font-medium">This tent is ready for new guest check-ins.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </Modal>
    );
}
