import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession, requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/helpers';
import { validateCreateListing, sanitizeInput } from '@/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get('page') || '1') || 1);
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20') || 20));
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
      const min = parseFloat(minPrice || '0');
      const max = parseFloat(maxPrice || '0');
      if (minPrice && !isNaN(min) && min >= 0) where.price.gte = min;
      if (maxPrice && !isNaN(max) && max >= 0) where.price.lte = max;
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

    // TODO(C6): Re-enable hard gate once RESEND_API_KEY is configured and
    // verification emails are actually being delivered.
    if (process.env.RESEND_API_KEY) {
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
    }

    const body = await request.json();

    const validation = validateCreateListing(body);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', errors: validation.errors }, { status: 400 });
    }

    const { title, description, price, categoryId, condition, location, images } = body;

    const sanitizedName = sanitizeInput(title);
    const sanitizedDescription = sanitizeInput(description);
    const sanitizedLocation = sanitizeInput(location);

    const parsedPrice = parseFloat(price);

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
        title: sanitizedName,
        slug,
        description: sanitizedDescription,
        price: parsedPrice,
        categoryId,
        condition,
        location: sanitizedLocation,
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
