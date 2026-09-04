const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const imageMap = {
  'dyson-v15-detect-vacuum': '/images/products/dyson-v15-detect-vacuum.jpg',
  'vintage-star-wars-figures-lot': '/images/products/vintage-star-wars-figures-lot.jpg',
  'samsung-55-4k-smart-tv': '/images/products/samsung-55-4k-smart-tv.jpg',
  'iphone-14-pro-max-256gb': '/images/products/iphone-14-pro-max-256gb.jpg',
  'ikea-kallax-shelf-white': '/images/products/ikea-kallax-shelf-white.jpg',
  'ps5-disc-edition-2-controllers': '/images/products/ps5-disc-edition-2-controllers.jpg',
  'nike-air-jordan-1-retro-high': '/images/products/nike-air-jordan-1-retro-high.jpg',
  'sony-wh-1000xm5': '/images/products/sony-wh-1000xm5.jpg',
};

async function main() {
  for (const [slug, imageUrl] of Object.entries(imageMap)) {
    const listing = await prisma.listing.findUnique({ where: { slug } });
    if (!listing) { console.log('Not found:', slug); continue; }
    const existing = await prisma.listingImage.findFirst({ where: { listingId: listing.id } });
    if (existing) {
      await prisma.listingImage.update({ where: { id: existing.id }, data: { imageUrl } });
    } else {
      await prisma.listingImage.create({ data: { listingId: listing.id, imageUrl, sortOrder: 0 } });
    }
    console.log('Updated:', slug);
  }
  console.log('Done!');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
