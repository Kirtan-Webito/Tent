import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export interface Session {
    id: string;
    email: string;
    role: string;
    name: string | null;
    assignedEventId?: string | null;
    assignedSectorId?: string | null;
}

export async function getSession(): Promise<Session | null> {
    const cookieStore = cookies();
    const token = (await cookieStore).get('session')?.value;
    if (!token) return null;
    return await verifyJWT(token) as unknown as Session;
}
