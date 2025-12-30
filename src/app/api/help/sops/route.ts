import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;

    if (!eventId || (session as any)?.role !== 'EVENT_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { rule } = await req.json();

    const sop = await prisma.sOP.create({
        data: {
            eventId,
            rule,
            order: 0
        }
    });

    return NextResponse.json(sop);
}

export async function DELETE(req: Request) {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;

    if (!eventId || (session as any)?.role !== 'EVENT_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    }

    await prisma.sOP.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
