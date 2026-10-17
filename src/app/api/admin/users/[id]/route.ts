import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAdmin } from '@/lib/auth';

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
    const body = await request.json();

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const { isAdmin, emailVerified, phoneVerified } = body;

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(isAdmin !== undefined && { isAdmin }),
        ...(emailVerified !== undefined && { emailVerified }),
        ...(phoneVerified !== undefined && { phoneVerified }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isAdmin: true,
        emailVerified: true,
        phoneVerified: true,
      },
    });

    return NextResponse.json({ user: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();

    const user = await prisma.user.findUnique({ where: { id: params.id } });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (user.isAdmin) {
      return NextResponse.json({ error: 'Cannot delete admin users' }, { status: 400 });
    }

    // Remove the user and everything that references them (directly or via
    // their listings) — most relations have no onDelete cascade, so a bare
    // user.delete() fails with a FK error for any user with activity.
    const id = params.id;
    await prisma.$transaction([
      prisma.message.deleteMany({
        where: {
          OR: [
            { senderId: id },
            { conversation: { OR: [{ buyerId: id }, { sellerId: id }, { listing: { sellerId: id } }] } },
          ],
        },
      }),
      prisma.offer.deleteMany({
        where: { OR: [{ buyerId: id }, { sellerId: id }, { listing: { sellerId: id } }] },
      }),
      prisma.review.deleteMany({
        where: { OR: [{ reviewerId: id }, { revieweeId: id }, { listing: { sellerId: id } }] },
      }),
      prisma.report.deleteMany({
        where: { OR: [{ reporterId: id }, { reportedUserId: id }, { listing: { sellerId: id } }] },
      }),
      prisma.favorite.deleteMany({
        where: { OR: [{ userId: id }, { listing: { sellerId: id } }] },
      }),
      prisma.priceAlert.deleteMany({
        where: { OR: [{ userId: id }, { listing: { sellerId: id } }] },
      }),
      prisma.notification.deleteMany({ where: { userId: id } }),
      prisma.savedSearch.deleteMany({ where: { userId: id } }),
      prisma.conversation.deleteMany({
        where: { OR: [{ buyerId: id }, { sellerId: id }, { listing: { sellerId: id } }] },
      }),
      prisma.listing.deleteMany({ where: { sellerId: id } }),
      prisma.user.delete({ where: { id } }),
    ]);

    return NextResponse.json({ message: 'User deleted' });
  } catch (error: any) {
    if (error.message === 'Unauthorized' || error.message === 'Forbidden') {
      return NextResponse.json({ error: error.message }, { status: error.message === 'Unauthorized' ? 401 : 403 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
