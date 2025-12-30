import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import HelpManagementClient from './HelpManagementClient';

export default async function EventAdminHelpPage() {
    const session = await getSession();
    const eventId = (session as any)?.assignedEventId;
    if (!eventId) redirect('/login');

    const [contacts, sops] = await Promise.all([
        prisma.emergencyContact.findMany({
            where: { eventId },
            orderBy: { order: 'asc' }
        }),
        prisma.sOP.findMany({
            where: { eventId },
            orderBy: { order: 'asc' }
        })
    ]);

    return <HelpManagementClient initialContacts={contacts as any} initialSOPs={sops as any} />;
}
