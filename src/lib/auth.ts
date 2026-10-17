import { cookies } from 'next/headers';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET);

interface SessionUser {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
  isAdmin: boolean;
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export async function createSession(userId: string) {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  const token = await new SignJWT({ userId, role: user?.role || 'buyer' })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(SECRET);

  const cookieStore = cookies();
  (await cookieStore).set('session', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });

  return token;
}

export async function getSession(): Promise<SessionUser | null> {
  let userId: string | null = null;

  // Cookie/JWT problems mean "no session" — safe to swallow.
  try {
    const cookieStore = cookies();
    const sessionCookie = (await cookieStore).get('session');
    if (!sessionCookie?.value) return null;

    const { payload } = await jwtVerify(sessionCookie.value, SECRET);
    userId = (payload.userId as string) || null;
  } catch (error) {
    console.error('[auth] getSession: invalid session token:', error);
    return null;
  }

  if (!userId) return null;

  // DB lookup failures propagate so outages surface as 500s instead of
  // silently logging every user out (findUnique returns null only when the
  // user truly no longer exists).
  return prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, avatar: true, role: true, isAdmin: true },
  });
}

export async function destroySession() {
  const cookieStore = cookies();
  (await cookieStore).delete('session');
}

export async function requireAuth() {
  const user = await getSession();
  if (!user) throw new Error('Unauthorized');
  return user;
}

export async function requireAdmin() {
  const user = await getSession();
  if (!user) throw new Error('Unauthorized');
  if (!user.isAdmin) throw new Error('Forbidden');
  return user;
}
