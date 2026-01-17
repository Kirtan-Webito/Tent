export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import TentsClient from './TentsClient';
import { naturalSort } from '@/lib/utils/naturalSort';

async function getInventory(eventId: string) {
    const sectors = await prisma.sector.findMany({
        where: { eventId },
        include: {
            tents: {
                include: {
                    bookings: {
                        where: { status: 'CONFIRMED' },
                        include: { members: true }
                    }
                }
            }
        }
    });

    const mapped = sectors.map((sector: any) => ({
        id: sector.id,
        name: sector.name,
        tents: sector.tents.map((tent: any) => ({
            id: tent.id,
            name: tent.name,
            capacity: tent.capacity,
            status: tent.bookings.length > 0 ? (tent.bookings.reduce((sum: number, b: any) => sum + b.members.length, 0) >= tent.capacity ? 'Full' : 'Occupied') : 'Available',
            bookings: tent.bookings,
            currentBooking: tent.bookings[0] || null
        }))
    }));

    // Apply natural sort to sectors
    mapped.sort((a, b) => naturalSort(a.name, b.name));

    // Apply natural sort to tents within each sector
    mapped.forEach(sector => {
        sector.tents.sort((a: any, b: any) => naturalSort(a.name, b.name));
    });

    return mapped;
}

export default async function TentsInventoryPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    if (!eventId) redirect('/login');

    const items = await getInventory(eventId);

    return <TentsClient tents={items} />;
}
