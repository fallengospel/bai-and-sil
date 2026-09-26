import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { jwtVerify } from 'jose';
import GoogleRegisterClient from './GoogleRegisterClient';

const secret = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || 'fallback-secret');

export const dynamic = 'force-dynamic';

export default async function GoogleRegisterPage() {
  const pending = cookies().get('google_pending')?.value;

  let profile: { name?: string; email?: string; avatar?: string } | null = null;
  if (pending) {
    try {
      const { payload } = await jwtVerify(pending, secret);
      profile = payload as { name?: string; email?: string; avatar?: string };
    } catch {
      profile = null;
    }
  }

  if (!profile?.email) {
    redirect('/register?error=no_google_session');
  }

  return (
    <GoogleRegisterClient
      name={profile.name ?? null}
      email={profile.email}
      avatar={profile.avatar ?? null}
    />
  );
}
