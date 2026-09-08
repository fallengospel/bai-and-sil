'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { FiUsers, FiPackage, FiStar, FiAlertTriangle, FiTrendingUp, FiShoppingBag, FiUserCheck } from 'react-icons/fi';

interface Stats {
  totalUsers: number;
  totalBuyers: number;
  totalSellers: number;
  activeListings: number;
  totalSold: number;
  pendingReports: number;
  recentUsers: any[];
  recentListings: any[];
  categoryStats: { name: string; count: number }[];
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/listings').then(r => r.json()),
      fetch('/api/admin/reports').then(r => r.json()),
      fetch('/api/categories').then(r => r.json()),
    ]).then(([usersData, listingsData, reportsData, catData]) => {
      if (!usersData.users) { router.push('/'); return; }
      const users = usersData.users || [];
      const listings = listingsData.listings || [];
      const reports = reportsData.reports || [];
      const categories = catData.categories || [];

      const buyers = users.filter((u: any) => u.role === 'buyer');
      const sellers = users.filter((u: any) => u.role === 'seller');

      setStats({
        totalUsers: users.length,
        totalBuyers: buyers.length,
        totalSellers: sellers.length,
        activeListings: listings.filter((l: any) => l.status === 'Active').length,
        totalSold: listings.filter((l: any) => l.status === 'Sold').length,
        pendingReports: reports.filter((r: any) => r.status === 'Pending').length,
        recentUsers: users.slice(0, 5),
        recentListings: listings.slice(0, 5),
        categoryStats: categories.map((c: any) => ({ name: c.name, count: c._count?.listings || 0 })),
      });
    }).catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1a56db]" /></div>;

  const maxCategoryCount = Math.max(...(stats?.categoryStats.map(c => c.count) || [1]));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <span className="text-sm text-gray-500">Welcome back, Admin</span>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <FiUsers className="w-5 h-5 text-[#1a56db]" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <FiPackage className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.activeListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <FiStar className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sold</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.totalSold || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <FiAlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900">{stats?.pendingReports || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Breakdown Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiUserCheck className="w-5 h-5 text-[#1a56db]" />
            User Breakdown
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Buyers</span>
                <span className="font-medium">{stats?.totalBuyers || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-[#1a56db] h-3 rounded-full transition-all"
                  style={{ width: `${((stats?.totalBuyers || 0) / (stats?.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Sellers</span>
                <span className="font-medium">{stats?.totalSellers || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-[#f5a623] h-3 rounded-full transition-all"
                  style={{ width: `${((stats?.totalSellers || 0) / (stats?.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Admins</span>
                <span className="font-medium">{(stats?.totalUsers || 0) - (stats?.totalBuyers || 0) - (stats?.totalSellers || 0)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3">
                <div
                  className="bg-red-500 h-3 rounded-full transition-all"
                  style={{ width: `${(((stats?.totalUsers || 0) - (stats?.totalBuyers || 0) - (stats?.totalSellers || 0)) / (stats?.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t flex gap-4 text-sm">
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#1a56db] rounded-full" /> Buyer</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-[#f5a623] rounded-full" /> Seller</span>
            <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded-full" /> Admin</span>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-xl border border-gray-100 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            Listings by Category
          </h2>
          <div className="space-y-3">
            {(stats?.categoryStats || []).slice(0, 6).map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600 truncate">{cat.name}</span>
                  <span className="font-medium">{cat.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#1a56db] to-[#f5a623] h-2 rounded-full transition-all"
                    style={{ width: `${(cat.count / maxCategoryCount) * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-[#1a56db] hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {(stats?.recentUsers || []).map((user: any) => (
              <div key={user.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  {user.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  user.role === 'seller' ? 'bg-yellow-100 text-yellow-800' :
                  user.role === 'admin' ? 'bg-red-100 text-red-800' :
                  'bg-blue-100 text-blue-800'
                }`}>
                  {user.role || 'buyer'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-gray-100">
          <div className="p-4 border-b flex items-center justify-between">
            <h2 className="font-bold text-lg">Recent Listings</h2>
            <Link href="/admin/listings" className="text-sm text-[#1a56db] hover:underline">View all</Link>
          </div>
          <div className="divide-y">
            {(stats?.recentListings || []).map((listing: any) => (
              <div key={listing.id} className="p-4 flex items-center gap-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <FiShoppingBag className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{listing.title}</p>
                  <p className="text-xs text-gray-500">by {listing.seller?.name}</p>
                </div>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                  listing.status === 'Active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'
                }`}>
                  {listing.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
