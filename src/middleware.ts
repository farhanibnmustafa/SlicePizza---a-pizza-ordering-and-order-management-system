import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
    const { pathname } = req.nextUrl;

    // Only run on admin routes
    if (!pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    const session = req.auth;

    // Not logged in → redirect to home
    if (!session || !session.user) {
        return NextResponse.redirect(new URL('/', req.url));
    }

    // Check if user has admin or staff role
    const isAdmin = session.user && ((session.user as { role?: string }).role === 'admin' || (session.user as { role?: string }).role === 'staff');

    if (!isAdmin) {
        return NextResponse.redirect(new URL('/admin/unauthorized', req.url));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ['/admin/:path*'],
};
