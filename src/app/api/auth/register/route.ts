import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, location, phone, role } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
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

    await createSession(user.id);

    return NextResponse.json({ user }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
