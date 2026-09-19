import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, verificationEmailHtml } from '@/lib/email';
import { validateEmail } from '@/lib/validation';
import crypto from 'crypto';

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    const emailErr = validateEmail(email);
    if (emailErr) {
      return NextResponse.json({ error: 'Validation failed', errors: { email: emailErr } }, { status: 400 });
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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
