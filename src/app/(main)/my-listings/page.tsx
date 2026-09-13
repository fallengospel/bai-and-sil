"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { FiPackage, FiPlus, FiTrash2 } from "react-icons/fi";
import toast from "react-hot-toast";

interface Listing {
  id: string;
  slug: string;
  title: string;
  price: number;
  location: string;
  condition: string;
  status: string;
  imageUrl: string;
  seller: { id: string; name: string; avatar: string | null };
  category?: { id: string; name: string; slug: string };
}

type TabType = "active" | "sold" | "reserved" | "removed";

export default function MyListingsPage() {
  const router = useRouter();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("active");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<"delete" | "Sold" | "Reserved" | "Active" | "">("");
  const [bulkProcessing, setBulkProcessing] = useState(false);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user) {
          router.push("/login?redirect=/my-listings");
          return;
        }

        const res = await fetch(`/api/users/${meData.user.id}`);
        const data = await res.json();
        setListings(data.listings || []);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchListings();
  }, [router]);

  const filteredListings = listings.filter((l) => {
    switch (activeTab) {
      case "active": return l.status === "Active";
      case "sold": return l.status === "Sold";
      case "reserved": return l.status === "Reserved";
      case "removed": return l.status === "Removed";
      default: return true;
    }
  });

  const tabs: { key: TabType; label: string; count: number }[] = [
    { key: "active", label: "Active", count: listings.filter((l) => l.status === "Active").length },
    { key: "sold", label: "Sold", count: listings.filter((l) => l.status === "Sold").length },
    { key: "reserved", label: "Reserved", count: listings.filter((l) => l.status === "Reserved").length },
    { key: "removed", label: "Removed", count: listings.filter((l) => l.status === "Removed").length },
  ];

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredListings.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredListings.map((l) => l.id)));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedIds.size === 0) return;
    setBulkProcessing(true);
    try {
      if (bulkAction === "delete") {
        await Promise.all(
          Array.from(selectedIds).map((id) =>
            fetch(`/api/listings/${id}`, { method: "DELETE" })
          )
        );
        setListings((prev) => prev.filter((l) => !selectedIds.has(l.id)));
        toast.success(`${selectedIds.size} listing(s) deleted`);
      } else {
        await Promise.all(
          Array.from(selectedIds).map((id) =>
            fetch(`/api/listings/${id}`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ status: bulkAction }),
            })
          )
        );
        setListings((prev) =>
          prev.map((l) =>
            selectedIds.has(l.id) ? { ...l, status: bulkAction } : l
          )
        );
        toast.success(`${selectedIds.size} listing(s) updated to ${bulkAction}`);
      }
      setSelectedIds(new Set());
      setBulkAction("");
    } catch {
      toast.error("Bulk action failed");
    } finally {
      setBulkProcessing(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading your listings..." className="py-16" />;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Listings</h1>
        <Link href="/sell">
          <Button leftIcon={<FiPlus className="w-4 h-4" />}>New Listing</Button>
        </Link>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSelectedIds(new Set()); }}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#7298C7] text-[#7298C7]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

      {/* Bulk actions bar */}
      {filteredListings.length > 0 && (
        <div className="flex items-center gap-4 mb-4 p-3 bg-gray-50 rounded-lg">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={selectedIds.size === filteredListings.length && filteredListings.length > 0}
              onChange={toggleSelectAll}
              className="w-4 h-4 rounded border-gray-300 text-[#7298C7] focus:ring-[#7298C7]"
            />
            <span className="text-sm text-gray-600">
              {selectedIds.size > 0 ? `${selectedIds.size} selected` : "Select all"}
            </span>
          </label>
          {selectedIds.size > 0 && (
            <>
              <div className="h-4 w-px bg-gray-300" />
              <select
                value={bulkAction}
                onChange={(e) => setBulkAction(e.target.value as any)}
                className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7298C7]/20"
              >
                <option value="">Bulk action</option>
                <option value="Active">Mark Active</option>
                <option value="Reserved">Mark Reserved</option>
                <option value="Sold">Mark Sold</option>
                <option value="delete">Delete</option>
              </select>
              <Button
                size="sm"
                variant={bulkAction === "delete" ? "danger" : "primary"}
                onClick={handleBulkAction}
                loading={bulkProcessing}
                disabled={!bulkAction}
                leftIcon={bulkAction === "delete" ? <FiTrash2 className="w-3 h-3" /> : undefined}
              >
                Apply
              </Button>
            </>
          )}
        </div>
      )}

      {filteredListings.length === 0 ? (
        <EmptyState
          icon={<FiPackage className="w-12 h-12" />}
          title={`No ${activeTab} listings`}
          description={
            activeTab === "active"
              ? "You haven't listed anything yet. Start selling!"
              : `You don't have any ${activeTab} listings.`
          }
          action={
            activeTab === "active"
              ? { label: "Start Selling", href: "/sell" }
              : undefined
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredListings.map((listing) => (
            <div key={listing.id} className="relative">
              <label className="absolute top-2 right-2 z-10 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedIds.has(listing.id)}
                  onChange={() => toggleSelect(listing.id)}
                  className="w-4 h-4 rounded border-gray-300 text-[#7298C7] focus:ring-[#7298C7] bg-white shadow"
                />
              </label>
              <ProductCard listing={listing} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
