import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import CategoryCard from "@/components/ui/CategoryCard";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
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
    <div className="page-transition">
      {/* Hero */}
      <section className="relative overflow-hidden gradient-hero text-white">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#f5a623]/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
              Find stuff.{' '}
              <span className="text-[#f5a623]">Sell stuff.</span>{' '}
              Repeat.
            </h1>
            <p className="text-blue-100/90 text-lg mb-8 leading-relaxed">
              The marketplace where good finds meet good deals. Browse, buy, or sell your
              pre-loved treasures — all in one place.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/search"
                className="inline-flex items-center px-6 py-3.5 bg-white text-[#1a56db] font-semibold rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                Browse Listings
              </Link>
              <Link
                href="/sell"
                className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#f5a623] to-[#f5a623]/90 text-white font-semibold rounded-xl hover:from-[#f5a623]/90 hover:to-[#f5a623] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
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
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Fresh Drops</h2>
            <p className="text-sm text-gray-500 mt-1">Latest items just added</p>
          </div>
          <Link 
            href="/search" 
            className="text-sm font-medium text-[#1a56db] hover:text-[#1a56db]/80 transition-colors flex items-center gap-1"
          >
            View all
            <span className="text-lg">→</span>
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
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
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-3xl">📦</span>
            </div>
            <p className="text-gray-500">
              Wala pa? Magbenta ka naman. Listings coming soon.
            </p>
          </div>
        )}
      </section>

      {/* Categories */}
      <section className="bg-gray-50/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Browse by Category</h2>
              <p className="text-sm text-gray-500 mt-1">Find exactly what you're looking for</p>
            </div>
            <Link
              href="/categories"
              className="text-sm font-medium text-[#1a56db] hover:text-[#1a56db]/80 transition-colors flex items-center gap-1"
            >
              All categories
              <span className="text-lg">→</span>
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
        <div className="relative overflow-hidden bg-gradient-to-r from-[#f5a623]/10 via-[#f5a623]/5 to-[#1a56db]/10 border border-[#f5a623]/20 rounded-3xl p-8 md:p-12 text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#f5a623]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#1a56db]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
              Got something to sell?
            </h2>
            <p className="text-gray-600 mb-6 max-w-lg mx-auto">
              List it in minutes. Reach thousands of buyers. Get paid fast. It&apos;s free to list
              — no hidden fees, promise.
            </p>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-[#f5a623] to-[#f5a623]/90 text-white font-semibold rounded-xl hover:from-[#f5a623]/90 hover:to-[#f5a623] transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
            >
              <IoAddCircle className="w-5 h-5" />
              Start Selling Now
            </Link>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />
    </div>
  );
}
