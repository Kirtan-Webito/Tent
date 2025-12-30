import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function DELETE(
    req: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'EVENT_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await params;

        // Check if there are any active bookings
        const activeBookings = await prisma.booking.count({
            where: {
                tentId: id,
                status: { in: ['CONFIRMED', 'CHECKED_IN'] }
            }
        });

        if (activeBookings > 0) {
            return NextResponse.json({
                error: 'Cannot delete tent with active bookings. Please check out guests first.'
            }, { status: 400 });
        }

        await prisma.tent.delete({
            where: { id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Tent Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
