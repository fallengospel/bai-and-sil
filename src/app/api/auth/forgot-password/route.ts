import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // In production, this would send an actual reset email.
    // For now, we always return success to prevent email enumeration.
    return NextResponse.json({
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
