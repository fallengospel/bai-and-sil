'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiHeart, FiSearch, FiMessageSquare, FiPackage, FiShoppingBag, FiStar, FiClock } from 'react-icons/fi';
import ProductCard from '@/components/ui/ProductCard';
import { toggleFavorite } from '@/lib/favorites';

interface BuyerStats {
  totalFavorites: number;
  activeListings: number;
  recentFavorites: any[];
  recommendedListings: any[];
}

export default function BuyerDashboard() {
  const [stats, setStats] = useState<BuyerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  const handleToggleFavorite = async (id: string) => {
    const next = await toggleFavorite(id);
    if (next === null) return;
    setFavIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(id);
      else s.delete(id);
      return s;
    });
    if (next === false) {
      setStats((prev) =>
        prev
          ? {
              ...prev,
              totalFavorites: Math.max(0, prev.totalFavorites - 1),
              recentFavorites: prev.recentFavorites.filter(
                (f: any) => (f.id || f.listing?.id) !== id
              ),
            }
          : prev
      );
    }
  };

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/users/me/favorites', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/listings?limit=8', { credentials: 'include' }).then(r => r.json()),
    ]).then(([userData, favsData, listingsData]) => {
      setUser(userData.user);
      const favList = favsData.listings || favsData.favorites || [];
      setFavIds(new Set(favList.map((f: any) => f.id || f.listing?.id).filter(Boolean)));
      setStats({
        totalFavorites: favList.length,
        recentFavorites: favList.slice(0, 4),
        recommendedListings: (listingsData.listings || []).slice(0, 8),
        activeListings: listingsData.total ?? (listingsData.listings || []).length,
      });
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bai-blue" /></div>;

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Buyer Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Buyer'}!</p>
        </div>
        <Link
          href="/categories"
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-bai-blue to-bai-blue/90 text-white font-medium rounded-2xl hover:from-bai-blue/90 hover:to-bai-blue transition-all duration-200 shadow-card hover:shadow-card-hover shadow-cartoon hover:-translate-y-0.5"
        >
          <FiSearch className="w-4 h-4" />
          Browse Items
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-coral to-red-400 rounded-2xl flex items-center justify-center shadow-sm">
              <FiHeart className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Saved Items</p>
              <p className="text-2xl font-bold text-gray-900 animate-count-up">{stats?.totalFavorites || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-bai-blue to-bai-blue/80 rounded-2xl flex items-center justify-center shadow-sm">
              <FiSearch className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Items Available</p>
              <p className="text-2xl font-bold text-bai-blue">{stats?.activeListings ?? 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center shadow-sm">
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
        <Link href="/categories" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-bai-blue/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-bai-blue-light rounded-2xl flex items-center justify-center mb-4 group-hover:bg-bai-blue/20 transition-colors">
            <FiSearch className="w-6 h-6 text-bai-blue" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Browse Categories</h3>
          <p className="text-sm text-gray-500">Explore all available items</p>
        </Link>
        <Link href="/favorites" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-coral/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-coral/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-coral/20 transition-colors">
            <FiHeart className="w-6 h-6 text-coral" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">My Favorites</h3>
          <p className="text-sm text-gray-500">View saved items</p>
        </Link>
        <Link href="/messages" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-500/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
            <FiMessageSquare className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Messages</h3>
          <p className="text-sm text-gray-500">Chat with sellers</p>
        </Link>
      </div>

      {/* Recent Favorites */}
      {(stats?.recentFavorites || []).length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">Your Saved Items</h2>
            <Link href="/favorites" className="text-sm text-bai-blue hover:underline font-medium">View all</Link>
          </div>
          <div className="p-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
              {stats?.recentFavorites.map((fav: any) => (
                <ProductCard
                  key={fav.id}
                  listing={fav.listing || fav}
                  favorited
                  onToggleFavorite={handleToggleFavorite}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Latest listings */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Latest on BAI &amp; SIL</h2>
          <Link href="/search" className="text-sm text-bai-blue hover:underline font-medium">View more</Link>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {(stats?.recommendedListings || []).map((listing: any) => (
              <ProductCard
                key={listing.id}
                listing={listing}
                favorited={favIds.has(listing.id)}
                onToggleFavorite={handleToggleFavorite}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
