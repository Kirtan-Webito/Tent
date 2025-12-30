import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'DESK_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();

        // Transaction: Find expired bookings -> Update them -> Log
        const result = await prisma.$transaction(async (tx) => {
            // 1. Find bookings that are CONFIRMED and past their checkout date
            // Note: In a real app, you might want to buffer by an hour or so.
            // Here we assume rigid strict checkout.

            const expiredBookings = await tx.booking.findMany({
                where: {
                    status: 'CONFIRMED',
                    checkOutDate: {
                        lt: now
                    }
                }
            });

            if (expiredBookings.length === 0) {
                return { count: 0, message: "No expired bookings found." };
            }

            // 2. Update them
            const updateResult = await tx.booking.updateMany({
                where: {
                    id: { in: expiredBookings.map(b => b.id) }
                },
                data: {
                    status: 'CHECKED_OUT'
                }
            });

            // 3. Log Action
            await tx.log.create({
                data: {
                    action: 'AUTO_CHECKOUT_RUN',
                    details: `Auto-checkout routine ran. Checked out ${updateResult.count} bookings. IDs: ${expiredBookings.map(b => b.id).join(', ')}`,
                    userId: (session as any).id
                }
            });

            return updateResult;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Auto Checkout Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
