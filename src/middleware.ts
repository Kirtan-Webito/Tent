import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJWT } from '@/lib/auth';

export async function middleware(request: NextRequest) {
    const path = request.nextUrl.pathname;

    // Public paths
    if (path === '/login' || path.startsWith('/_next') || path === '/favicon.ico') {
        return NextResponse.next();
    }

    const token = request.cookies.get('session')?.value;
    const user = token ? await verifyJWT(token) : null;

    // If no user, redirect to login
    if (!user) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    const role = (user as any).role;

    // Role-based protection
    if (path.startsWith('/super-admin') && role !== 'SUPER_ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url)); // Or 403 page
    }

    if (path.startsWith('/event-admin') && role !== 'EVENT_ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    if (path.startsWith('/desk-admin') && role !== 'DESK_ADMIN') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
