import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import TentsInventoryClient from './tents-inventory-client';
import { naturalSort } from '@/lib/utils/naturalSort';

export const dynamic = 'force-dynamic';

async function getInventoryData(eventId: string, assignedSectorIds?: string[]) {
    const sectors = await prisma.sector.findMany({
        where: {
            eventId,
            ...(assignedSectorIds && assignedSectorIds.length > 0 ? { id: { in: assignedSectorIds } } : {})
        },
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

    const mapped = sectors.map(s => {
        const total = s.tents.length;
        const occupiedTents = s.tents.filter(t => t.bookings.length > 0);
        const available = total - occupiedTents.length;

        return {
            id: s.id,
            name: s.name,
            total,
            available,
            occupiedCount: occupiedTents.length,
            tents: s.tents.map(t => {
                const occupants = t.bookings.flatMap(b =>
                    b.members.map(m => ({
                        ...m,
                        checkIn: b.checkInDate,
                        checkOut: b.checkOutDate,
                        mobile: b.mobile,
                        bookingId: b.id
                    }))
                );
                return {
                    id: t.id,
                    name: t.name,
                    capacity: t.capacity,
                    occupied: occupants.length,
                    status: occupants.length === 0 ? 'AVAILABLE' : (occupants.length >= t.capacity ? 'FULL' : 'OCCUPIED'),
                    guests: occupants,
                    sectorName: s.name,
                    sectorId: s.id
                } as any;
            })
        };
    }) as any;

    // Apply natural sort to sectors
    mapped.sort((a: any, b: any) => naturalSort(a.name, b.name));

    // Apply natural sort to tents within each sector
    mapped.forEach((sector: any) => {
        sector.tents.sort((a: any, b: any) => naturalSort(a.name, b.name));
    });

    return mapped;
}

export default async function TentsInventoryPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId || (session as any)?.eventId;
    const assignedSectorIds = (session as any)?.assignedSectorIds;

    if (!eventId) {
        return <div className="p-8 text-gray-500">No event context found. Please log in again.</div>;
    }

    const inventoryData = await getInventoryData(eventId, assignedSectorIds);

    return <TentsInventoryClient initialSectors={inventoryData} />;
}
