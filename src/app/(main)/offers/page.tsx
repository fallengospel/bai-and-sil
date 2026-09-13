"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { formatPrice, timeAgo } from "@/lib/helpers";
import { FiDollarSign, FiArrowUpRight, FiArrowDownRight } from "react-icons/fi";

interface OfferListing {
  id: string;
  title: string;
  slug: string;
  price: number;
  status: string;
  imageUrl: string;
}

interface OfferPerson {
  id: string;
  name: string;
  avatar: string | null;
}

interface Offer {
  id: string;
  amount: number;
  status: string;
  createdAt: string;
  listing: OfferListing;
  seller?: OfferPerson;
  buyer?: OfferPerson;
  role: "buyer" | "seller";
}

type TabType = "sent" | "received";

export default function OffersPage() {
  const router = useRouter();
  const [offers, setOffers] = useState<Offer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>("sent");

  useEffect(() => {
    const fetchOffers = async () => {
      try {
        const meRes = await fetch("/api/auth/me");
        const meData = await meRes.json();
        if (!meData.user) {
          router.push("/login?redirect=/offers");
          return;
        }

        const res = await fetch("/api/users/me/offers");
        if (!res.ok) {
          router.push("/login");
          return;
        }
        const data = await res.json();
        const sent = (data.sent || []).map((o: any) => ({ ...o, role: "buyer" as const }));
        const received = (data.received || []).map((o: any) => ({ ...o, role: "seller" as const }));
        setOffers([...sent, ...received]);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    };
    fetchOffers();
  }, [router]);

  const sentOffers = offers.filter((o) => o.role === "buyer");
  const receivedOffers = offers.filter((o) => o.role === "seller");
  const filteredOffers = activeTab === "sent" ? sentOffers : receivedOffers;

  const statusVariant = (status: string): "green" | "yellow" | "red" | "blue" | "gray" => {
    switch (status) {
      case "Accepted": return "green";
      case "Pending": return "yellow";
      case "Rejected": return "red";
      case "Countered": return "blue";
      default: return "gray";
    }
  };

  if (loading) return <LoadingSpinner text="Loading offers..." className="py-16" />;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">My Offers</h1>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-200 mb-6">
        {[
          { key: "sent" as TabType, label: "Sent", count: sentOffers.length },
          { key: "received" as TabType, label: "Received", count: receivedOffers.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
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

      {filteredOffers.length === 0 ? (
        <EmptyState
          icon={<FiDollarSign className="w-12 h-12" />}
          title={`No ${activeTab} offers`}
          description={
            activeTab === "sent"
              ? "You haven't made any offers yet."
              : "No one has made offers on your listings yet."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredOffers.map((offer) => (
            <Link
              key={offer.id}
              href={`/listing/${offer.listing.slug}`}
              className="flex items-center gap-4 p-4 bg-white rounded-xl border border-gray-100 hover:shadow-md transition-shadow"
            >
              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                <img
                  src={offer.listing.imageUrl || "/placeholder.svg"}
                  alt={offer.listing.title}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {offer.listing.title}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  {offer.role === "buyer" ? (
                    <FiArrowUpRight className="w-3 h-3 text-[#7298C7]" />
                  ) : (
                    <FiArrowDownRight className="w-3 h-3 text-[#F3D98F]" />
                  )}
                  <span className="text-sm font-bold text-[#7298C7]">
                    {formatPrice(offer.amount)}
                  </span>
                  <span className="text-xs text-gray-400">
                    (Listed: {formatPrice(offer.listing.price)})
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-1">
                  {offer.role === "buyer" ? `To: ${offer.seller?.name}` : `From: ${offer.buyer?.name}`} • {timeAgo(offer.createdAt)}
                </p>
              </div>
              <div className="flex flex-col items-end gap-1">
                <Badge variant={statusVariant(offer.status)} size="sm">
                  {offer.status}
                </Badge>
                {offer.listing.status !== "Active" && (
                  <Badge variant="gray" size="sm">{offer.listing.status}</Badge>
                )}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
