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
  conversionRate: number;
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
      fetch("/api/listings?limit=50", { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([userData, listingsData]) => {
        setUser(userData.user);
        const myListings = (listingsData.listings || []).filter(
          (l: any) => l.seller?.id === userData.user?.id
        );
        const totalViews = myListings.reduce((sum: number, l: any) => sum + (l.views || 0), 0);
        const activeCount = myListings.filter((l: any) => l.status === "Active").length;
        const soldCount = myListings.filter((l: any) => l.status === "Sold").length;
        setStats({
          totalListings: myListings.length,
          activeListings: activeCount,
          soldListings: soldCount,
          totalViews,
          avgViewsPerListing: myListings.length > 0 ? Math.round(totalViews / myListings.length) : 0,
          conversionRate: myListings.length > 0 ? Math.round((soldCount / myListings.length) * 100) : 0,
          recentListings: myListings.slice(0, 5),
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#f5a623]" />
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
            onClick={() => stats?.recentListings && exportToCSV(stats.recentListings)}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <FiDownload className="w-4 h-4" />
            Export CSV
          </button>
          <Link
            href="/sell"
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-[#f5a623] to-[#f5a623]/90 text-white font-medium rounded-xl hover:from-[#f5a623]/90 hover:to-[#f5a623] transition-all duration-200 shadow-sm hover:shadow-md hover:-translate-y-0.5"
          >
            <FiPlusCircle className="w-4 h-4" />
            New Listing
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-3 lg:grid-cols-6">
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#f5a623] to-[#f5a623]/80 rounded-xl flex items-center justify-center shadow-sm">
              <FiPackage className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.totalListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-green-500 to-green-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.activeListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiDollarSign className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Sold</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.soldListings || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-[#1a56db] to-[#1a56db]/80 rounded-xl flex items-center justify-center shadow-sm">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Views</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.totalViews || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-orange-500 to-orange-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiEye className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Avg Views</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.avgViewsPerListing || 0}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-gradient-to-br from-teal-500 to-teal-400 rounded-xl flex items-center justify-center shadow-sm">
              <FiTrendingUp className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Conversion</p>
              <p className="text-xl font-bold text-gray-900 animate-count-up">{stats?.conversionRate || 0}%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Analytics Bar */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Analytics Overview</h2>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-[#1a56db]/5 rounded-xl">
            <div className="text-3xl font-bold text-[#1a56db]">{stats?.totalViews || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Total Views</div>
          </div>
          <div className="text-center p-4 bg-[#f5a623]/5 rounded-xl">
            <div className="text-3xl font-bold text-[#f5a623]">{stats?.avgViewsPerListing || 0}</div>
            <div className="text-sm text-gray-500 mt-1">Avg Views/Listing</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-xl">
            <div className="text-3xl font-bold text-green-600">{stats?.conversionRate || 0}%</div>
            <div className="text-sm text-gray-500 mt-1">Sell-Through Rate</div>
          </div>
        </div>
      </div>

      {/* Listings Performance */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="text-lg font-bold text-gray-900 mb-5">Listing Performance</h2>
        <div className="space-y-5">
          <div>
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-600">Active Listings</span>
              <span className="font-semibold text-gray-900">{stats?.activeListings || 0}</span>
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
              <span className="font-semibold text-gray-900">{stats?.soldListings || 0}</span>
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
        <Link href="/sell" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#f5a623]/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-[#f5a623]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#f5a623]/20 transition-colors">
            <FiPlusCircle className="w-6 h-6 text-[#f5a623]" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Create Listing</h3>
          <p className="text-sm text-gray-500">List a new item for sale</p>
        </Link>
        <Link href="/my-listings" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-[#1a56db]/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-[#1a56db]/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-[#1a56db]/20 transition-colors">
            <FiPackage className="w-6 h-6 text-[#1a56db]" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Manage Listings</h3>
          <p className="text-sm text-gray-500">View and edit your listings</p>
        </Link>
        <Link href="/messages" className="bg-white rounded-2xl border border-gray-100 p-6 hover:border-green-500/50 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 group">
          <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-green-500/20 transition-colors">
            <FiMessageSquare className="w-6 h-6 text-green-500" />
          </div>
          <h3 className="font-bold text-gray-900 mb-1">Messages</h3>
          <p className="text-sm text-gray-500">Check buyer inquiries</p>
        </Link>
      </div>

      {/* Recent Listings */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
        <div className="p-5 border-b border-gray-100 flex items-center justify-between">
          <h2 className="font-bold text-lg">Your Recent Listings</h2>
          <Link href="/my-listings" className="text-sm text-[#f5a623] hover:underline font-medium">View all</Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(stats?.recentListings || []).map((listing: any) => (
            <div key={listing.id} className="p-4 flex items-center gap-4 hover:bg-gray-50/50 transition-colors">
              <div className="w-12 h-12 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
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
              <Link href="/sell" className="text-[#f5a623] hover:underline font-medium">Create your first listing</Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
