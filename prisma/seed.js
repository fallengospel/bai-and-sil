const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const categories = [
    { name: 'Electronics', slug: 'electronics', icon: '💻' },
    { name: 'Fashion', slug: 'fashion', icon: '👗' },
    { name: 'Home & Living', slug: 'home-living', icon: '🏠' },
    { name: 'Vehicles', slug: 'vehicles', icon: '🚗' },
    { name: 'Beauty', slug: 'beauty', icon: '💄' },
    { name: 'Sports', slug: 'sports', icon: '⚽' },
    { name: 'Gaming', slug: 'gaming', icon: '🎮' },
    { name: 'Collectibles', slug: 'collectibles', icon: '🏆' },
    { name: 'Appliances', slug: 'appliances', icon: '🔌' },
    { name: 'Tools', slug: 'tools', icon: '🔧' },
    { name: 'Books', slug: 'books', icon: '📚' },
    { name: 'Other', slug: 'other', icon: '📦' },
  ];

  for (const cat of categories) {
    await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat,
    });
  }

  const password = await bcrypt.hash('password123', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@baiandsil.ph' },
    update: {},
    create: {
      name: 'Admin Bai',
      email: 'admin@baiandsil.ph',
      password,
      isAdmin: true,
      emailVerified: true,
      location: 'Metro Manila',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'seller@baiandsil.ph' },
    update: {},
    create: {
      name: 'Sil the Seller',
      email: 'seller@baiandsil.ph',
      password,
      emailVerified: true,
      location: 'Cebu City',
      bio: 'Selling good stuff since forever.',
    },
  });

  const buyer = await prisma.user.upsert({
    where: { email: 'buyer@baiandsil.ph' },
    update: {},
    create: {
      name: 'Bai the Buyer',
      email: 'buyer@baiandsil.ph',
      password,
      emailVerified: true,
      location: 'Quezon City',
    },
  });

  const electronics = await prisma.category.findUnique({ where: { slug: 'electronics' } });
  const fashion = await prisma.category.findUnique({ where: { slug: 'fashion' } });
  const gaming = await prisma.category.findUnique({ where: { slug: 'gaming' } });
  const homeLiving = await prisma.category.findUnique({ where: { slug: 'home-living' } });

  const listings = [
    {
      title: 'Sony WH-1000XM5',
      slug: 'sony-wh-1000xm5',
      description: 'Barely used noise cancelling headphones. Battery still at 100%. Comes with original box and cables.',
      price: 14500,
      categoryId: electronics.id,
      condition: 'Like New',
      location: 'Makati',
      sellerId: seller.id,
      status: 'Active',
    },
    {
      title: 'Nike Air Jordan 1 Retro High',
      slug: 'nike-air-jordan-1-retro-high',
      description: 'Size 10. Worn twice. Too small for me. Authentic from Nike store.',
      price: 8500,
      categoryId: fashion.id,
      condition: 'Like New',
      location: 'Taguig',
      sellerId: seller.id,
      status: 'Active',
    },
    {
      title: 'PS5 Disc Edition + 2 Controllers',
      slug: 'ps5-disc-edition-2-controllers',
      description: 'Moving abroad, need to sell. Comes with extra DualSense controller. All working perfectly.',
      price: 22000,
      categoryId: gaming.id,
      condition: 'Good',
      location: 'Pasig',
      sellerId: seller.id,
      status: 'Active',
    },
    {
      title: 'IKEA KALLAX Shelf Unit - White',
      slug: 'ikea-kallax-shelf-white',
      description: '4x4 shelf in white. Some minor scratches but structurally perfect. Heavy item, pick up only.',
      price: 3500,
      categoryId: homeLiving.id,
      condition: 'Good',
      location: 'Mandaluyong',
      sellerId: seller.id,
      status: 'Active',
    },
    {
      title: 'iPhone 14 Pro Max 256GB - Space Black',
      slug: 'iphone-14-pro-max-256gb',
      description: 'Perfect condition, always used with case and screen protector. Battery health 95%.',
      price: 45000,
      categoryId: electronics.id,
      condition: 'Like New',
      location: 'Quezon City',
      sellerId: seller.id,
      status: 'Active',
    },
    {
      title: 'Samsung 55" 4K Smart TV',
      slug: 'samsung-55-4k-smart-tv',
      description: '2023 model. Still under warranty. Selling because we upgraded.',
      price: 18000,
      categoryId: electronics.id,
      condition: 'Good',
      location: 'Las Piñas',
      sellerId: seller.id,
      status: 'Active',
    },
    {
      title: 'Vintage Star Wars Figures (Lot of 12)',
      slug: 'vintage-star-wars-figures-lot',
      description: 'Original Kenner figures from the 80s. Some with loose joints but all complete. Great for collectors.',
      price: 12000,
      categoryId: gaming.id,
      condition: 'Fair',
      location: 'Manila',
      sellerId: seller.id,
      status: 'Active',
    },
    {
      title: 'Dyson V15 Detect Vacuum',
      slug: 'dyson-v15-detect-vacuum',
      description: 'Bought last month. Works perfectly. Laser shows dust you never knew existed.',
      price: 28000,
      categoryId: homeLiving.id,
      condition: 'Brand New',
      location: 'BGC',
      sellerId: seller.id,
      status: 'Active',
    },
  ];

  for (const listing of listings) {
    await prisma.listing.upsert({
      where: { slug: listing.slug },
      update: {},
      create: listing,
    });
  }

  console.log('Seed complete!');
  console.log('Admin: admin@baiandsil.ph / password123');
  console.log('Seller: seller@baiandsil.ph / password123');
  console.log('Buyer: buyer@baiandsil.ph / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
