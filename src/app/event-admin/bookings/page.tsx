export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import BookingsClient from './BookingsClient';

export default async function BookingsPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    if (!eventId) redirect('/login');

    const bookings = await prisma.booking.findMany({
        where: {
            tent: { sector: { eventId } },
            // Only fetch bookings with actual guest members
            members: {
                some: {}
            }
        },
        include: {
            tent: {
                include: {
                    sector: {
                        select: {
                            name: true
                        }
                    }
                }
            },
            members: true,
            deskAdmin: {
                select: {
                    id: true,
                    name: true,
                    email: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });

    return <BookingsClient initialBookings={bookings as any} />;
}
