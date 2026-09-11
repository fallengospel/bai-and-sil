import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';
import { slugify } from '@/lib/helpers';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const listing = await prisma.listing.update({
      where: { id: params.id },
      data: { viewCount: { increment: 1 } },
      include: {
        seller: {
          select: { id: true, name: true, avatar: true, location: true, rating: true, reviewCount: true },
        },
        category: true,
        images: { orderBy: { sortOrder: 'asc' } },
        _count: { select: { favorites: true } },
      },
    });

    return NextResponse.json({ listing });
  } catch (error) {
    return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const body = await request.json();

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
      updateData.title = title;
      let slug = slugify(title);
      const existing = await prisma.listing.findFirst({ where: { slug, id: { not: params.id } } });
      if (existing) slug = `${slug}-${Date.now()}`;
      updateData.slug = slug;
    }
    if (description) updateData.description = description;
    if (price) updateData.price = parseFloat(price);
    if (categoryId) updateData.categoryId = categoryId;
    if (condition) updateData.condition = condition;
    if (location) updateData.location = location;
    if (status) {
      const allowedStatuses = ['Active', 'Sold', 'Reserved'];
      if (!allowedStatuses.includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
      updateData.status = status;
    }

    if (images) {
      await prisma.listingImage.deleteMany({ where: { listingId: params.id } });
      await prisma.listingImage.createMany({
        data: images.map((url: string, index: number) => ({
          listingId: params.id,
          imageUrl: url,
          sortOrder: index,
        })),
      });
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
