import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { validatePassword } from '@/lib/validation';

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json();

    if (!token) {
      return NextResponse.json({ error: 'Token is required' }, { status: 400 });
    }

    const passwordErr = validatePassword(password);
    if (passwordErr) {
      return NextResponse.json({ error: 'Validation failed', errors: { password: passwordErr } }, { status: 400 });
    }

    const resetToken = await prisma.resetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return NextResponse.json({ error: 'Invalid or expired reset token' }, { status: 400 });
    }

    if (resetToken.used) {
      return NextResponse.json({ error: 'This reset link has already been used' }, { status: 400 });
    }

    if (new Date() > resetToken.expiresAt) {
      await prisma.resetToken.delete({ where: { id: resetToken.id } });
      return NextResponse.json({ error: 'Reset token has expired' }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { password: hashedPassword },
    });

    await prisma.resetToken.update({
      where: { id: resetToken.id },
      data: { used: true },
    });

    return NextResponse.json({ message: 'Password reset successful' });
  } catch (error) {
    console.error('[Reset Password]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
