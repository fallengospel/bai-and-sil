import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireAuth } from '@/lib/auth';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; offerId: string } }
) {
  try {
    const user = await requireAuth();
    const { status } = await request.json();

    if (!status || !["Accepted", "Declined"].includes(status)) {
      return NextResponse.json({ error: "Status must be 'Accepted' or 'Declined'" }, { status: 400 });
    }

    const offer = await prisma.offer.findUnique({
      where: { id: params.offerId },
      include: { conversation: true, listing: true },
    });

    if (!offer) {
      return NextResponse.json({ error: "Offer not found" }, { status: 404 });
    }

    if (offer.sellerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (offer.status !== "Pending") {
      return NextResponse.json({ error: "Offer has already been responded to" }, { status: 400 });
    }

    const updated = await prisma.offer.update({
      where: { id: params.offerId },
      data: { status },
    });

    if (status === "Accepted") {
      await prisma.listing.update({
        where: { id: offer.listingId },
        data: { status: "Reserved" },
      });

      const buyerId = offer.buyerId;
      await prisma.notification.create({
        data: {
          userId: buyerId,
          type: "offer",
          message: `Your offer of ₱${offer.amount} was accepted!`,
          link: `/messages/${offer.conversationId}`,
        },
      });
    }

    if (status === "Declined") {
      await prisma.notification.create({
        data: {
          userId: offer.buyerId,
          type: "offer",
          message: `Your offer of ₱${offer.amount} was declined.`,
          link: `/messages/${offer.conversationId}`,
        },
      });
    }

    return NextResponse.json({ offer: updated });
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
