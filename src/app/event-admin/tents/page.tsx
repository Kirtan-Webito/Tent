import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import TentsClient from './TentsClient';

async function getInventory(eventId: string) {
    const tents = await prisma.tent.findMany({
        where: { sector: { eventId } },
        include: {
            sector: true,
            bookings: {
                where: {
                    status: 'CONFIRMED'
                },
                include: {
                    members: true
                },
                take: 1 // Get the first confirmed booking
            }
        }
    });

    return tents.map((tent: any) => ({
        id: tent.id,
        name: tent.name,
        capacity: tent.capacity,
        sector: tent.sector,
        status: tent.bookings.length > 0 ? 'Occupied' : 'Available',
        currentBooking: tent.bookings[0] || null
    }));
}

export default async function TentsInventoryPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    if (!eventId) redirect('/login');

    const items = await getInventory(eventId);

    return <TentsClient tents={items} />;
}
