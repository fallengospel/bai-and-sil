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
          verified: true,
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
  let priceAlerted = false;
  if (session) {
    const [fav, alert] = await Promise.all([
      prisma.favorite.findUnique({
        where: {
          userId_listingId: { userId: session.id, listingId: listing.id },
        },
      }),
      prisma.priceAlert.findUnique({
        where: {
          userId_listingId: { userId: session.id, listingId: listing.id },
        },
      }),
    ]);
    isFavorited = !!fav;
    priceAlerted = !!alert && alert.active;
  }

  const sellerListingCount = await prisma.listing.count({
    where: { sellerId: listing.sellerId, status: "Active" },
  });

  const relatedRaw = listing.categoryId
    ? await prisma.listing.findMany({
        where: {
          categoryId: listing.categoryId,
          status: "Active",
          id: { not: listing.id },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
        include: {
          seller: { select: { id: true, name: true, avatar: true } },
          category: true,
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      })
    : [];

  const relatedListings = relatedRaw.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    price: l.price,
    location: l.location,
    condition: l.condition,
    status: l.status,
    imageUrl: l.images[0]?.imageUrl || "",
    seller: l.seller,
    category: l.category,
  }));

  return (
    <ListingClient
      listing={JSON.parse(JSON.stringify(listing))}
      isOwner={isOwner}
      isFavorited={isFavorited}
      currentUser={session ? JSON.parse(JSON.stringify(session)) : null}
      sellerListingCount={sellerListingCount}
      priceAlerted={priceAlerted}
      relatedListings={relatedListings}
    />
  );
}
