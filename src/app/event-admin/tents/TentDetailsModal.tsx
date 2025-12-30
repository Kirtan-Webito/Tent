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
            actions={
                <div className="flex justify-between w-full">
                    <button
                        onClick={handleDelete}
                        disabled={loading || !!tent.currentBooking}
                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-lg transition disabled:opacity-30 disabled:hover:bg-red-500/10 disabled:hover:text-red-500"
                        title={tent.currentBooking ? "Cannot delete occupied tent" : "Delete Tent"}
                    >
                        {loading ? 'Deleting...' : 'Delete Tent'}
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                    >
                        Close
                    </button>
                </div>
            }
        >
            <div className="space-y-6">
                {/* Tent Information */}
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                    <h3 className="font-bold text-emerald-400 mb-3">Tent Information</h3>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                            <span className="text-gray-500">Tent Name:</span>
                            <p className="font-bold text-lg mt-1">{tent.name}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Sector:</span>
                            <p className="font-bold text-lg mt-1">{tent.sector.name}</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Capacity:</span>
                            <p className="mt-1">{tent.capacity} persons</p>
                        </div>
                        <div>
                            <span className="text-gray-500">Status:</span>
                            <p className="mt-1">
                                <span className={`px-2 py-1 rounded text-xs font-bold ${tent.status === 'Available' ? 'bg-emerald-500/20 text-emerald-400' :
                                    'bg-blue-500/20 text-blue-400'
                                    }`}>
                                    {tent.status}
                                </span>
                            </p>
                        </div>
                    </div>
                </div>

                {/* Current Occupants */}
                {tent.currentBooking ? (
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                        <h3 className="font-bold text-blue-400 mb-3">
                            Current Occupants ({tent.currentBooking.members.length})
                        </h3>

                        <div className="mb-4 p-3 bg-black/20 rounded-lg">
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <span className="text-gray-500">Check-in:</span>
                                    <p className="font-medium">
                                        {tent.currentBooking.checkInDate
                                            ? new Date(tent.currentBooking.checkInDate).toLocaleDateString()
                                            : 'Not set'}
                                    </p>
                                </div>
                                <div>
                                    <span className="text-gray-500">Check-out:</span>
                                    <p className="font-medium">
                                        {tent.currentBooking.checkOutDate
                                            ? new Date(tent.currentBooking.checkOutDate).toLocaleDateString()
                                            : 'Not set'}
                                    </p>
                                </div>
                                {tent.currentBooking.mobile && (
                                    <div className="col-span-2">
                                        <span className="text-gray-500">Contact:</span>
                                        <p className="font-medium">{tent.currentBooking.mobile}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            {tent.currentBooking.members.map((member, idx) => (
                                <div
                                    key={member.id}
                                    className="flex items-center gap-3 p-3 bg-black/20 rounded-lg"
                                >
                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold">
                                        {member.name.charAt(0)}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-white">
                                            {member.name}
                                            {idx === 0 && (
                                                <span className="ml-2 text-xs bg-yellow-500/20 text-yellow-400 px-2 py-0.5 rounded">
                                                    Primary
                                                </span>
                                            )}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {member.age} yrs • {member.gender}
                                            {member.contact && ` • ${member.contact}`}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="bg-emerald-500/10 rounded-xl p-6 border border-emerald-500/20 text-center">
                        <div className="text-4xl mb-2">✨</div>
                        <p className="text-emerald-400 font-bold">Tent Available</p>
                        <p className="text-sm text-gray-400 mt-1">No current occupants</p>
                    </div>
                )}
            </div>
        </Modal>
    );
}
