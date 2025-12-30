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
