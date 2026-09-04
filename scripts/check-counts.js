const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const total = await p.listing.count();
  const cats = await p.category.findMany({ include: { _count: { select: { listings: true } } } });
  cats.forEach(c => console.log(c.name + ': ' + c._count.listings));
  console.log('TOTAL: ' + total);
  await p.$disconnect();
})();
