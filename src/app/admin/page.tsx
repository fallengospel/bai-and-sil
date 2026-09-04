'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Stats {
  totalUsers: number;
  activeListings: number;
  listingsToday: number;
  totalSold: number;
  pendingReports: number;
}

interface RecentListing {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  seller: { name: string };
}

export default function AdminDashboard() {
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recentListings, setRecentListings] = useState<RecentListing[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/admin/users').then(r => r.json()),
      fetch('/api/admin/listings').then(r => r.json()),
      fetch('/api/admin/reports').then(r => r.json()),
    ]).then(([usersData, listingsData, reportsData]) => {
      if (!usersData.users) { router.push('/'); return; }
      const users = usersData.users || [];
      const listings = listingsData.listings || [];
      const reports = reportsData.reports || [];
      const today = new Date().toDateString();
      setStats({
        totalUsers: users.length,
        activeListings: listings.filter((l: any) => l.status === 'Active').length,
        listingsToday: listings.filter((l: any) => new Date(l.createdAt).toDateString() === today).length,
        totalSold: listings.filter((l: any) => l.status === 'Sold').length,
        pendingReports: reports.filter((r: any) => r.status === 'Pending').length,
      });
      setRecentListings(listings.slice(0, 10));
    }).catch(() => router.push('/'))
      .finally(() => setLoading(false));
  }, [router]);

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-bai-blue" /></div>;

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, color: 'bg-bai-blue-light text-bai-blue' },
    { label: 'Active Listings', value: stats?.activeListings || 0, color: 'bg-green-100 text-green-700' },
    { label: 'Listings Today', value: stats?.listingsToday || 0, color: 'bg-sil-yellow-light text-sil-yellow-dark' },
    { label: 'Total Sold', value: stats?.totalSold || 0, color: 'bg-purple-100 text-purple-700' },
    { label: 'Pending Reports', value: stats?.pendingReports || 0, color: 'bg-red-100 text-red-700' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Admin Dashboard</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        {statCards.map((s) => (
          <div key={s.label} className="card p-4">
            <p className="text-sm text-gray-500">{s.label}</p>
            <p className="text-2xl font-bold mt-1">{s.value}</p>
          </div>
        ))}
      </div>
      <div className="card">
        <div className="p-4 border-b"><h2 className="font-bold text-lg">Recent Listings</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50"><tr><th className="text-left p-3">Title</th><th className="text-left p-3">Seller</th><th className="text-left p-3">Status</th><th className="text-left p-3">Created</th></tr></thead>
            <tbody>
              {recentListings.map((l) => (
                <tr key={l.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 font-medium">{l.title}</td>
                  <td className="p-3">{l.seller.name}</td>
                  <td className="p-3"><span className={`badge ${l.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>{l.status}</span></td>
                  <td className="p-3">{new Date(l.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
              {recentListings.length === 0 && <tr><td colSpan={4} className="p-8 text-center text-gray-400">No listings yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
