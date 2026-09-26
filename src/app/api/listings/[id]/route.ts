import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/helpers';
import { validateUpdateListing, sanitizeInput } from '@/lib/validation';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    let listing = await prisma.listing.findUnique({
      where: { id: params.id },
      include: {
        seller: {
          select: { id: true, name: true, avatar: true, location: true, rating: true, reviewCount: true },
        },
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { favorites: true } },
      },
    });

    // Also resolve by slug (edit page and other clients pass slugs)
    if (!listing) {
      listing = await prisma.listing.findUnique({
        where: { slug: params.id },
        include: {
          seller: {
            select: { id: true, name: true, avatar: true, location: true, rating: true, reviewCount: true },
          },
          category: true,
          images: { orderBy: { sortOrder: 'asc' } },
          _count: { select: { favorites: true } },
        },
      });
    }

    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }

    // Increment viewCount separately (don't block the response)
    prisma.listing.update({
      where: { id: listing.id },
      data: { viewCount: { increment: 1 } },
    }).catch(() => {});

    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await request.json();

    const validation = validateUpdateListing(body);
    if (!validation.valid) {
      return NextResponse.json({ error: 'Validation failed', errors: validation.errors }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (listing.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, description, price, categoryId, condition, location, status, images } = body;

    const updateData: any = {};
    if (title) {
      updateData.title = sanitizeInput(title);
      let slug = slugify(title);
      const existing = await prisma.listing.findFirst({ where: { slug, id: { not: params.id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
      updateData.slug = slug;
    }
    if (description) updateData.description = sanitizeInput(description);
    if (price) {
      const parsedPrice = parseFloat(price);
      if (isNaN(parsedPrice) || parsedPrice <= 0) {
        return NextResponse.json({ error: 'Price must be a positive number' }, { status: 400 });
      }
      updateData.price = parsedPrice;
    }
    if (categoryId) updateData.categoryId = categoryId;
    if (condition) updateData.condition = condition;
    if (location) updateData.location = sanitizeInput(location);
    if (status) {
      const allowedStatuses = ['Active', 'Sold', 'Reserved'];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
    }

    if (images && Array.isArray(images)) {
      const validImages = images.filter((url: unknown): url is string => typeof url === 'string' && url.length > 0);
      await prisma.listingImage.deleteMany({ where: { listingId: params.id } });
      if (validImages.length > 0) {
        await prisma.listingImage.createMany({
          data: validImages.map((url: string, index: number) => ({
            listingId: params.id,
            imageUrl: url,
            sortOrder: index,
          })),
        });
      }
    }

    const updated = await prisma.listing.update({
      where: { id: params.id },
      data: updateData,
      include: {
        seller: {
          select: { id: true, name: true, avatar: true },
        },
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
      },
    });

    return NextResponse.json({ listing: updated });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();

    const listing = await prisma.listing.findUnique({ where: { id: params.id } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (listing.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.listing.update({
      where: { id: params.id },
      data: { status: 'Removed' },
    });

    return NextResponse.json({ message: 'Listing removed' });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
