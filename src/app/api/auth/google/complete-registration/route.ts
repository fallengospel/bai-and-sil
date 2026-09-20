import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { jwtVerify } from 'jose';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export async function POST(request: NextRequest) {
  try {
    const { role } = await request.json();

    const allowedRoles = ['buyer', 'seller'];
    if (!allowedRoles.includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Choose buyer or seller.' }, { status: 400 });
    }

    // Read the google_pending cookie
    const pendingCookie = request.cookies.get('google_pending')?.value;
    if (!pendingCookie) {
      return NextResponse.json({ error: 'Session expired. Please sign in with Google again.' }, { status: 401 });
    }

    // Verify and decode the pending token
    let payload: any;
    try {
      const { payload: verified } = await jwtVerify(pendingCookie, secret);
      payload = verified;
    } catch {
      return NextResponse.json({ error: 'Session expired. Please sign in with Google again.' }, { status: 401 });
    }

    const { name, email, avatar, googleSub } = payload;
    if (!email) {
      return NextResponse.json({ error: 'Invalid session data.' }, { status: 400 });
    }

    // Check if user already exists (race condition protection)
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true, authProvider: true },
    });

    if (existingUser) {
      // User was created in the meantime (e.g., duplicate tab) — just log them in
      const session = await createSession(existingUser.id);
      const response = NextResponse.json({ success: true, isAdmin: false });
      response.cookies.set('session', session, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
      });
      // Clear the pending cookie
      response.cookies.set('google_pending', '', { maxAge: 0, path: '/' });
      return response;
    }

    // Create the user
    const user = await prisma.user.create({
      data: {
        name: name || 'Google User',
        email,
        avatar: avatar || null,
        authProvider: 'google',
        emailVerified: true,
        role,
      },
      select: { id: true, isAdmin: true },
    });

    // Create session
    const session = await createSession(user.id);

    const response = NextResponse.json({ success: true, isAdmin: user.isAdmin });
    response.cookies.set('session', session, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
      path: '/',
    });
    // Clear the pending cookie
    response.cookies.set('google_pending', '', { maxAge: 0, path: '/' });

    return response;
  } catch (err) {
    console.error('[Google Complete Registration]', err);
    return NextResponse.json({ error: 'Registration failed. Please try again.' }, { status: 500 });
  }
}
