export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import TentsClient from './TentsClient';

async function getInventory(eventId: string) {
    const sectors = await prisma.sector.findMany({
        where: { eventId },
        include: {
            tents: {
                include: {
                    bookings: {
                        where: { status: 'CONFIRMED' },
                        include: { members: true },
                        take: 1
                    }
                },
                orderBy: { name: 'asc' }
            }
        },
        orderBy: { name: 'asc' }
    });

    return sectors.map((sector: any) => ({
        id: sector.id,
        name: sector.name,
        tents: sector.tents.map((tent: any) => ({
            id: tent.id,
            name: tent.name,
            capacity: tent.capacity,
            status: tent.bookings.length > 0 ? 'Occupied' : 'Available',
            currentBooking: tent.bookings[0] || null
        }))
    }));
}

export default async function TentsInventoryPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    if (!eventId) redirect('/login');

    const items = await getInventory(eventId);

    return <TentsClient tents={items} />;
}
