import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { checkRateLimit } from './lib/rate-limit';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

async function verifyToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload as { userId: string; role: string };
  } catch {
    return null;
  }
}

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  const realIP = request.headers.get('x-real-ip');
  if (realIP) return realIP;
  return '127.0.0.1';
}

function addSecurityHeaders(response: NextResponse, request: NextRequest): NextResponse {
  const origin = request.nextUrl.origin;

  // Strict-Transport-Security
  response.headers.set(
    'Strict-Transport-Security',
    'max-age=63072000; includeSubDomains; preload'
  );

  // X-Content-Type-Options
  response.headers.set('X-Content-Type-Options', 'nosniff');

  // X-Frame-Options
  response.headers.set('X-Frame-Options', 'DENY');

  // X-XSS-Protection
  response.headers.set('X-XSS-Protection', '1; mode=block');

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), interest-cohort=()'
  );

  // Content Security Policy
  const cspDirectives = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.speed-insights.com https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https://images.pexels.com https://*.pexels.com https://lh3.googleusercontent.com",
    "connect-src 'self' https://api.resend.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ');

  response.headers.set('Content-Security-Policy', cspDirectives);

  // CORS headers for API routes
  if (request.nextUrl.pathname.startsWith('/api')) {
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Max-Age', '86400');
  }

  return response;
}

export async function middleware(request: NextRequest) {
  const session = request.cookies.get('session')?.value;
  const { pathname } = request.nextUrl;
  const clientIP = getClientIP(request);

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    // Skip rate limiting for static assets and notifications count
    if (pathname === '/api/notifications/count') {
      return addSecurityHeaders(NextResponse.next(), request);
    }

    const { allowed, remaining, resetTime } = checkRateLimit(clientIP, pathname);

    if (!allowed) {
      return new NextResponse(
        JSON.stringify({ error: 'Too many requests. Please try again later.' }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(Math.ceil((resetTime - Date.now()) / 1000)),
            'X-RateLimit-Limit': '60',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.ceil(resetTime / 1000)),
          },
        }
      );
    }

    // Add rate limit headers to successful responses
    const response = NextResponse.next();
    response.headers.set('X-RateLimit-Remaining', String(remaining));
    return addSecurityHeaders(response, request);
  }

  // Protected paths check
  const protectedPaths = ['/sell', '/messages', '/favorites', '/notifications', '/profile/me', '/my-listings', '/offers', '/seller/dashboard', '/buyer/dashboard'];
  const adminPaths = ['/admin'];
  const isEditPage = /^\/listing\/[^/]+\/edit$/.test(pathname);

  const isProtected = protectedPaths.some((p) => pathname.startsWith(p));
  const isAdmin = adminPaths.some((p) => pathname.startsWith(p));

  if (isProtected || isAdmin || isEditPage) {
    if (!session) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl), request);
    }

    const payload = await verifyToken(session);
    if (!payload) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return addSecurityHeaders(NextResponse.redirect(loginUrl), request);
    }

    if (isAdmin && payload.role !== 'admin') {
      return addSecurityHeaders(NextResponse.redirect(new URL('/', request.url)), request);
    }
  }

  return addSecurityHeaders(NextResponse.next(), request);
}

export const config = {
  matcher: [
    '/sell/:path*',
    '/messages/:path*',
    '/favorites',
    '/notifications',
    '/profile/me',
    '/my-listings',
    '/offers',
    '/seller/dashboard',
    '/buyer/dashboard',
    '/listing/:slug/edit',
    '/admin/:path*',
    '/api/:path*',
  ],
};
