import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendEmail, verificationEmailHtml } from '@/lib/email';

function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, location, phone, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
    }

    if (role && !['buyer', 'seller'].includes(role)) {
      return NextResponse.json({ error: 'Invalid role. Must be buyer or seller' }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        location: location || null,
        phone: phone || null,
        role: role || 'buyer',
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
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

    const html = verificationEmailHtml(name, code);
    await sendEmail({
      to: email,
      subject: 'Your BAI & SIL verification code',
      html,
    });

    return NextResponse.json({ user, requiresVerification: true }, { status: 201 });
  } catch (error) {
    console.error('[Register]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
