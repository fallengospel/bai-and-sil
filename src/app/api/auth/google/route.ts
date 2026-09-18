import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const origin = new URL(request.url).origin;
  const redirectUri = `${origin}/api/auth/google/callback`;
  const scope = 'openid email profile';
  const role = new URL(request.url).searchParams.get('role') || 'buyer';

  const allowedRoles = ['buyer', 'seller'];
  const safeRole = allowedRoles.includes(role) ? role : 'buyer';

  const state = Buffer.from(JSON.stringify({ role: safeRole, ts: Date.now() })).toString('base64url');

  const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  url.searchParams.set('client_id', clientId || '');
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('scope', scope);
  url.searchParams.set('access_type', 'offline');
  url.searchParams.set('prompt', 'select_account');
  url.searchParams.set('state', state);

  return NextResponse.redirect(url.toString());
}
