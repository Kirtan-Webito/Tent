import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await getSession();
    const userId = (session as any)?.userId || (session as any)?.id;

    if (!userId) {
        console.error('Checkout failed: User ID missing from session', session);
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { bookingId } = await req.json();

    if (!bookingId) {
        return NextResponse.json({ error: 'Booking ID required' }, { status: 400 });
    }

    // Update booking status to CHECKED_OUT and record timestamp
    const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: {
            status: 'CHECKED_OUT',
            checkOutTime: new Date()
        }
    });

    // Log the activity
    await prisma.log.create({
        data: {
            action: 'CHECK_OUT',
            details: `Checked out booking ${bookingId}`,
            userId
        }
    });

    return NextResponse.json({ success: true, booking });
}
