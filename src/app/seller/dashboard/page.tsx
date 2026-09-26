"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FiPackage, FiDollarSign, FiStar, FiMessageSquare, FiPlusCircle, FiTrendingUp, FiEye, FiDownload } from "react-icons/fi";

interface ListingData {
  id: string;
  title: string;
  price: number;
  status: string;
  views: number;
  viewCount?: number;
  condition: string;
  location: string;
  createdAt: string;
  category?: { name: string };
}

interface SellerStats {
  totalListings: number;
  activeListings: number;
  soldListings: number;
  totalViews: number;
  avgViewsPerListing: number;
  sellThroughRate: number;
  recentListings: ListingData[];
}

function exportToCSV(listings: ListingData[]) {
  const headers = ["Title", "Price", "Status", "Views", "Condition", "Location", "Category", "Date"];
  const rows = listings.map((l) => [
    `"${l.title.replace(/"/g, '""')}"`,
    l.price,
    l.status,
    l.views || 0,
    l.condition,
    `"${l.location}"`,
    l.category?.name || "",
    new Date(l.createdAt).toLocaleDateString(),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `listings-export-${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

export default function SellerDashboard() {
  const [stats, setStats] = useState<SellerStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/auth/me", { credentials: "include" }).then((r) => r.json()),
      fetch("/api/seller/stats", { credentials: "include" }).then((r) =>
        r.ok ? r.json() : null
      ),
    ])
      .then(([userData, statsData]) => {
        setUser(userData.user);
        if (statsData) {
          setStats({
            totalListings: statsData.totalListings,
            activeListings: statsData.activeListings,
            soldListings: statsData.soldListings,
            totalViews: statsData.totalViews,
            avgViewsPerListing: statsData.avgViewsPerListing,
            sellThroughRate: statsData.sellThroughRate,
            recentListings: statsData.recentListings,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    try {
      const res = await fetch("/api/seller/stats?export=1", { credentials: "include" });
      if (!res.ok) return;
      const data = await res.json();
      exportToCSV((data.listings || []).map((l: any) => ({ ...l, views: l.viewCount || 0 })));
    } catch {
      // export failed silently — button remains available for retry
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sil-yellow" />
      </div>
    );

  return (
    <div className="space-y-6 page-transition">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Seller Dashboard</h1>
          <p className="text-gray-500 mt-1">Welcome back, {user?.name || "Seller"}!</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-2xl hover:bg-gray-50 transition-all duration-200 shadow-card hover:shadow-card-hover"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
          <Link
            href="/sell"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sil-yellow to-sil-yellow/90 text-white font-medium rounded-2xl hover:from-sil-yellow/90 hover:to-sil-yellow transition-all duration-200 shadow-card hover:shadow-card-hover shadow-cartoon hover:-translate-y-0.5"
          >
            <FiPlusCircle className="w-4 h-4" />
            New Listing
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-sil-yellow to-sil-yellow/80 rounded-2xl flex items-center justify-center shadow-sm">
              <FiPackage className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.totalListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-400 rounded-2xl flex items-center justify-center shadow-sm">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.activeListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-400 rounded-2xl flex items-center justify-center shadow-sm">
              <FiDollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sold</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.soldListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-bai-blue to-bai-blue/80 rounded-2xl flex items-center justify-center shadow-sm">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Views</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.totalViews || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-400 rounded-2xl flex items-center justify-center shadow-sm">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Views</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.avgViewsPerListing || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-400 rounded-2xl flex items-center justify-center shadow-sm">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sell-Through</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.sellThroughRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Analytics Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-bai-blue-light rounded-2xl">
            <div className="text-3xl font-bold text-bai-blue">{stats?.totalViews || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Total Views</div>
          </div>
          <div className="text-center p-4 bg-sil-yellow-light rounded-2xl">
            <div className="text-3xl font-bold text-sil-yellow">{stats?.avgViewsPerListing || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Views/Listing</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-2xl">
            <div className="text-3xl font-bold text-green-600">{stats?.sellThroughRate || 0}%</div>
            <div className="text-sm text-gray-500 mt-1">Sell-Through Rate</div>
          </div>
        </div>
      </div>

      {/* Listings Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-card">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Listing Performance</h2>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Active Listings</span>
              <span className="font-bold text-gray-900">{stats?.activeListings || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((stats?.activeListings || 0) / (stats?.totalListings || 1)) * 100}%` }}
              />
            </div>
          </div>
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Sold Items</span>
              <span className="font-bold text-gray-900">{stats?.soldListings || 0}</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-purple-500 to-purple-400 h-3 rounded-full transition-all duration-700 ease-out"
                style={{ width: `${((stats?.soldListings || 0) / (stats?.totalListings || 1)) * 100}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/sell" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-sil-yellow/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-sil-yellow-light rounded-2xl flex items-center justify-center mb-4 group-hover:bg-sil-yellow/20 transition-colors">
            <FiPlusCircle className="w-6 h-6 text-sil-yellow" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Create Listing</h3>
          <p className="text-sm text-gray-500">List a new item for sale</p>
        </Link>
        <Link href="/my-listings" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-bai-blue/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-bai-blue-light rounded-2xl flex items-center justify-center mb-4 group-hover:bg-bai-blue/20 transition-colors">
            <FiPackage className="w-6 h-6 text-bai-blue" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Manage Listings</h3>
          <p className="text-sm text-gray-500">View and edit your listings</p>
        </Link>
        <Link href="/messages" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-500/50 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
            <FiMessageSquare className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Messages</h3>
          <p className="text-sm text-gray-500">Check buyer inquiries</p>
        </Link>
      </div>

      {/* Recent Listings */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-card">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Your Recent Listings</h2>
          <Link href="/my-listings" className="text-sm text-sil-yellow hover:underline font-medium">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(stats?.recentListings || []).map((listing: any) => (
            <div key={listing.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                {listing.imageUrl ? (
                  <img src={listing.imageUrl} alt={listing.title} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <FiPackage className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate text-gray-900">{listing.title}</p>
                <p className="text-sm text-gray-500">₱{listing.price?.toLocaleString()}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <FiEye className="w-3 h-3" /> {listing.views || 0}
                </span>
                <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                  listing.status === "Active" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                }`}>
                  {listing.status}
                </span>
              </div>
            </div>
          ))}
          {(stats?.recentListings || []).length === 0 && (
            <div className="p-10 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <FiPackage className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 mb-2">No listings yet</p>
              <Link href="/sell" className="text-sil-yellow hover:underline font-medium">Create your first listing</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
