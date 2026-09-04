import { MetadataRoute } from 'next';
import { prisma } from '@/lib/prisma';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://baiandsil.ph';

  const categories = await prisma.category.findMany({ select: { slug: true } });

  const listings = await prisma.listing.findMany({
    where: { status: 'Active' },
    select: { slug: true, updatedAt: true },
  });

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'daily', priority: 1 },
    { url: `${baseUrl}/categories`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.8 },
    ...categories.map((c) => ({ url: `${baseUrl}/search?category=${c.slug}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.7 })),
    ...listings.map((l) => ({ url: `${baseUrl}/listing/${l.slug}`, lastModified: l.updatedAt, changeFrequency: 'weekly' as const, priority: 0.6 })),
  ];
}
