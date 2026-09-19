import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendEmail, resetPasswordEmailHtml } from '@/lib/email';
import { validateEmail } from '@/lib/validation';

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
        message: 'If an account exists with that email, a reset link has been sent.',
      });
    }

    await prisma.resetToken.deleteMany({
      where: { userId: user.id, used: false },
    });

    const token = crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    await prisma.resetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const html = resetPasswordEmailHtml(user.name, token);
    await sendEmail({
      to: user.email,
      subject: 'Reset your BAI & SIL password',
      html,
    });

    return NextResponse.json({
      message: 'If an account exists with that email, a reset link has been sent.',
    });
  } catch (error) {
    console.error('[Forgot Password]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
