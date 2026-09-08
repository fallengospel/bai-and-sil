"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ProductCard from "@/components/ui/ProductCard";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { FiPackage, FiPlus } from "react-icons/fi";

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
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-[#1a56db] text-[#1a56db]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.label} ({tab.count})
          </button>
        ))}
      </div>

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
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </div>
  );
}
