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

function isStateFresh(stateParam: string): boolean {
  try {
    const decoded = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
    if (!decoded.ts || typeof decoded.ts !== 'number') return false;
    return Date.now() - decoded.ts < 10 * 60 * 1000;
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const stateParam = searchParams.get('state');

  if (error) {
    return NextResponse.redirect(new URL(`/login?error=google_cancelled`, request.url));
  }

  if (!code || !stateParam) {
    return NextResponse.redirect(new URL('/login?error=no_code', request.url));
  }

  if (!isStateFresh(stateParam)) {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  }

  let role = 'buyer';
  try {
    const stateData = JSON.parse(Buffer.from(stateParam, 'base64url').toString());
    role = stateData.role || 'buyer';
  } catch {
    return NextResponse.redirect(new URL('/login?error=invalid_state', request.url));
  }

  const allowedRoles = ['buyer', 'seller'];
  if (!allowedRoles.includes(role)) role = 'buyer';

  try {
    const origin = new URL(request.url).origin;
    const redirectUri = `${origin}/api/auth/google/callback`;
    const tokens = await getGoogleTokens(code, redirectUri);
    const googleUser = await getGoogleUserInfo(tokens.access_token);

    if (!googleUser.email) {
      return NextResponse.redirect(new URL('/login?error=no_email', request.url));
    }

    let user = await prisma.user.findUnique({
      where: { email: googleUser.email },
      select: { id: true, name: true, email: true, avatar: true, role: true, isAdmin: true, authProvider: true },
    });

    if (user && user.authProvider !== 'google') {
      return NextResponse.redirect(new URL('/login?error=email_exists', request.url));
    }

    if (user) {
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
      const newUser = await prisma.user.create({
        data: {
          name: googleUser.name,
          email: googleUser.email,
          avatar: googleUser.picture,
          authProvider: 'google',
          emailVerified: true,
          role,
        },
        select: { id: true, name: true, email: true, avatar: true, role: true, isAdmin: true, authProvider: true },
      });
      user = newUser;
    }

    await createSession(user.id);

    return NextResponse.redirect(new URL('/buyer/dashboard', request.url));
  } catch (err) {
    console.error('[Google OAuth]', err);
    return NextResponse.redirect(new URL('/login?error=google_failed', request.url));
  }
}
