export const dynamic = 'force-dynamic';

import { Suspense } from 'react';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import BookingInterface from '@/app/desk-admin/booking/booking-interface';
import { naturalSort } from '@/lib/utils/naturalSort';

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
                        where: {
                            // Only fetch bookings with actual guest members (not admin users)
                            members: {
                                some: {}
                            }
                        },
                        include: {
                            members: true,
                            deskAdmin: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Calculate live occupancy - only count CONFIRMED bookings with members
    const sectorsWithOccupancy = sectors.map((sector: any) => ({
        ...sector,
        tents: sector.tents.map((tent: any) => {
            // Filter for active bookings only
            const activeBookings = tent.bookings.filter((b: any) =>
                b.status === 'CONFIRMED' && b.members && b.members.length > 0
            );

            const occupied = activeBookings.reduce(
                (sum: number, b: any) => sum + b.members.length,
                0
            );

            // Sort bookings by creation date (newest first)
            const sortedBookings = [...tent.bookings].sort((a: any, b: any) =>
                new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
            );

            return {
                ...tent,
                occupied,
                bookings: sortedBookings
            };
        })
    }));

    // Sort sectors by name using natural sort
    const sortedSectors = sectorsWithOccupancy.sort((a, b) =>
        naturalSort(a.name, b.name)
    );

    // Sort tents within each sector using natural sort
    sortedSectors.forEach(sector => {
        sector.tents.sort((a: any, b: any) => naturalSort(a.name, b.name));
    });

    return sortedSectors;
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

            <Suspense fallback={<div className="p-8 text-center text-muted-foreground">Loading interface...</div>}>
                <BookingInterface initialSectors={sectors} />
            </Suspense>
        </div>
    );
}
