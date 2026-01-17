import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { signJWT } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
    try {
        const { email, password } = await req.json();

        if (!email || !password) {
            return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                assignedSectors: {
                    include: {
                        event: true
                    }
                },
                assignedEvent: true
            }
        });

        if (!user) {
            // Use generic error for security
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        const isValid = await bcrypt.compare(password, user.password);

        if (!isValid) {
            return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
        }

        // Check for Event Expiration
        const now = new Date();

        if (user.role === 'EVENT_ADMIN' && user.assignedEvent) {
            const endDate = new Date(user.assignedEvent.endDate);
            if (now > endDate) {
                return NextResponse.json({
                    error: `Access Denied: The event "${user.assignedEvent.name}" has expired.`
                }, { status: 403 });
            }
        } else if ((user.role === 'DESK_ADMIN' || user.role === 'TEAM_HEAD') && user.assignedSectors.length > 0) {
            // Check if user has ANY active event context.
            // If ALL assigned (via sectors) events are expired, deny access.
            const hasActiveEvent = user.assignedSectors.some(sector => {
                return sector.event && new Date(sector.event.endDate) > now;
            });

            if (!hasActiveEvent) {
                // Use the first event name for the error message context
                const eventName = user.assignedSectors[0]?.event?.name || 'Assigned Event';
                return NextResponse.json({
                    error: `Access Denied: The event "${eventName}" has expired.`
                }, { status: 403 });
            }
        }

        // Generate JWT
        const token = await signJWT({
            id: user.id,
            email: user.email,
            role: user.role,
            name: user.name,
            assignedEventId: user.assignedEventId,
            assignedSectorIds: user.assignedSectors.map((s: { id: string }) => s.id)
        });

        // Set Cookie
        const cookieStore = cookies();
        (await cookieStore).set('session', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24, // 1 day
            path: '/',
        });

        return NextResponse.json({
            success: true,
            role: user.role
        });

    } catch (error) {
        console.error('Login error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}
