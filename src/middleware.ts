import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { prisma } from './lib/prisma';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/sell', '/messages', '/favorites', '/notifications', '/profile/me', '/my-listings', '/offers', '/seller/dashboard', '/buyer/dashboard'];
  const adminPaths = ['/admin'];

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if (isProtected || isAdmin) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    const payload = await verifyToken(session);
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    if (isAdmin && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/sell/:path*', '/messages/:path*', '/favorites', '/notifications', '/profile/me', '/my-listings', '/offers', '/seller/dashboard', '/buyer/dashboard', '/admin/:path*'],
};
