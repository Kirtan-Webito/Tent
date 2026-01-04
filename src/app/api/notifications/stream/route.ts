import { getSession } from '@/lib/session';
import { notificationEmitter } from '@/lib/events';
import { NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    const session = await getSession();
    if (!session) {
        return new Response('Unauthorized', { status: 401 });
    }

    const userRole = (session as any).role;
    const eventId = (session as any).assignedEventId || (session as any).eventId;

    const stream = new ReadableStream({
        start(controller) {
            const encoder = new TextEncoder();

            const onNotification = (notification: any) => {
                // Filter notification based on target audience and event context
                const isForEvent = !notification.eventId || notification.eventId === eventId;
                const isForRole = !notification.targetRole ||
                    notification.targetRole === 'ALL' ||
                    notification.targetRole === userRole;

                if (isForEvent && isForRole) {
                    controller.enqueue(encoder.encode(`data: ${JSON.stringify(notification)}\n\n`));
                }
            };

            // Keep-alive heartbeat every 15 seconds
            const heartbeat = setInterval(() => {
                controller.enqueue(encoder.encode(': heartbeat\n\n'));
            }, 15000);

            notificationEmitter.on('new-notification', onNotification);

            req.signal.addEventListener('abort', () => {
                clearInterval(heartbeat);
                notificationEmitter.off('new-notification', onNotification);
                controller.close();
            });
        }
    });

    return new Response(stream, {
        headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache, no-transform',
            'Connection': 'keep-alive',
        },
    });
}
