import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';

export async function getSession() {
    const cookieStore = cookies();
    const token = (await cookieStore).get('session')?.value;
    if (!token) return null;
    return await verifyJWT(token);
}
