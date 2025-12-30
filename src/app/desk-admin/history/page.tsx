import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

async function getBookingHistory(deskAdminId: string) {
    return await prisma.booking.findMany({
        where: { deskAdminId },
        include: {
            tent: {
                include: { sector: true }
            },
            members: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

export default async function HistoryPage() {
    const session = await getSession();
    const bookings = await getBookingHistory((session as any).id);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Booking History</h2>
                <p className="text-muted-foreground">Recent bookings made by you.</p>
            </div>

            <div className="border border-border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-white/5 text-gray-400 font-medium border-b border-border">
                            <tr>
                                <th className="py-3 px-4">Booking ID</th>
                                <th className="py-3 px-4">Guest</th>
                                <th className="py-3 px-4">Tent</th>
                                <th className="py-3 px-4">Check-In</th>
                                <th className="py-3 px-4">Check-Out</th>
                                <th className="py-3 px-4">Members</th>
                                <th className="py-3 px-4">Mobile</th>
                                <th className="py-3 px-4">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {bookings.map((booking) => (
                                <tr key={booking.id} className="hover:bg-white/5 transition">
                                    <td className="py-3 px-4 font-mono text-xs">{booking.id.slice(0, 8)}...</td>
                                    <td className="py-3 px-4 font-bold text-white">{booking.members[0]?.name || 'Unknown'}</td>
                                    <td className="py-3 px-4 font-medium">{booking.tent.name} <span className="text-gray-500 text-xs">({booking.tent.sector.name})</span></td>
                                    <td className="py-3 px-4 text-gray-400 text-xs">{booking.checkInDate ? new Date(booking.checkInDate).toLocaleDateString() : '-'}</td>
                                    <td className="py-3 px-4 text-gray-400 text-xs">{booking.checkOutDate ? new Date(booking.checkOutDate).toLocaleDateString() : '-'}</td>
                                    <td className="py-3 px-4">{booking.members.length} Members</td>
                                    <td className="py-3 px-4 text-gray-400">{booking.mobile || '-'}</td>
                                    <td className="py-3 px-4">
                                        <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-500/10 text-green-400 border border-green-500/20">
                                            {booking.status}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && (
                                <tr>
                                    <td colSpan={8} className="py-8 text-center text-gray-500">
                                        No bookings found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
