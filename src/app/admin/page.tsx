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
      fetch('/api/admin/users', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/listings', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/admin/reports', { credentials: 'include' }).then(r => r.json()),
      fetch('/api/categories', { credentials: 'include' }).then(r => r.json()),
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
        categoryStats: categories.map((c: any) => ({ name: c.name, count: c.listingCount || c._count?.listings || 0 })),
      });
    }).catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7298C7]" /></div>;

  const maxCategoryCount = Math.max(...(stats?.categoryStats.map(c => c.count) || [1]));

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, Admin</p>
        </div>
      </div>

      {/* Main Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#7298C7] to-[#7298C7]/80 rounded-xl flex items-center justify-center shadow-sm">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 animate-count-up">{stats?.totalUsers || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiPackage className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Active Listings</p>
              <p className="text-2xl font-bold text-gray-900 animate-count-up">{stats?.activeListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiStar className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Sold</p>
              <p className="text-2xl font-bold text-gray-900 animate-count-up">{stats?.totalSold || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-[#e8634a] to-red-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiAlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending Reports</p>
              <p className="text-2xl font-bold text-gray-900 animate-count-up">{stats?.pendingReports || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* User Breakdown Chart */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <FiUserCheck className="w-5 h-5 text-[#7298C7]" />
            User Breakdown
          </h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Buyers</span>
                <span className="font-semibold text-gray-900">{stats?.totalBuyers || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#7298C7] to-[#7298C7]/80 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((stats?.totalBuyers || 0) / (stats?.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Sellers</span>
                <span className="font-semibold text-gray-900">{stats?.totalSellers || 0}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#F3D98F] to-[#F3D98F]/80 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${((stats?.totalSellers || 0) / (stats?.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-600">Admins</span>
                <span className="font-semibold text-gray-900">{(stats?.totalUsers || 0) - (stats?.totalBuyers || 0) - (stats?.totalSellers || 0)}</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-[#e8634a] to-red-400 h-3 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${(((stats?.totalUsers || 0) - (stats?.totalBuyers || 0) - (stats?.totalSellers || 0)) / (stats?.totalUsers || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
          <div className="mt-5 pt-4 border-t border-gray-100 flex gap-5 text-sm">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#7298C7] rounded-full" /> Buyer</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#F3D98F] rounded-full" /> Seller</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-[#e8634a] rounded-full" /> Admin</span>
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-900 mb-5 flex items-center gap-2">
            <FiTrendingUp className="w-5 h-5 text-green-600" />
            Listings by Category
          </h2>
          <div className="space-y-4">
            {(stats?.categoryStats || []).slice(0, 6).map((cat) => (
              <div key={cat.name}>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-gray-600 truncate">{cat.name}</span>
                  <span className="font-semibold text-gray-900">{cat.count}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-[#7298C7] to-[#F3D98F] h-2.5 rounded-full transition-all duration-700 ease-out"
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
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">Recent Users</h2>
            <Link href="/admin/users" className="text-sm text-[#7298C7] hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentUsers || []).map((user: any) => (
              <div key={user.id} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-sm font-semibold text-gray-600">
                  {user.name?.charAt(0) || '?'}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-gray-900">{user.name}</p>
                  <p className="text-xs text-gray-500 truncate">{user.email}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  user.role === 'seller' ? 'bg-[#F3D98F]/10 text-[#E8C86A]' :
                  user.role === 'admin' ? 'bg-red-100 text-red-700' :
                  'bg-[#7298C7]/10 text-[#7298C7]'
                }`}>
                  {user.role || 'buyer'}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <h2 className="font-bold text-lg">Recent Listings</h2>
            <Link href="/admin/listings" className="text-sm text-[#7298C7] hover:underline font-medium">View all</Link>
          </div>
          <div className="divide-y divide-gray-50">
            {(stats?.recentListings || []).map((listing: any) => (
              <div key={listing.id} className="p-4 flex items-center gap-3 hover:bg-gray-50/50 transition-colors">
                <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center">
                  <FiShoppingBag className="w-5 h-5 text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate text-gray-900">{listing.title}</p>
                  <p className="text-xs text-gray-500">by {listing.seller?.name}</p>
                </div>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  listing.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
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
