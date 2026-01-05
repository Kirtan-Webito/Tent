import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function GET() {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const sectors = await prisma.sector.findMany({
            select: {
                id: true,
                name: true
            },
            orderBy: { name: 'asc' }
        });

        return NextResponse.json(sectors);
    } catch (error) {
        console.error('Error fetching sectors:', error);
        return NextResponse.json({ error: 'Error fetching sectors' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'EVENT_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, eventId } = await req.json();

        const sector = await prisma.sector.create({
            data: {
                name,
                eventId
            }
        });

        return NextResponse.json(sector);
    } catch (error) {
        console.error('Error creating sector:', error);
        return NextResponse.json({ error: 'Error creating sector' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'EVENT_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { sectorId } = await req.json();

        if (!sectorId) {
            return NextResponse.json({ error: 'Missing Sector ID' }, { status: 400 });
        }

        // Optional: Check if sector has tents/bookings before deleting?
        // For now, let's assume cascade delete or let Prisma handle it if configured
        await prisma.sector.delete({
            where: { id: sectorId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting sector:', error);
        return NextResponse.json({ error: 'Error deleting sector' }, { status: 500 });
    }
}
