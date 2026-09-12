import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, verificationEmailHtml } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with that email, a verification link has been sent.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: 'If an account exists with that email, a verification link has been sent.',
      });
    }

    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    const token = uuidv4();
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const html = verificationEmailHtml(user.name, token);
    await sendEmail({
      to: user.email,
      subject: 'Verify your BAI & SIL email',
      html,
    });

    return NextResponse.json({
      message: 'If an account exists with that email, a verification link has been sent.',
    });
  } catch (error) {
    console.error('[Resend Verification]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
