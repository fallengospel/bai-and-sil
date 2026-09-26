"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Badge from "@/components/ui/Badge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Button from "@/components/ui/Button";
import { formatPrice, timeAgo } from "@/lib/helpers";
import { FiDollarSign, FiArrowUpRight, FiArrowDownRight, FiMessageSquare } from "react-icons/fi";

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
  conversationId: string;
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
  const [respondingId, setRespondingId] = useState<string | null>(null);

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

  const handleRespond = async (offer: Offer, status: "Accepted" | "Declined") => {
    setRespondingId(offer.id);
    try {
      const res = await fetch(`/api/listings/${offer.listing.id}/offers/${offer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => null);
        toast.error(data?.error || "Failed to update offer");
        return;
      }
      setOffers((prev) => prev.map((o) => (o.id === offer.id ? { ...o, status } : o)));
      toast.success(`Offer ${status.toLowerCase()}!`);
    } catch {
      toast.error("Failed to update offer");
    } finally {
      setRespondingId(null);
    }
  };

  const statusVariant = (status: string): "green" | "yellow" | "red" | "blue" | "gray" => {
    switch (status) {
      case "Accepted": return "green";
      case "Pending": return "yellow";
      case "Declined":
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
                ? "border-bai-blue text-bai-blue"
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
            <div
              key={offer.id}
              className="p-4 bg-white rounded-2xl border border-gray-100 hover:shadow-card-hover transition-shadow"
            >
              <div className="flex items-center gap-4">
                <Link href={`/listing/${offer.listing.slug}`} className="w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0">
                  <img
                    src={offer.listing.imageUrl || "/placeholder.svg"}
                    alt={offer.listing.title}
                    className="w-full h-full object-cover"
                  />
                </Link>
                <div className="flex-1 min-w-0">
                  <Link
                    href={`/listing/${offer.listing.slug}`}
                    className="text-sm font-medium text-gray-900 truncate hover:text-bai-blue transition-colors block"
                  >
                    {offer.listing.title}
                  </Link>
                  <div className="flex items-center gap-2 mt-1">
                    {offer.role === "buyer" ? (
                      <FiArrowUpRight className="w-3 h-3 text-bai-blue" />
                    ) : (
                      <FiArrowDownRight className="w-3 h-3 text-sil-yellow" />
                    )}
                    <span className="text-sm font-bold text-bai-blue">
                      {formatPrice(offer.amount)}
                    </span>
                    <span className="text-xs text-gray-400">
                      (Listed: {formatPrice(offer.listing.price)})
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    {offer.role === "buyer" ? `To: ${offer.seller?.name}` : `From: ${offer.buyer?.name}`} â€¢ {timeAgo(offer.createdAt)}
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
              </div>

              <div className="flex items-center justify-end gap-2 mt-3 pt-3 border-t border-gray-100">
                <Link
                  href={`/messages/${offer.conversationId}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  <FiMessageSquare className="w-3.5 h-3.5" /> Conversation
                </Link>
                {offer.role === "seller" && offer.status === "Pending" && (
                  <>
                    <Button
                      size="sm"
                      variant="outline"
                      loading={respondingId === offer.id}
                      onClick={() => handleRespond(offer, "Declined")}
                    >
                      Decline
                    </Button>
                    <Button
                      size="sm"
                      loading={respondingId === offer.id}
                      onClick={() => handleRespond(offer, "Accepted")}
                    >
                      Accept
                    </Button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
