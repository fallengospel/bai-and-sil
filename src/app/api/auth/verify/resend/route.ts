import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, verificationEmailHtml } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return NextResponse.json({
        message: 'If an account exists with that email, a verification code has been sent.',
      });
    }

    if (user.emailVerified) {
      return NextResponse.json({
        message: 'If an account exists with that email, a verification code has been sent.',
      });
    }

    await prisma.verificationToken.deleteMany({
      where: { userId: user.id },
    });

    const code = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    const html = verificationEmailHtml(user.name, code);
    const emailSent = await sendEmail({
      to: user.email,
      subject: 'Your BAI & SIL verification code',
      html,
    });

    if (!emailSent) {
      console.error('[Resend] Failed to send verification email to:', user.email);
    }

    return NextResponse.json({
      message: emailSent
        ? 'Verification code sent! Check your inbox.'
        : 'Failed to send email. Please try again later.',
      emailSent,
    });
  } catch (error) {
    console.error('[Resend Verification]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
