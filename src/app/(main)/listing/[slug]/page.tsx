import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { notFound } from "next/navigation";
import ListingClient from "./ListingClient";

interface PageProps {
  params: { slug: string };
}

export default async function ListingPage({ params }: PageProps) {
  const listing = await prisma.listing.findUnique({
    where: { slug: params.slug },
    include: {
      seller: {
        select: {
          id: true,
          name: true,
          avatar: true,
          location: true,
          rating: true,
          reviewCount: true,
          createdAt: true,
        },
      },
      category: true,
      images: { orderBy: { sortOrder: "asc" } },
      _count: { select: { favorites: true } },
    },
  });

  if (!listing) notFound();

  const session = await getSession();
  const isOwner = session?.id === listing.sellerId;

  let isFavorited = false;
  if (session) {
    const fav = await prisma.favorite.findUnique({
      where: {
        userId_listingId: { userId: session.id, listingId: listing.id },
      },
    });
    isFavorited = !!fav;
  }

  const sellerListingCount = await prisma.listing.count({
    where: { sellerId: listing.sellerId, status: "Active" },
  });

  return (
    <ListingClient
      listing={JSON.parse(JSON.stringify(listing))}
      isOwner={isOwner}
      isFavorited={isFavorited}
      currentUser={session ? JSON.parse(JSON.stringify(session)) : null}
      sellerListingCount={sellerListingCount}
    />
  );
}
