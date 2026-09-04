import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import CategoryCard from "@/components/ui/CategoryCard";
import { CATEGORY_ICONS } from "@/lib/helpers";
import { IoAddCircle } from "react-icons/io5";

async function getFreshDrops() {
  return prisma.listing.findMany({
    where: { status: "Active" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      seller: { select: { id: true, name: true, avatar: true } },
      category: true,
      images: { take: 1, orderBy: { sortOrder: 'asc' } },
    },
  });
}

async function getCategories() {
  return prisma.category.findMany({
    include: { _count: { select: { listings: { where: { status: "Active" } } } } },
  });
}

export default async function HomePage() {
  const [listings, categories] = await Promise.all([getFreshDrops(), getCategories()]);

  return (
    <div>
      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1a56db] to-blue-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Find stuff. Sell stuff. Repeat.
            </h1>
            <p className="text-blue-100 text-lg mb-8">
              The marketplace where good finds meet good deals. Browse, buy, or sell your
              pre-loved treasures — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center px-6 py-3 bg-white text-[#1a56db] font-semibold rounded-lg hover:bg-blue-50 transition-colors"
              >
                Browse Listings
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5a623] text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
              >
                <IoAddCircle className="w-5 h-5" />
                Start Selling
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Fresh Drops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Fresh Drops</h2>
          <Link href="/search" className="text-sm font-medium text-[#1a56db] hover:underline">
            View all
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {listings.map((listing) => (
            <ProductCard
              key={listing.id}
              listing={{
                ...listing,
                imageUrl: listing.images[0]?.imageUrl || "/placeholder.png",
              }}
            />
          ))}
        </div>
        {listings.length === 0 && (
          <p className="text-center text-gray-500 py-12">
            Wala pa? Magbenta ka naman. Listings coming soon.
          </p>
        )}
      </section>

      {/* Categories */}
      <section className="bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
            <Link
              href="/categories"
              className="text-sm font-medium text-[#1a56db] hover:underline"
            >
              All categories
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <CategoryCard
                key={cat.id}
                slug={cat.slug}
                name={cat.name}
                icon={CATEGORY_ICONS[cat.slug] || cat.icon || "📦"}
                count={cat._count.listings}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-[#f5a623]/10 border border-[#f5a623]/30 rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
            Got something to sell?
          </h2>
          <p className="text-gray-600 mb-6 max-w-lg mx-auto">
            List it in minutes. Reach thousands of buyers. Get paid fast. It&apos;s free to list
            — no hidden fees, promise.
          </p>
          <Link
            href="/sell"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#f5a623] text-white font-semibold rounded-lg hover:bg-yellow-500 transition-colors"
          >
            <IoAddCircle className="w-5 h-5" />
            Start Selling Now
          </Link>
        </div>
      </section>
    </div>
  );
}
