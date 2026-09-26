import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth();

    const where = { sellerId: user.id };

    if (new URL(request.url).searchParams.get('export') === '1') {
      const listings = await prisma.listing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: { category: { select: { name: true } } },
      });
      return NextResponse.json({ listings });
    }

    const [totalListings, activeListings, soldListings, aggregate, recentListings] =
      await Promise.all([
        prisma.listing.count({ where }),
        prisma.listing.count({ where: { ...where, status: 'Active' } }),
        prisma.listing.count({ where: { ...where, status: 'Sold' } }),
        prisma.listing.aggregate({ where, _sum: { viewCount: true } }),
        prisma.listing.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          take: 5,
          include: {
            category: { select: { name: true } },
            images: { orderBy: { sortOrder: 'asc' }, take: 1 },
          },
        }),
      ]);

    const totalViews = aggregate._sum.viewCount || 0;

    return NextResponse.json({
      totalListings,
      activeListings,
      soldListings,
      totalViews,
      avgViewsPerListing:
        totalListings > 0 ? Math.round(totalViews / totalListings) : 0,
      sellThroughRate:
        totalListings > 0 ? Math.round((soldListings / totalListings) * 100) : 0,
      recentListings: recentListings.map((l) => ({
        id: l.id,
        title: l.title,
        price: l.price,
        status: l.status,
        views: l.viewCount,
        condition: l.condition,
        location: l.location,
        createdAt: l.createdAt,
        category: l.category,
        imageUrl: l.images[0]?.imageUrl || '',
      })),
    });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
