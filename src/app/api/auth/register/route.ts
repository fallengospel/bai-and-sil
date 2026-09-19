import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth';
import { sendEmail, verificationEmailHtml } from '@/lib/email';
import { validateRegistration, sanitizeInput } from '@/lib/validation';
import crypto from 'crypto';

function generateOTP(): string {
  return crypto.randomInt(100000, 999999).toString();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const validation = validateRegistration(body);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', errors: validation.errors }, { status: 400 });
    }

    const { name, email, password, location, phone, role } = body;

    const sanitizedName = sanitizeInput(name);
    const sanitizedEmail = sanitizeInput(email);

    const existingUser = await prisma.user.findUnique({ where: { email: sanitizedEmail } });
    if (existingUser) {
      return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name: sanitizedName,
        email: sanitizedEmail,
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
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await prisma.verificationToken.create({
      data: {
        userId: user.id,
        code,
        expiresAt,
      },
    });

    const html = verificationEmailHtml(name, code);
    const emailSent = await sendEmail({
      to: email,
      subject: 'Your BAI & SIL verification code',
      html,
    });

    if (!emailSent) {
      console.error('[Register] Failed to send verification email to:', email);
    }

    return NextResponse.json({
      user,
      requiresVerification: true,
      emailSent,
    }, { status: 201 });
  } catch (error) {
    console.error('[Register]', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
