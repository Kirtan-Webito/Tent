import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;

    if (!eventId || (session as any)?.role !== 'EVENT_ADMIN') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { title, name, phone } = await req.json();

    const contact = await prisma.emergencyContact.create({
        data: {
            eventId,
            title,
            name,
            phone,
            order: 0
        }
    });

    return NextResponse.json(contact);
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

    await prisma.emergencyContact.delete({ where: { id } });

    return NextResponse.json({ success: true });
}
