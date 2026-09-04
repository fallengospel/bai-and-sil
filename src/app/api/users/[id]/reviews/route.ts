import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const reviews = await prisma.review.findMany({
      where: { revieweeId: params.id },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true },
        },
        listing: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reviews });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await requireAuth();
    const { listingId, rating, comment } = await request.json();

    if (!listingId || !rating) {
      return NextResponse.json({ error: 'listingId and rating are required' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    const listing = await prisma.listing.findUnique({ where: { id: listingId } });
    if (!listing) {
      return NextResponse.json({ error: 'Listing not found' }, { status: 404 });
    }
    if (listing.status !== 'Sold') {
      return NextResponse.json({ error: 'Listing must be marked as Sold' }, { status: 400 });
    }

    const existing = await prisma.review.findUnique({
      where: {
        listingId_reviewerId: {
          listingId,
          reviewerId: user.id,
        },
      },
    });
    if (existing) {
      return NextResponse.json({ error: 'You already reviewed this listing' }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        listingId,
        reviewerId: user.id,
        revieweeId: params.id,
        rating: parseInt(rating),
        comment: comment || null,
      },
      include: {
        reviewer: {
          select: { id: true, name: true, avatar: true },
        },
      },
    });

    const reviewStats = await prisma.review.aggregate({
      where: { revieweeId: params.id },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.user.update({
      where: { id: params.id },
      data: {
        rating: reviewStats._avg.rating || 0,
        reviewCount: reviewStats._count.rating,
      },
    });

    return NextResponse.json({ review }, { status: 201 });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
