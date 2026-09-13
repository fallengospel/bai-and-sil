import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: 'Email and code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Invalid email or code' }, { status: 400 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ message: 'Email already verified' });
    }

    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        userId: user.id,
        code,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!verificationToken) {
      return NextResponse.json({ error: 'Invalid verification code' }, { status: 400 });
    }

    if (new Date() > verificationToken.expiresAt) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id } });
      return NextResponse.json({ error: 'Verification code has expired. Please request a new one.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true },
    });

    await prisma.verificationToken.deleteMany({ where: { userId: user.id } });

    return NextResponse.json({ message: 'Email verified successfully' });
  } catch (error) {
    console.error('[Verify Email]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
