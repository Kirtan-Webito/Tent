import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

// GET: Fetch notes for a booking
export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const { searchParams } = new URL(req.url);
        const bookingId = searchParams.get('bookingId');

        if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 });

        const notes = await prisma.bookingNote.findMany({
            where: { bookingId },
            orderBy: { createdAt: 'desc' }
        });

        return NextResponse.json({ notes });
    } catch (error) {
        console.error('Notes API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

// POST: Add a new note
export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { bookingId, content } = await req.json();

    if (!bookingId || !content) {
        return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const note = await prisma.bookingNote.create({
        data: {
            bookingId,
            content,
            author: session.name || 'Admin', // Fallback if name is missing
        }
    });

    return NextResponse.json({ note });
}
