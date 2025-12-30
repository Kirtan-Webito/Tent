import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q');
    const eventId = (session as any).assignedEventId;

    if (!query || query.length < 2 || !eventId) {
        return NextResponse.json({ results: [] });
    }

    const searchTerm = query.toLowerCase();

    // Parallel search across models
    try {
        const [bookings, guests, tents] = await Promise.all([
            // Search Bookings (ID or Mobile)
            prisma.booking.findMany({
                where: {
                    tent: {
                        sector: { eventId }
                    },
                    OR: [
                        { id: { contains: query } },
                        { mobile: { contains: query } }
                    ]
                },
                include: { tent: true, members: true },
                take: 5
            }),
            // Search Guests (Name)
            prisma.member.findMany({
                where: {
                    booking: {
                        tent: {
                            sector: { eventId }
                        }
                    },
                    name: { contains: query }
                },
                include: { booking: { include: { tent: true } } },
                take: 5
            }),
            // Search Tents (Name)
            prisma.tent.findMany({
                where: {
                    sector: { eventId },
                    name: { contains: query }
                },
                include: { sector: true, bookings: { where: { status: 'CONFIRMED' } } },
                take: 3
            })
        ]);

        const role = (session as any).role;
        const baseBookingUrl = role === 'DESK_ADMIN' ? '/desk-admin/guests' : '/event-admin/bookings';
        const baseTentUrl = role === 'DESK_ADMIN' ? '/desk-admin/guests' : '/event-admin/tents'; // Desk admin might not have a dedicated tent view, redirect to guests for context or just guests.

        const results = [
            ...bookings.map((b: any) => ({
                id: b.id,
                type: 'BOOKING',
                title: `Booking #${b.id.slice(0, 8)}`,
                subtitle: `${b.members[0]?.name || 'Unknown'} • ${b.tent.name}`,
                status: b.status,
                url: `${baseBookingUrl}?highlight=${b.id}`
            })),
            ...guests.map((g: any) => ({
                id: g.id,
                type: 'GUEST',
                title: g.name,
                subtitle: `Guest in ${g.booking.tent.name}`,
                status: g.booking.status,
                url: `${baseBookingUrl}?highlight=${g.booking.id}`
            })),
            ...(role !== 'DESK_ADMIN' ? tents.map((t: any) => ({
                id: t.id,
                type: 'TENT',
                title: `Tent ${t.name}`,
                subtitle: `Sector ${t.sector.name} • ${t.capacity} Person`,
                status: t.status,
                url: `${baseTentUrl}?highlight=${t.id}`
            })) : []) // Hide tents from desk admin if they don't have a view
        ];

        return NextResponse.json({ results });
    } catch (error) {
        console.error('Search API Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
