import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
    try {
        const session = await getSession();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

        const eventId = (session as any).assignedEventId || (session as any).eventId;
        const userRole = (session as any).role;

        // Fetch notifications for THIS event + system-wide ones 
        // AND filter by targetRole (ALL or matching user's role)
        const notifications = await prisma.notification.findMany({
            where: {
                OR: [
                    { eventId: eventId || undefined },
                    { eventId: null }
                ],
                AND: [
                    {
                        OR: [
                            { targetRole: null },
                            { targetRole: 'ALL' },
                            { targetRole: userRole }
                        ]
                    }
                ]
            },
            orderBy: { createdAt: 'desc' },
            take: 30
        });

        const unreadCount = await prisma.notification.count({
            where: {
                OR: [
                    { eventId: eventId || undefined },
                    { eventId: null }
                ],
                AND: [
                    {
                        OR: [
                            { targetRole: null },
                            { targetRole: 'ALL' },
                            { targetRole: userRole }
                        ]
                    }
                ],
                read: false
            }
        });

        return NextResponse.json({ notifications, unreadCount });
    } catch (error: any) {
        console.error('Notifications GET Error:', error);
        return NextResponse.json({
            error: 'Internal Server Error',
            message: error.message,
            code: error.code
        }, { status: 500 });
    }
}

export async function POST(req: Request) {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { notificationIds, message, type, isSystemWide, targetRole } = body;

    // 1. Mark as read
    if (notificationIds && Array.isArray(notificationIds)) {
        await prisma.notification.updateMany({
            where: { id: { in: notificationIds } },
            data: { read: true }
        });
        return NextResponse.json({ success: true });
    }

    // 2. Create Broadcast
    if (message) {
        const role = (session as any).role;
        const currentEventId = (session as any).assignedEventId || (session as any).eventId;

        if (role !== 'EVENT_ADMIN' && role !== 'SUPER_ADMIN') {
            return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
        }

        // Fix 400 error: Super Admin can send without event context
        const targetEventId = isSystemWide ? null : (body.eventId || currentEventId);

        // Validation for Event Admins: They MUST have an eventId and cannot send system-wide
        if (role === 'EVENT_ADMIN') {
            if (!currentEventId) {
                return NextResponse.json({ error: 'Event Admin lacks event context' }, { status: 400 });
            }
            if (isSystemWide) {
                return NextResponse.json({ error: 'Event Admins cannot send system-wide messages' }, { status: 403 });
            }
        }

        const notification = await prisma.notification.create({
            data: {
                eventId: targetEventId,
                targetRole: targetRole || 'ALL',
                message,
                type: type || 'INFO',
                read: false
            }
        });

        await prisma.log.create({
            data: {
                action: 'BROADCAST',
                details: `Sent ${targetEventId ? 'event' : 'global'} broadcast to ${targetRole || 'ALL'}: ${message}`,
                userId: (session as any).userId || (session as any).id
            }
        });

        return NextResponse.json({ success: true, notification });
    }

    return NextResponse.json({ success: true });
}
