import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, location, startDate, endDate } = await req.json();

        if (!name || !location || !startDate || !endDate) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const event = await prisma.event.create({
            data: {
                name,
                location,
                startDate: new Date(startDate),
                endDate: new Date(endDate),
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error('Create Event Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, location, startDate, endDate } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing Event ID' }, { status: 400 });
        }

        const event = await prisma.event.update({
            where: { id },
            data: {
                name,
                location,
                startDate: startDate ? new Date(startDate) : undefined,
                endDate: endDate ? new Date(endDate) : undefined,
            },
        });

        return NextResponse.json(event);
    } catch (error) {
        console.error('Update Event Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing Event ID' }, { status: 400 });
        }

        await prisma.event.delete({
            where: { id },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete Event Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
