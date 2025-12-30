export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import BookingInterface from '@/app/desk-admin/booking/booking-interface';

async function getEventData(eventId: string, sectorIds?: string[]) {
    // Fetch sectors and their tents with current occupancy
    const sectors = await prisma.sector.findMany({
        where: {
            eventId,
            ...(sectorIds && sectorIds.length > 0 ? { id: { in: sectorIds } } : {})
        },
        include: {
            tents: {
                include: {
                    bookings: {
                        include: { members: true }
                    }
                }
            }
        }
    });

    // Calculate live occupancy
    const sectorsWithOccupancy = sectors.map((sector: any) => ({
        ...sector,
        tents: sector.tents.map((tent: any) => {
            const occupied = tent.bookings
                .filter((b: any) => b.status === 'CONFIRMED')
                .reduce((sum: number, b: any) => sum + b.members.length, 0);
            return {
                ...tent,
                occupied
            };
        })
    }));

    return sectorsWithOccupancy;
}

export default async function BookingPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    const sectorIds = (session as any)?.assignedSectorIds;

    if (!eventId) {
        return (
            <div className="p-8 text-center text-muted-foreground">
                <p>No event assigned. Please contact a Super Admin or try logging out and back in.</p>
            </div>
        );
    }

    const sectors = await getEventData(eventId, sectorIds);

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">New Booking</h2>
                <p className="text-muted-foreground">Select a tent and add members</p>
            </div>

            <BookingInterface sectors={sectors} />
        </div>
    );
}
