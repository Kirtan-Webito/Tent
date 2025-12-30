import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'DESK_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { bookingId, newCheckOutDate } = await req.json();

        if (!bookingId || !newCheckOutDate) {
            return NextResponse.json({ error: 'Missing Booking ID or New Date' }, { status: 400 });
        }

        // Transaction: Update Booking Date + Log
        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Update Booking
            const booking = await tx.booking.update({
                where: { id: bookingId },
                data: {
                    checkOutDate: new Date(newCheckOutDate)
                }
            });

            // 2. Log Action
            await tx.log.create({
                data: {
                    action: 'EXTEND_BOOKING',
                    details: `Booking ${bookingId} extended to ${newCheckOutDate} by ${(session as any).user?.email || 'Unknown'}`,
                    userId: (session as any).id
                }
            });

            return booking;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Extend Booking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
