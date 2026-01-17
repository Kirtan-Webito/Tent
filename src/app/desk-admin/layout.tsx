import { getSession } from '@/lib/session';
import { redirect } from 'next/navigation';
import DeskAdminShell from './desk-admin-shell';

export default async function DeskAdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();

    if (!session) {
        redirect('/login');
    }

    return (
        <DeskAdminShell role={session.role}>
            {children}
        </DeskAdminShell>
    );
}
