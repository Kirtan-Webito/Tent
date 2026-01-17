import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { revalidatePath } from 'next/cache';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || ((session as any).role !== 'DESK_ADMIN' && (session as any).role !== 'TEAM_HEAD')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const now = new Date();

        // Find bookings that are CONFIRMED and past their checkout date
        const expiredBookings = await prisma.booking.findMany({
            where: {
                status: 'CONFIRMED',
                checkOutDate: {
                    lt: now
                }
            },
            include: {
                members: { take: 1 },
                tent: true
            }
        });

        if (expiredBookings.length === 0) {
            return NextResponse.json({ count: 0, message: "No expired bookings found." });
        }

        const eventId = (session as any).assignedEventId || (session as any).eventId;

        // Create notifications for each overdue booking
        const notifications = await Promise.all(expiredBookings.map(async (b) => {
            const guestName = b.members[0]?.name || 'Guest';
            const message = `Check-out period for ${guestName} (Tent: ${b.tent.name}) has ended. Please process check-out manually.`;

            const notification = await prisma.notification.create({
                data: {
                    eventId,
                    targetRole: 'DESK_ADMIN',
                    type: 'WARNING',
                    message,
                    read: false
                }
            });

            // Emit for real-time delivery
            const { notificationEmitter } = await import('@/lib/events');
            notificationEmitter.emit('new-notification', notification);

            return notification;
        }));

        // Log Action
        await prisma.log.create({
            data: {
                action: 'EXPIRY_SCAN_RUN',
                details: `Overdue scan ran. Notified about ${expiredBookings.length} bookings.`,
                userId: (session as any).id
            }
        });

        revalidatePath('/desk-admin/booking');
        revalidatePath('/desk-admin/guests');

        return NextResponse.json({
            count: expiredBookings.length,
            message: `Scanned and sent ${expiredBookings.length} notifications for overdue check-outs.`
        });

    } catch (error) {
        console.error('Auto Checkout Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
