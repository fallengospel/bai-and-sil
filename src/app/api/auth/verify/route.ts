import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid verification token' }, { status: 400 });
    }

    if (new Date() > verificationToken.expiresAt) {
      await prisma.verificationToken.delete({ where: { id: verificationToken.id } });
      return NextResponse.json({ error: 'Verification token has expired' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: verificationToken.userId },
      data: { emailVerified: true },
    });

    await prisma.verificationToken.delete({ where: { id: verificationToken.id } });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('[Verify Email]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
