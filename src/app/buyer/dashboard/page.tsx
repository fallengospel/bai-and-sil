'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiSearch, FiMessageSquare, FiPackage, FiShoppingBag, FiStar, FiClock } from 'react-icons/fi';
import ProductCard from '@/components/ui/ProductCard';

interface BuyerStats {
  totalFavorites: number;
  recentFavorites: any[];
  recommendedListings: any[];
}

export default function BuyerDashboard() {
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/users/me/favorites', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/listings?limit=8', { credentials: 'include' }).then(r => r.json()),
    ]).then(([userData, favsData, listingsData]) => {
      setUser(userData.user);
      setStats({
        totalFavorites: (favsData.favorites || []).length,
        recentFavorites: (favsData.favorites || []).slice(0, 4),
        recommendedListings: (listingsData.listings || []).slice(0, 8),
      });
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]" /></div>;

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Buyer'}!</p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#1a56db] to-[#1a56db]/90 text-white font-medium rounded-xl hover:from-[#1a56db]/90 hover:to-[#1a56db] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
        >
          <FiSearch className="w-4 h-4" />
          Browse Items
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e8634a] to-red-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Saved Items</p>
              <p className="text-2xl font-bold text-gray-900 animate-count-up">{stats?.totalFavorites || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#1a56db] to-[#1a56db]/80 rounded-xl flex items-center justify-center shadow-sm">
              <FiSearch className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Browsing</p>
              <p className="text-2xl font-bold text-green-600">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiStar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Member Since</p>
              <p className="text-lg font-bold text-gray-900">
                {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-PH', { month: 'short', year: 'numeric' }) : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/categories" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#1a56db]/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-[#1a56db]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1a56db]/20 transition-colors">
            <FiSearch className="w-6 h-6 text-[#1a56db]" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Browse Categories</h3>
          <p className="text-sm text-gray-500">Explore all available items</p>
        </Link>
        <Link href="/favorites" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#e8634a]/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-[#e8634a]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#e8634a]/20 transition-colors">
            <FiHeart className="w-6 h-6 text-[#e8634a]" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">My Favorites</h3>
          <p className="text-sm text-gray-500">View saved items</p>
        </Link>
        <Link href="/messages" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
            <FiMessageSquare className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Messages</h3>
          <p className="text-sm text-gray-500">Chat with sellers</p>
        </Link>
      </div>

      {/* Recent Favorites */}
      {(stats?.recentFavorites || []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">Your Saved Items</h2>
            <Link href="/favorites" className="text-sm text-[#1a56db] hover:underline font-medium">View all</Link>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats?.recentFavorites.map((fav: any) => (
                <ProductCard key={fav.id} listing={fav.listing || fav} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommended For You */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Recommended For You</h2>
          <Link href="/search" className="text-sm text-[#1a56db] hover:underline font-medium">View more</Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(stats?.recommendedListings || []).map((listing: any) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
