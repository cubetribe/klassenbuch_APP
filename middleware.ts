import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    // Admin-only routes
    if (path.startsWith('/admin') && token?.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', req.url));
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/courses/:path*',
    '/students/:path*',
    '/rewards/:path*',
    '/consequences/:path*',
    '/reports/:path*',
    '/settings/:path*',
    '/profile/:path*',
    '/api/courses/:path*',
    '/api/students/:path*',
    '/api/events/:path*',
    '/api/rewards/:path*',
    '/api/consequences/:path*',
    '/api/reports/:path*',
    '/api/user/:path*',
  ],
};