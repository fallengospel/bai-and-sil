import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/helpers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category');
    const location = searchParams.get('location');
    const condition = searchParams.get('condition');
    const minPrice = searchParams.get('minPrice');
    const maxPrice = searchParams.get('maxPrice');
    const q = searchParams.get('q') || searchParams.get('search');
    const sort = searchParams.get('sort') || 'newest';

    const where: any = { status: 'Active' };

    if (category) {
      where.category = { slug: category };
    }
    if (location) {
      where.location = location;
    }
    if (condition) {
      where.condition = condition;
    }
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(minPrice);
      if (maxPrice) where.price.lte = parseFloat(maxPrice);
    }
    if (q) {
      where.OR = [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'price_asc') orderBy = { price: 'asc' };
    if (sort === 'price_desc') orderBy = { price: 'desc' };

    const [listings, total] = await Promise.all([
      prisma.listing.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
        include: {
          seller: {
            select: { id: true, name: true, avatar: true },
          },
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { favorites: true } },
        },
      }),
      prisma.listing.count({ where }),
    ]);

    const listingsWithImage = listings.map(l => ({
      ...l,
      imageUrl: l.images?.[0]?.imageUrl || '',
    }));

    return NextResponse.json({
      listings: listingsWithImage,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth();

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id },
      select: { emailVerified: true },
    });
    if (!fullUser?.emailVerified) {
      return NextResponse.json(
        { error: 'Please verify your email before creating listings' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { title, description, price, categoryId, condition, location, images } = body;

    if (!title || !description || !price || !categoryId || !condition || !location) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const todayCount = await prisma.listing.count({
      where: {
        sellerId: user.id,
        createdAt: { gte: todayStart },
      },
    });
    if (todayCount >= 20) {
      return NextResponse.json({ error: 'Daily listing limit reached (20 per day)' }, { status: 429 });
    }

    let slug = slugify(title);
    const existing = await prisma.listing.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const listing = await prisma.listing.create({
      data: {
        sellerId: user.id,
        title,
        slug,
        description,
        price: parseFloat(price),
        categoryId,
        condition,
        location,
        images: {
          create: (images || []).map((url: string, index: number) => ({
            imageUrl: url,
            sortOrder: index,
          })),
        },
      },
      include: {
        seller: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ listing }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
