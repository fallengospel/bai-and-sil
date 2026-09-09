import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await requireAuth();

    const conversation = await prisma.conversation.findUnique({
      where: { id: params.id },
      include: {
        buyer: {
          select: { id: true, name: true, avatar: true },
        },
        seller: {
          select: { id: true, name: true, avatar: true },
        },
        listing: {
          select: { id: true, title: true, price: true, slug: true },
          include: {
            images: { take: 1, orderBy: { sortOrder: 'asc' } },
          },
        },
      },
    });

    if (!conversation) {
      return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
    }

    if (conversation.buyerId !== user.id && conversation.sellerId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ conversation });
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
