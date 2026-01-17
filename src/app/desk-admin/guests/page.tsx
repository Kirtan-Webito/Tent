export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { ExclamationTriangleIcon, PersonIcon } from '@radix-ui/react-icons';
import { naturalSort } from '@/lib/utils/naturalSort';

import GuestsClient from './guests-client';

async function getGuests(eventId: string, sectorIds?: string[]) {
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
                            // Only fetch bookings with actual guest members
                            members: {
                                some: {}
                            }
                        },
                        include: {
                            members: true,
                            deskAdmin: {
                                select: {
                                    id: true,
                                    name: true
                                }
                            }
                        }
                    }
                }
            }
        }
    });

    // Flatten to guest list with proper filtering
    const guests = sectors.flatMap((s: any) =>
        s.tents.flatMap((t: any) =>
            t.bookings?.flatMap((b: any) =>
                // Only include members from bookings (never admin users)
                b.members.map((m: any) => ({
                    ...m,
                    bookingId: b.id,
                    bookingStatus: b.status,
                    tentName: t.name,
                    sectorName: s.name,
                    checkIn: b.checkInDate,
                    checkOut: b.checkOutDate,
                    mobile: b.mobile,
                    notes: b.notes,
                    deskAdminName: b.deskAdmin?.name || 'N/A',
                    groupMembers: b.members.map((member: any) => ({
                        id: member.id,
                        name: member.name,
                        age: member.age,
                        gender: member.gender
                    }))
                }))
            ) || []
        )
    );

    return guests;
}

export default async function GuestsPage() {
    const session = await getSession();
    const role = (session as any)?.role;

    // Role Restriction: Allowed for DESK_ADMIN, TEAM_HEAD, EVENT_ADMIN, and SUPER_ADMIN
    const allowedRoles = ['DESK_ADMIN', 'TEAM_HEAD', 'EVENT_ADMIN', 'SUPER_ADMIN'];
    if (!allowedRoles.includes(role)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8 bg-white rounded-3xl border border-border shadow-sm">
                <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mb-4">
                    <ExclamationTriangleIcon className="w-8 h-8" />
                </div>
                <h2 className="text-xl font-bold text-foreground">Access Restricted</h2>
                <p className="text-muted-foreground mt-2 max-w-md">
                    The Guest Directory is restricted.
                    Please contact your administrator if you believe this is an error.
                </p>
            </div>
        );
    }

    const eventId = (session as any)?.assignedEventId || (session as any)?.eventId;
    const sectorIds = (session as any)?.assignedSectorIds;

    if (!eventId) return <div className="p-8 text-gray-500">No event assigned.</div>;

    const guests = await getGuests(eventId, sectorIds);

    return <GuestsClient initialGuests={guests} userRole={role} />;
}
