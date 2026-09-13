import Link from "next/link";
import { prisma } from "@/lib/prisma";
import ProductCard from "@/components/ui/ProductCard";
import CategoryCard from "@/components/ui/CategoryCard";
import RecentlyViewed from "@/components/ui/RecentlyViewed";
import { CATEGORY_ICONS } from "@/lib/helpers";
import { IoAddCircle } from "react-icons/io5";
import { FiSearch, FiShield, FiDollarSign, FiTruck, FiStar, FiUsers, FiTrendingUp } from "react-icons/fi";

async function getFreshDrops() {
  return prisma.listing.findMany({
    where: { status: "Active" },
    orderBy: { createdAt: "desc" },
    take: 8,
    include: {
      seller: { select: { id: true, name: true, avatar: true } },
      category: true,
      images: { take: 1, orderBy: { sortOrder: "asc" } },
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
      {/* Hero Section - Filipino Branded */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#7BA8D0] via-[#7BA8D0] to-[#5E8EB8] text-white">
        {/* Decorative elements */}
        <div className="absolute inset-0">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#F5D36B]/15 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-300/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl" />
        </div>
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            {/* Left side - Text */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm rounded-full border border-white/20 mb-6">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-medium text-blue-100">Pinas Marketplace</span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4 leading-tight">
                Hanap, Benta,{' '}
                <span className="text-[#F5D36B]">I-repeat!</span>
              </h1>
              <p className="text-blue-100/90 text-lg mb-8 leading-relaxed max-w-lg">
                Ang marketplace na gawa ng Pinas, para sa Pinas. 
                Mag-browse, magbenta, at mag-deal — walang hassle, walang patong.
              </p>
              
              <div className="flex flex-wrap gap-4">
                <Link
                  href="/search"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white text-[#7BA8D0] font-bold rounded-xl hover:bg-blue-50 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
                >
                  <FiSearch className="w-5 h-5" />
                  Mag-browse Na
                </Link>
                <Link
                  href="/sell"
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F5D36B] to-[#E5BD48] text-white font-bold rounded-xl hover:from-[#E5BD48] hover:to-[#F5D36B] transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 text-lg"
                >
                  <IoAddCircle className="w-5 h-5" />
                  Magbenta Na
                </Link>
              </div>
              
              {/* Stats */}
              <div className="flex items-center gap-8 mt-10 pt-8 border-t border-white/20">
                <div>
                  <p className="text-3xl font-bold text-white">240+</p>
                  <p className="text-sm text-blue-200">Active Listings</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">12</p>
                  <p className="text-sm text-blue-200">Categories</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-white">Free</p>
                  <p className="text-sm text-blue-200">Mag-list</p>
                </div>
              </div>
            </div>
            
            {/* Right side - Logo & Visual */}
            <div className="hidden md:flex justify-center">
              <div className="relative">
                {/* Main logo circle */}
                <div className="w-80 h-80 bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl rounded-3xl border border-white/20 flex items-center justify-center shadow-2xl rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src="/logo.svg" alt="BAI & SIL Logo" className="w-48 h-48" />
                </div>
                
                {/* Floating cards */}
                <div className="absolute -top-6 -right-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: "3s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                      <FiDollarSign className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Malinis na kita</p>
                      <p className="text-sm font-bold text-gray-900">0% commission</p>
                    </div>
                  </div>
                </div>
                
                <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-4 shadow-xl animate-bounce" style={{ animationDuration: "4s", animationDelay: "1s" }}>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FiShield className="w-5 h-5 text-[#7BA8D0]" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Secure na transaksyon</p>
                      <p className="text-sm font-bold text-gray-900">100% safe</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#7BA8D0]/10 rounded-xl flex items-center justify-center">
                <FiShield className="w-5 h-5 text-[#7BA8D0]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Secure</p>
                <p className="text-xs text-gray-500">Safe transactions</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
                <FiDollarSign className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Free Lang</p>
                <p className="text-xs text-gray-500">Walang patong</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#F5D36B]/10 rounded-xl flex items-center justify-center">
                <FiTruck className="w-5 h-5 text-[#F5D36B]" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Meet-up</p>
                <p className="text-xs text-gray-500">Face-to-face deal</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                <FiUsers className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Pinoy Made</p>
                <p className="text-xs text-gray-500">Gawa sa Pinas</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Fresh Drops */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Bagong Items</h2>
            <p className="text-sm text-gray-500 mt-1">Fresh finds na bagong lagay</p>
          </div>
          <Link 
            href="/search" 
            className="text-sm font-medium text-[#7BA8D0] hover:text-[#7BA8D0]/80 transition-colors flex items-center gap-1"
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
                imageUrl: listing.images[0]?.imageUrl || "/placeholder.svg",
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
              <h2 className="text-2xl font-bold text-gray-900">Categories</h2>
              <p className="text-sm text-gray-500 mt-1">Hanapin mo ang hinahanap mo</p>
            </div>
            <Link
              href="/categories"
              className="text-sm font-medium text-[#7BA8D0] hover:text-[#7BA8D0]/80 transition-colors flex items-center gap-1"
            >
              Lahat ng categories
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

      {/* How It Works - Filipino Style */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-gray-900">Paano Gamitin?</h2>
          <p className="text-sm text-gray-500 mt-1">Simple lang, promise!</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-16 h-16 bg-[#7BA8D0]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiSearch className="w-8 h-8 text-[#7BA8D0]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">1. Mag-browse</h3>
            <p className="text-sm text-gray-500">Hanapin ang gusto mo sa 240+ items</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-[#F5D36B]/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiDollarSign className="w-8 h-8 text-[#F5D36B]" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">2. Mag-deal</h3>
            <p className="text-sm text-gray-500">Mag-message o mag-offer sa seller</p>
          </div>
          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <FiStar className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="font-bold text-gray-900 mb-2">3. Meet-up!</h3>
            <p className="text-sm text-gray-500"> kunin mo na at bayaran</p>
          </div>
        </div>
      </section>

      {/* Seller CTA */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="relative overflow-hidden bg-gradient-to-r from-[#F5D36B]/10 via-[#F5D36B]/5 to-[#7BA8D0]/10 border border-[#F5D36B]/20 rounded-3xl p-8 md:p-12">
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#F5D36B]/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#7BA8D0]/10 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">
                May benta ka ba? I-list na!
              </h2>
              <p className="text-gray-600 max-w-lg">
                Free lang mag-list. Walang commission. Walang hidden fees. 
                Benta mo agad, kita mo agad. Promise!
              </p>
            </div>
            <Link
              href="/sell"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-[#F5D36B] to-[#E5BD48] text-white font-bold rounded-xl hover:from-[#E5BD48] hover:to-[#F5D36B] transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-1 whitespace-nowrap"
            >
              <IoAddCircle className="w-5 h-5" />
              Magbenta Na!
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <FiUsers className="w-8 h-8 text-[#F5D36B] mx-auto mb-3" />
              <p className="text-3xl font-bold">3</p>
              <p className="text-sm text-gray-400">Test Accounts</p>
            </div>
            <div>
              <FiTrendingUp className="w-8 h-8 text-[#7BA8D0] mx-auto mb-3" />
              <p className="text-3xl font-bold">240+</p>
              <p className="text-sm text-gray-400">Active Listings</p>
            </div>
            <div>
              <FiStar className="w-8 h-8 text-[#F5D36B] mx-auto mb-3" />
              <p className="text-3xl font-bold">12</p>
              <p className="text-sm text-gray-400">Categories</p>
            </div>
            <div>
              <FiShield className="w-8 h-8 text-green-400 mx-auto mb-3" />
              <p className="text-3xl font-bold">100%</p>
              <p className="text-sm text-gray-400">Safe & Free</p>
            </div>
          </div>
        </div>
      </section>

      {/* Recently Viewed */}
      <RecentlyViewed />
    </div>
  );
}
