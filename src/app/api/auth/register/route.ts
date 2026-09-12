import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';
import { sendEmail, verificationEmailHtml } from '@/lib/email';
import { v4 as uuidv4 } from 'uuid';

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
        avatar: true,
        location: true,
        phone: true,
        role: true,
        isAdmin: true,
        createdAt: true,
      },
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

    const html = verificationEmailHtml(name, token);
    await sendEmail({
      to: email,
      subject: 'Verify your BAI & SIL email',
      html,
    });

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    console.error('[Register]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
