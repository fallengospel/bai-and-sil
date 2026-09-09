import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET() {
  try {
    const user = await requireAuth();

    const [sentOffers, receivedOffers] = await Promise.all([
      prisma.offer.findMany({
        where: { buyerId: user.id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              status: true,
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
          seller: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.offer.findMany({
        where: { sellerId: user.id },
        include: {
          listing: {
            select: {
              id: true,
              title: true,
              slug: true,
              price: true,
              status: true,
              images: { take: 1, orderBy: { sortOrder: 'asc' } },
            },
          },
          buyer: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const sent = sentOffers.map((o) => ({
      ...o,
      listing: {
        ...o.listing,
        imageUrl: o.listing.images[0]?.imageUrl || '',
      },
      role: 'buyer' as const,
    }));

    const received = receivedOffers.map((o) => ({
      ...o,
      listing: {
        ...o.listing,
        imageUrl: o.listing.images[0]?.imageUrl || '',
      },
      role: 'seller' as const,
    }));

    return NextResponse.json({ sent, received });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
