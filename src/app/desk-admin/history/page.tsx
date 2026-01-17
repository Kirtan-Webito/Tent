export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import HistoryClient from './HistoryClient';

async function getBookingHistory(deskAdminId: string) {
    return await prisma.booking.findMany({
        where: { deskAdminId },
        include: {
            tent: {
                include: { sector: true }
            },
            members: {
                take: 1
            }
        },
        orderBy: { createdAt: 'desc' },
        take: 50
    });
}

export default async function HistoryPage() {
    const session = await getSession();

    if (!session || !session.id) return <div className="p-8 text-gray-500">Access Denied.</div>;

    const bookings = await getBookingHistory(session.id);

    return <HistoryClient bookings={bookings as any} />;
}
