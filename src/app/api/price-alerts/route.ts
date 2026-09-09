import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await request.json();
    const { listingId } = body;

    if (!listingId) {
      return NextResponse.json({ error: 'Missing listingId' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({
      where: { id: listingId },
      select: { id: true, sellerId: true, price: true },
    });

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    if (listing.sellerId === user.id) {
      return NextResponse.json({ error: 'Cannot subscribe to your own listing' }, { status: 400 });
    }

    const existing = await prisma.priceAlert.findUnique({
      where: { userId_listingId: { userId: user.id, listingId } },
    });

    if (existing) {
      if (!existing.active) {
        await prisma.priceAlert.update({
          where: { id: existing.id },
          data: { active: true, targetPrice: listing.price },
        });
        return NextResponse.json({ message: 'Alert reactivated', subscribed: true });
      }
      await prisma.priceAlert.update({
        where: { id: existing.id },
        data: { active: false },
      });
      return NextResponse.json({ message: 'Alert removed', subscribed: false });
    }

    await prisma.priceAlert.create({
      data: {
        userId: user.id,
        listingId,
        targetPrice: listing.price,
      },
    });

    return NextResponse.json({ message: 'Subscribed to price drops', subscribed: true }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const user = await requireAuth();

    const alerts = await prisma.priceAlert.findMany({
      where: { userId: user.id, active: true },
      include: {
        listing: {
          select: {
            id: true,
            title: true,
            slug: true,
            price: true,
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const result = alerts.map((a) => ({
      ...a,
      listing: {
        ...a.listing,
        imageUrl: a.listing.images[0]?.imageUrl || '',
      },
    }));

    return NextResponse.json({ alerts: result });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
