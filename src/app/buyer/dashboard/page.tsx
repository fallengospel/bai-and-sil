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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Buyer'}!</p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-2 px-4 py-2 bg-[#1a56db] text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiSearch className="w-4 h-4" />
          Browse Items
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiHeart className="w-5 h-5 text-red-500" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Saved Items</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalFavorites || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiSearch className="w-5 h-5 text-[#1a56db]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Browsing</p>
              <p className="text-2xl font-bold text-gray-900">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiStar className="w-5 h-5 text-green-600" />
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
        <Link href="/categories" className="bg-white rounded-xl border border-gray-100 p-6 hover:border-[#1a56db] transition-colors">
          <FiSearch className="w-8 h-8 text-[#1a56db] mb-3" />
          <h3 className="font-bold text-gray-900">Browse Categories</h3>
          <p className="text-sm text-gray-500 mt-1">Explore all available items</p>
        </Link>
        <Link href="/favorites" className="bg-white rounded-xl border border-gray-100 p-6 hover:border-red-500 transition-colors">
          <FiHeart className="w-8 h-8 text-red-500 mb-3" />
          <h3 className="font-bold text-gray-900">My Favorites</h3>
          <p className="text-sm text-gray-500 mt-1">View saved items</p>
        </Link>
        <Link href="/messages" className="bg-white rounded-xl border border-gray-100 p-6 hover:border-green-500 transition-colors">
          <FiMessageSquare className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-bold text-gray-900">Messages</h3>
          <p className="text-sm text-gray-500 mt-1">Chat with sellers</p>
        </Link>
      </div>

      {/* Recent Favorites */}
      {(stats?.recentFavorites || []).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">Your Saved Items</h2>
            <Link href="/favorites" className="text-sm text-[#1a56db] hover:underline">View all</Link>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {stats?.recentFavorites.map((fav: any) => (
                <ProductCard key={fav.id} listing={fav.listing || fav} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recommended For You */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">Recommended For You</h2>
          <Link href="/search" className="text-sm text-[#1a56db] hover:underline">View more</Link>
        </div>
        <div className="p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(stats?.recommendedListings || []).map((listing: any) => (
              <ProductCard key={listing.id} listing={listing} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
