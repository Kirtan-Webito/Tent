import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
    try {
        const session = await getSession();
        const currentUser = session as any;

        // Only allow Super Admin (for Event Admins) or Event Admin (for Desk Admins)
        if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'EVENT_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { name, email, password, role, eventId, assignedSectorIds } = await req.json();

        if (!name || !email || !password || !role) {
            return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role,
                assignedEventId: eventId || (currentUser.role === 'EVENT_ADMIN' ? currentUser.assignedEventId : null),
                assignedSectors: assignedSectorIds ? {
                    connect: assignedSectorIds.map((id: string) => ({ id }))
                } : undefined,
            },
        });

        return NextResponse.json({ id: user.id, email: user.email });
    } catch (error: any) {
        console.error('Create User Error:', error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'A user with this email address already exists.'
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function PATCH(req: Request) {
    try {
        const session = await getSession();
        const currentUser = session as any;

        if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'EVENT_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { id, name, email, password, assignedSectorIds, eventId } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (password) updateData.password = await bcrypt.hash(password, 10);
        if (eventId) updateData.assignedEventId = eventId;

        if (assignedSectorIds) {
            updateData.assignedSectors = {
                set: assignedSectorIds.map((id: string) => ({ id }))
            };
        }

        const user = await prisma.user.update({
            where: { id },
            data: updateData,
        });

        return NextResponse.json({ success: true, id: user.id });
    } catch (error: any) {
        console.error('Update User Error:', error);

        if (error.code === 'P2002') {
            return NextResponse.json({
                error: 'A user with this email address already exists.'
            }, { status: 409 });
        }

        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function DELETE(req: Request) {
    try {
        const session = await getSession();
        const currentUser = session as any;

        if (!currentUser || (currentUser.role !== 'SUPER_ADMIN' && currentUser.role !== 'EVENT_ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { userId } = await req.json();

        if (!userId) {
            return NextResponse.json({ error: 'Missing User ID' }, { status: 400 });
        }

        // Prevent deleting yourself
        if (userId === currentUser.id) {
            return NextResponse.json({ error: 'Cannot delete yourself' }, { status: 400 });
        }

        await prisma.user.delete({
            where: { id: userId }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Delete User Error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
