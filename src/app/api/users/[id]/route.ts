import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth, getSession } from '@/lib/auth';
import { validateUpdateProfile, sanitizeInput } from '@/lib/validation';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        avatar: true,
        location: true,
        bio: true,
        phone: true,
        phonePublic: true,
        role: true,
        rating: true,
        reviewCount: true,
        verified: true,
        createdAt: true,
        _count: {
          select: { listings: true },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const session = await getSession();
    if (!user.phonePublic && session?.id !== user.id) {
      user.phone = null;
    }

    return NextResponse.json({ user });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    if (user.id !== params.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const validation = validateUpdateProfile(body);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', errors: validation.errors }, { status: 400 });
    }

    const { name, avatar, location, bio, phone, phonePublic } = body;

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name: sanitizeInput(name) }),
        ...(avatar !== undefined && { avatar }),
        ...(location !== undefined && { location: sanitizeInput(location) }),
        ...(bio !== undefined && { bio: sanitizeInput(bio) }),
        ...(phone !== undefined && { phone: sanitizeInput(phone) }),
        ...(phonePublic !== undefined && { phonePublic: !!phonePublic }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        location: true,
        bio: true,
        phone: true,
        phonePublic: true,
        role: true,
        isAdmin: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
