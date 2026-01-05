export const dynamic = 'force-dynamic';

import { prisma } from '@/lib/prisma';
import UsersClient from './UsersClient';

async function getUsers(roleFilter?: string) {
    const whereClause: any = {
        role: {
            not: 'SUPER_ADMIN',
        }
    };

    if (roleFilter && roleFilter !== 'ALL') {
        whereClause.role = roleFilter;
    }

    return await prisma.user.findMany({
        where: whereClause,
        include: {
            assignedEvent: true,
            assignedSectors: {
                select: {
                    id: true,
                    name: true
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

async function getEvents() {
    return await prisma.event.findMany({
        select: { id: true, name: true }
    });
}

async function getGuests() {
    return await prisma.member.findMany({
        include: {
            booking: {
                include: {
                    tent: {
                        include: {
                            sector: true
                        }
                    },
                    members: true, // Include all family members
                }
            }
        },
        orderBy: { createdAt: 'desc' }
    });
}

export default async function UsersPage() {
    const users = await getUsers('ALL');
    const events = await getEvents();
    const guests = await getGuests();

    return (
        <UsersClient initialUsers={users} events={events} guests={guests} />
    );
}
