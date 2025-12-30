import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        if (!session || (session as any).role !== 'DESK_ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const deskAdminId = (session as any).id;
        const { tentId, members, mobile, notes, checkInDate, checkOutDate } = await req.json();

        if (!tentId || !members || members.length === 0) {
            return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
        }

        // Transaction: Create Booking + Create Members + Create Audit Log
        const result = await prisma.$transaction(async (tx: any) => {
            // 1. Create Booking
            const booking = await tx.booking.create({
                data: {
                    tentId,
                    deskAdminId,
                    mobile,
                    notes,
                    checkInDate: checkInDate ? new Date(checkInDate) : null,
                    checkOutDate: checkOutDate ? new Date(checkOutDate) : null,
                    status: 'CONFIRMED'
                }
            });

            // 2. Create Members
            for (const m of members) {
                await tx.member.create({
                    data: {
                        name: m.name,
                        age: parseInt(m.age),
                        gender: m.gender,
                        bookingId: booking.id
                    }
                });
            }

            // 3. Log Action
            await tx.log.create({
                data: {
                    action: 'CREATE_BOOKING',
                    details: `Booking ${booking.id} created for Tent ${tentId} with ${members.length} members.`,
                    userId: deskAdminId
                }
            });

            return booking;
        });

        return NextResponse.json(result);

    } catch (error) {
        console.error('Booking Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
