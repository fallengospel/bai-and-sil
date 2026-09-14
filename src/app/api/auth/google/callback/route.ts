import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';

interface GoogleTokenResponse {
  access_token: string;
  id_token: string;
  token_type: string;
  expires_in: number;
}

interface GoogleUserInfo {
  sub: string;
  name: string;
  email: string;
  picture: string;
  email_verified: boolean;
}

async function getGoogleTokens(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Google token exchange failed: ${error}`);
  }

  return res.json();
}

async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    throw new Error('Failed to fetch Google user info');
  }

  return res.json();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=google_cancelled`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  try {
    const redirectUri = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`;
    const tokens = await getGoogleTokens(code, redirectUri);
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url));
    }

    // Find existing user by email
    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      select: { id: true, name: true, email: true, avatar: true, role: true, isAdmin: true, authProvider: true },
    });

    if (user) {
      // User exists - update avatar if Google has a better one
      if (googleUser.picture && user.avatar !== googleUser.picture) {
        await prisma.user.update({
          where: { id: user.id },
          data: {
            avatar: googleUser.picture,
            emailVerified: true,
          },
        });
        user.avatar = googleUser.picture;
      }
    } else {
      // Create new user
      const newUser = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          authProvider: 'google',
          emailVerified: true,
          role: 'buyer',
        },
        select: { id: true, name: true, email: true, avatar: true, role: true, isAdmin: true, authProvider: true },
      });
      user = newUser;
    }

    // Create session
    await createSession(user.id);

    return NextResponse.redirect(new URL('/buyer/dashboard', request.url));
  } catch (err) {
    console.error('[Google OAuth]', err);
    return NextResponse.redirect(new URL('/login?error=google_failed', request.url));
  }
}
