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
            tent: { sector: { eventId } }
        },
        include: {
            tent: true,
            members: true
        },
        orderBy: { createdAt: 'desc' }
    });

    return <BookingsClient initialBookings={bookings as any} />;
}
