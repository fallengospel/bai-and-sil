import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await getSession();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id },
      include: {
        listing: {
          include: {
            seller: { select: { id: true, name: true, avatar: true } },
            category: true,
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const listings = favorites
      .filter((f) => f.listing.status === 'Active')
      .map((f) => ({
        ...f.listing,
        imageUrl: f.listing.images[0]?.imageUrl || '',
      }));

    return NextResponse.json({ listings });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
