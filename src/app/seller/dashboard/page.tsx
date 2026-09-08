'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FiPackage, FiDollarSign, FiStar, FiMessageSquare, FiPlusCircle, FiTrendingUp, FiEye } from 'react-icons/fi';

interface SellerStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  recentListings: any[];
  recentOffers: any[];
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch('/api/auth/me').then(r => r.json()),
      fetch('/api/listings?limit=50').then(r => r.json()),
    ]).then(([userData, listingsData]) => {
      setUser(userData.user);
      const myListings = (listingsData.listings || []).filter(
        (l: any) => l.seller?.id === userData.user?.id
      );
      setStats({
        totalListings: myListings.length,
        activeListings: myListings.filter((l: any) => l.status === 'Active').length,
        soldListings: myListings.filter((l: any) => l.status === 'Sold').length,
        totalViews: myListings.reduce((sum: number, l: any) => sum + (l.views || 0), 0),
        recentListings: myListings.slice(0, 5),
        recentOffers: [],
      });
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623]" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || 'Seller'}!</p>
        </div>
        <Link
          href="/sell"
          className="flex items-center gap-2 px-4 py-2 bg-[#f5a623] text-white font-medium rounded-lg hover:bg-yellow-500 transition-colors"
        >
          <FiPlusCircle className="w-4 h-4" />
          New Listing
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-[#f5a623]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiTrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiDollarSign className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Sold</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.soldListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiEye className="w-5 h-5 text-[#1a56db]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Views</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalViews || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings Performance */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Listing Performance</h2>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Active Listings</span>
              <span className="font-medium">{stats?.activeListings || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-green-500 h-3 rounded-full transition-all"
                style={{ width: `${((stats?.activeListings || 0) / (stats?.totalListings || 1)) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600">Sold Items</span>
              <span className="font-medium">{stats?.soldListings || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3">
              <div
                className="bg-purple-500 h-3 rounded-full transition-all"
                style={{ width: `${((stats?.soldListings || 0) / (stats?.totalListings || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/sell" className="bg-white rounded-xl border border-gray-100 p-6 hover:border-[#f5a623] transition-colors">
          <FiPlusCircle className="w-8 h-8 text-[#f5a623] mb-3" />
          <h3 className="font-bold text-gray-900">Create Listing</h3>
          <p className="text-sm text-gray-500 mt-1">List a new item for sale</p>
        </Link>
        <Link href="/my-listings" className="bg-white rounded-xl border border-gray-100 p-6 hover:border-[#1a56db] transition-colors">
          <FiPackage className="w-8 h-8 text-[#1a56db] mb-3" />
          <h3 className="font-bold text-gray-900">Manage Listings</h3>
          <p className="text-sm text-gray-500 mt-1">View and edit your listings</p>
        </Link>
        <Link href="/messages" className="bg-white rounded-xl border border-gray-100 p-6 hover:border-green-500 transition-colors">
          <FiMessageSquare className="w-8 h-8 text-green-500 mb-3" />
          <h3 className="font-bold text-gray-900">Messages</h3>
          <p className="text-sm text-gray-500 mt-1">Check buyer inquiries</p>
        </Link>
      </div>

      {/* Recent Listings */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="p-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-lg">Your Recent Listings</h2>
          <Link href="/my-listings" className="text-sm text-[#f5a623] hover:underline">View all</Link>
        </div>
        <div className="divide-y">
          {(stats?.recentListings || []).map((listing: any) => (
            <div key={listing.id} className="p-4 flex items-center gap-4">
              <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiPackage className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{listing.title}</p>
                <p className="text-sm text-gray-500">₱{listing.price?.toLocaleString()}</p>
              </div>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                listing.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
              }`}>
                {listing.status}
              </span>
            </div>
          ))}
          {(stats?.recentListings || []).length === 0 && (
            <div className="p-8 text-center text-gray-400">
              No listings yet. <Link href="/sell" className="text-[#f5a623] hover:underline">Create your first listing</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
