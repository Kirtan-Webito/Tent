import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId, isVIP } = await req.json();

    if (!bookingId || typeof isVIP !== 'boolean') {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const booking = await prisma.booking.update({
        where: { id: bookingId },
        data: { isVIP }
    });

    return NextResponse.json({ booking });
}
