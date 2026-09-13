"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import ImageGallery from "@/components/ui/ImageGallery";
import Badge from "@/components/ui/Badge";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import Input from "@/components/ui/Input";
import ReportModal from "@/components/ui/ReportModal";
import ListingShareButtons from "@/components/ui/ListingShareButtons";
import VerificationBadge from "@/components/ui/VerificationBadge";
import { formatPrice, timeAgo } from "@/lib/helpers";
import { trackRecentlyViewed } from "@/lib/recently-viewed";
import { FiMessageSquare, FiHeart, FiShare2, FiFlag, FiShield, FiBell, FiBellOff } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";
import ReviewForm from "@/components/ReviewForm";
import ProductCard from "@/components/ui/ProductCard";

interface ListingData {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  status: string;
  createdAt: string;
  seller: {
    id: string;
    name: string;
    avatar: string | null;
    location: string | null;
    rating: number;
    reviewCount: number;
    createdAt: string;
    verified?: boolean;
  };
  category: { id: string; name: string; slug: string } | null;
  images: { imageUrl: string }[];
  _count: { favorites: number };
}

interface ListingClientProps {
  listing: ListingData;
  isOwner: boolean;
  isFavorited: boolean;
  currentUser: { id: string; name: string } | null;
  sellerListingCount: number;
  priceAlerted?: boolean;
  relatedListings?: any[];
}

export default function ListingClient({
  listing,
  isOwner,
  isFavorited: initialFavorited,
  currentUser,
  sellerListingCount,
  priceAlerted: initialPriceAlerted = false,
  relatedListings = [],
}: ListingClientProps) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [offerModal, setOfferModal] = useState(false);
  const [offerAmount, setOfferAmount] = useState("");
  const [reportModal, setReportModal] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [priceAlerted, setPriceAlerted] = useState(initialPriceAlerted);
  const [alertProcessing, setAlertProcessing] = useState(false);

  useEffect(() => {
    if (listing.images.length > 0) {
      trackRecentlyViewed({
        id: listing.id,
        slug: listing.slug,
        title: listing.title,
        price: listing.price,
        imageUrl: listing.images[0]?.imageUrl || "",
        condition: listing.condition,
      });
    }
  }, [listing]);

  const images = listing.images.map((img) => img.imageUrl);
  const isSold = listing.status === "Sold";
  const isReserved = listing.status === "Reserved";

  const handleFavorite = async () => {
    if (!currentUser) {
      toast.error("Please log in to save items");
      return;
    }
    try {
      const res = await fetch(`/api/listings/${listing.id}/favorite`, { method: "POST" });
      const data = await res.json();
      setFavorited(data.favorited);
    } catch {
      toast.error("Failed to update favorite");
    }
  };

  const handleMessageSeller = async () => {
    if (!currentUser) {
      toast.error("Please log in to message sellers");
      return;
    }
    try {
      const res = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: listing.seller.id, listingId: listing.id }),
      });
      const data = await res.json();
      router.push(`/messages/${data.conversation.id}`);
    } catch {
      toast.error("Failed to start conversation");
    }
  };

  const handleMakeOffer = async () => {
    if (!offerAmount || parseFloat(offerAmount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }

    try {
      const convRes = await fetch("/api/conversations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sellerId: listing.seller.id, listingId: listing.id }),
      });
      const convData = await convRes.json();

      await fetch(`/api/conversations/${convData.conversation.id}/offers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: offerAmount }),
      });

      toast.success("Offer sent!");
      setOfferModal(false);
      setOfferAmount("");
      router.push(`/messages/${convData.conversation.id}`);
    } catch {
      toast.error("Failed to send offer");
    }
  };

  const handleUpdateStatus = async (status: string) => {
    setUpdating(true);
    try {
      await fetch(`/api/listings/${listing.id}/status`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ status }),
      });
      toast.success(`Listing marked as ${status.toLowerCase()}`);
      router.refresh();
    } catch {
      toast.error("Failed to update listing");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Remove this listing?")) return;
    setUpdating(true);
    try {
      await fetch(`/api/listings/${listing.id}`, { method: "DELETE" });
      toast.success("Listing removed");
      router.push("/");
    } catch {
      toast.error("Failed to remove listing");
    } finally {
      setUpdating(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied!");
  };

  const handlePriceAlert = async () => {
    if (!currentUser) {
      toast.error("Please log in to set price alerts");
      return;
    }
    setAlertProcessing(true);
    try {
      const res = await fetch("/api/price-alerts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      });
      const data = await res.json();
      setPriceAlerted(data.subscribed);
      toast.success(data.message);
    } catch {
      toast.error("Failed to update price alert");
    } finally {
      setAlertProcessing(false);
    }
  };

  const memberSince = new Date(listing.seller.createdAt).toLocaleDateString("en-PH", {
    month: "short",
    year: "numeric",
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Images */}
        <div className="relative">
          <ImageGallery images={images} alt={listing.title} />
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-[#e8634a] text-white text-2xl font-bold px-8 py-3 rounded-full -rotate-12 shadow-lg">
                SOLD
              </span>
            </div>
          )}
          {isReserved && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <span className="bg-[#F3D98F] text-white text-2xl font-bold px-8 py-3 rounded-full -rotate-12 shadow-lg">
                RESERVED
              </span>
            </div>
          )}
        </div>

        {/* Right: Details */}
        <div className="space-y-6">
          <div>
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold text-gray-900">{listing.title}</h1>
            </div>

            {/* Share buttons */}
            <div className="mt-3">
              <ListingShareButtons title={listing.title} url={window.location.href} />
            </div>

            <div className="flex items-center gap-3 mt-3">
              <span className="text-3xl font-bold text-[#7298C7]">
                {formatPrice(listing.price)}
              </span>
              {listing.category && (
                <Badge variant="blue">{listing.category.name}</Badge>
              )}
            </div>

            <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
              <Badge
                variant={
                  listing.condition === "Brand New"
                    ? "green"
                    : listing.condition === "Like New"
                    ? "blue"
                    : listing.condition === "Good"
                    ? "yellow"
                    : "gray"
                }
              >
                {listing.condition}
              </Badge>
              <span className="flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {listing.location}
              </span>
            </div>
          </div>

          {/* CTAs */}
          {!isOwner && !isSold && (
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleMessageSeller} leftIcon={<FiMessageSquare className="w-4 h-4" />}>
                Message Seller
              </Button>
              <Button variant="outline" onClick={() => setOfferModal(true)}>
                Make an Offer
              </Button>
              <Button
                variant={priceAlerted ? "secondary" : "ghost"}
                onClick={handlePriceAlert}
                loading={alertProcessing}
                leftIcon={priceAlerted ? <FiBellOff className="w-4 h-4" /> : <FiBell className="w-4 h-4" />}
              >
                {priceAlerted ? "Alert Set" : "Notify me"}
              </Button>
              <button
                onClick={handleFavorite}
                className={`p-3 rounded-lg border transition-colors ${
                  favorited
                    ? "bg-[#e8634a]/10 border-[#e8634a] text-[#e8634a]"
                    : "border-gray-200 text-gray-400 hover:text-[#e8634a]"
                }`}
              >
                {favorited ? <FaHeart className="w-5 h-5" /> : <FiHeart className="w-5 h-5" />}
              </button>
            </div>
          )}

          {/* Owner management */}
          {isOwner && (
            <div className="flex flex-wrap gap-3">
              <Link href={`/listing/${listing.slug}/edit`}>
                <Button variant="outline">Edit</Button>
              </Link>
              {listing.status === "Active" && (
                <>
                  <Button
                    variant="ghost"
                    loading={updating}
                    onClick={() => handleUpdateStatus("Reserved")}
                  >
                    Mark as Reserved
                  </Button>
                  <Button
                    variant="secondary"
                    loading={updating}
                    onClick={() => handleUpdateStatus("Sold")}
                  >
                    Mark as Sold
                  </Button>
                </>
              )}
              <Button variant="danger" loading={updating} onClick={handleDelete}>
                Delete
              </Button>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
            <p className="text-gray-600 whitespace-pre-wrap text-sm leading-relaxed">
              {listing.description}
            </p>
          </div>

          <p className="text-xs text-gray-400">Posted {timeAgo(listing.createdAt)}</p>

          {/* Seller Card */}
          <div className="bg-gray-50 rounded-xl p-5">
            <div className="flex items-center gap-3 mb-3">
              <Avatar src={listing.seller.avatar} name={listing.seller.name} size="lg" />
              <div>
                <div className="flex items-center gap-1.5">
                  <Link
                    href={`/profile/${listing.seller.id}`}
                    className="font-semibold text-gray-900 hover:text-[#7298C7]"
                  >
                    {listing.seller.name}
                  </Link>
                  {listing.seller.verified && <VerificationBadge size="sm" />}
                </div>
                <StarRating rating={listing.seller.rating} size="sm" />
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{sellerListingCount} active listings</span>
              <span>Member since {memberSince}</span>
            </div>
            <Link
              href={`/profile/${listing.seller.id}`}
              className="inline-block mt-3 text-sm font-medium text-[#7298C7] hover:underline"
            >
              View Seller
            </Link>
          </div>

          {/* Trust Tips */}
          <div className="bg-blue-50 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <FiShield className="w-5 h-5 text-[#7298C7]" />
              <h3 className="font-semibold text-gray-900">Trust Tips</h3>
            </div>
            <ul className="text-sm text-gray-600 space-y-1">
              <li>• Meet in a public, well-lit place</li>
              <li>• Inspect the item before paying</li>
              <li>• Use secure payment methods</li>
              <li>• If a deal seems too good to be true, it probably is</li>
            </ul>
          </div>

          {/* Review Form for sold listings */}
          {isSold && !isOwner && currentUser && (
            <ReviewForm
              listingId={listing.id}
              revieweeId={listing.seller.id}
            />
          )}
        </div>
      </div>

      {/* Offer Modal */}
      <Modal
        open={offerModal}
        onClose={() => setOfferModal(false)}
        title="Make an Offer"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setOfferModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleMakeOffer} fullWidth>
              Send Offer
            </Button>
          </div>
        }
      >
        <p className="text-sm text-gray-500 mb-4">
          Listed price: <strong>{formatPrice(listing.price)}</strong>
        </p>
        <Input
          label="Your offer (₱)"
          type="number"
          value={offerAmount}
          onChange={(e) => setOfferAmount(e.target.value)}
          placeholder="0"
          min="1"
        />
      </Modal>

      <ReportModal
        open={reportModal}
        onClose={() => setReportModal(false)}
        listingId={listing.id}
      />

      {/* Related Items */}
      {relatedListings.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Related Items</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedListings.map((item: any) => (
              <ProductCard key={item.id} listing={item} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
