"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import FileUpload from "@/components/ui/FileUpload";
import Modal from "@/components/ui/Modal";
import ProductCard from "@/components/ui/ProductCard";
import ReportModal from "@/components/ui/ReportModal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import VerificationBadge from "@/components/ui/VerificationBadge";
import { PH_LOCATIONS } from "@/lib/helpers";
import { FiMessageSquare, FiFlag } from "react-icons/fi";

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  location: string | null;
  bio: string | null;
  phone: string | null;
  role: string;
  rating: number;
  reviewCount: number;
  createdAt: string;
  verified?: boolean;
  _count: { listings: number };
}

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

interface ReviewItem {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  reviewer: { id: string; name: string; avatar: string | null };
  listing: { id: string; title: string; slug: string };
}

const locationOptions = PH_LOCATIONS.flatMap((loc) =>
  loc.cities.map((city) => ({
    value: `${city}, ${loc.province}`,
    label: `${city}, ${loc.province}`,
  }))
);

export default function ProfilePage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [activeTab, setActiveTab] = useState<"active" | "sold" | "reviews">("active");
  const [editModal, setEditModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editPhone, setEditPhone] = useState("");

  const isOwnProfile = currentUserId === id;

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/users/${id}`, { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/listings?limit=50`, { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/reviews?userId=${id}`, { credentials: "include" }).then((r) => r.json()),
    ])
      .then(([userData, listingsData, reviewsData]) => {
        setProfile(userData.user);
        const userListings = (listingsData.listings || []).filter(
          (l: Listing) => l.seller.id === id
        );
        setListings(userListings);
        setReviews(reviewsData.reviews || []);
        if (userData.user) {
          setEditName(userData.user.name);
          setEditBio(userData.user.bio || "");
          setEditLocation(userData.user.location || "");
          setEditAvatar(userData.user.avatar || "");
          setEditPhone(userData.user.phone || "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [id]);

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          location: editLocation,
          avatar: editAvatar,
          phone: editPhone,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProfile((prev) => (prev ? { ...prev, ...data.user } : prev));
        setEditModal(false);
        toast.success("Profile updated!");
      }
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleMessage = async () => {
    if (!currentUserId) {
      toast.error("Please log in to message users");
      return;
    }
    router.push("/messages");
  };

  if (loading) return <LoadingSpinner text="Loading profile..." className="py-16" />;
  if (!profile) return <div className="text-center py-16 text-gray-500">User not found.</div>;

  const activeListings = listings.filter((l) => l.status === "Active");
  const soldListings = listings.filter((l) => l.status === "Sold");

  const displayListings =
    activeTab === "active"
      ? activeListings
      : activeTab === "sold"
      ? soldListings
      : [];

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 page-transition">
      {/* Profile Header */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 md:p-8 mb-8 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
          <Avatar src={profile.avatar} name={profile.name} size="xl" ring />
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
              {profile.verified && <VerificationBadge size="md" />}
              <span className={`inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full capitalize ${
                profile.role === "seller" ? "bg-[#f5a623]/10 text-[#d4901a]" :
                profile.role === "admin" ? "bg-red-100 text-red-700" :
                "bg-[#1a56db]/10 text-[#1a56db]"
              }`}>
                {profile.role}
              </span>
            </div>
            {profile.location && (
              <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {profile.location}
              </p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={profile.rating} size="sm" />
              <span className="text-sm text-gray-500">
                {profile.rating.toFixed(1)} ({profile.reviewCount} reviews)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-2">Member since {memberSince}</p>
          </div>

          <div className="flex items-center gap-3">
            {isOwnProfile ? (
              <>
                <Button variant="outline" onClick={() => setEditModal(true)}>
                  Edit Profile
                </Button>
                {profile.role === "seller" && (
                  <Link href="/seller/dashboard" className="px-4 py-2 text-sm font-medium text-[#f5a623] border border-[#f5a623]/30 rounded-xl hover:bg-[#f5a623]/5 transition-all duration-200">
                    Seller Dashboard
                  </Link>
                )}
                {profile.role === "buyer" && (
                  <Link href="/buyer/dashboard" className="px-4 py-2 text-sm font-medium text-[#1a56db] border border-[#1a56db]/30 rounded-xl hover:bg-[#1a56db]/5 transition-all duration-200">
                    Buyer Dashboard
                  </Link>
                )}
                {(profile.role === "admin") && (
                  <Link href="/admin" className="px-4 py-2 text-sm font-medium text-red-600 border border-red-600/30 rounded-xl hover:bg-red-50 transition-all duration-200">
                    Admin Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Button onClick={handleMessage} leftIcon={<FiMessageSquare className="w-4 h-4" />}>
                  Message
                </Button>
                {currentUserId && (
                  <Button
                    variant="ghost"
                    onClick={() => setReportModal(true)}
                    leftIcon={<FiFlag className="w-4 h-4" />}
                  >
                    Report
                  </Button>
                )}
              </>
            )}
          </div>
        </div>

        {profile.bio && (
          <p className="text-sm text-gray-600 mt-5 leading-relaxed">{profile.bio}</p>
        )}

        <div className="flex items-center gap-6 mt-5 text-sm text-gray-500">
          {profile.role === "seller" && (
            <>
              <span className="flex items-center gap-1">
                <strong className="text-gray-900">{profile._count.listings}</strong> listings
              </span>
              <span className="flex items-center gap-1">
                <strong className="text-gray-900">{soldListings.length}</strong> sold
              </span>
            </>
          )}
          {profile.role === "buyer" && (
            <span className="flex items-center gap-1">
              <strong className="text-gray-900">Buyer</strong> account
            </span>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 mb-6">
        {profile.role === "seller" ? (
          <>
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "active"
                  ? "border-[#1a56db] text-[#1a56db]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Listings
            </button>
            <button
              onClick={() => setActiveTab("sold")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "sold"
                  ? "border-[#1a56db] text-[#1a56db]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Sold
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-[#1a56db] text-[#1a56db]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </>
        ) : (
          <>
            <button
              onClick={() => setActiveTab("active")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "active"
                  ? "border-[#1a56db] text-[#1a56db]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Favorites
            </button>
            <button
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === "reviews"
                  ? "border-[#1a56db] text-[#1a56db]"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Reviews ({reviews.length})
            </button>
          </>
        )}
      </div>

      {/* Listings Grid */}
      {activeTab === "reviews" ? (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <EmptyState
              icon={<FiMessageSquare className="w-12 h-12" />}
              title="No reviews yet"
              description="This user hasn't received any reviews."
            />
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5">
                <div className="flex items-start gap-3">
                  <Avatar src={review.reviewer.avatar} name={review.reviewer.name} size="sm" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-gray-900 text-sm">{review.reviewer.name}</span>
                      <StarRating rating={review.rating} size="sm" />
                    </div>
                    <Link
                      href={`/listing/${review.listing.slug}`}
                      className="text-xs text-[#1a56db] hover:underline"
                    >
                      {review.listing.title}
                    </Link>
                    {review.comment && (
                      <p className="text-sm text-gray-600 mt-1">{review.comment}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(review.createdAt).toLocaleDateString("en-PH", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : displayListings.length === 0 ? (
        <EmptyState
          icon={<FiMessageSquare className="w-12 h-12" />}
          title="Nothing here yet"
          description={
            activeTab === "active"
              ? "This user hasn't listed anything yet."
              : activeTab === "sold"
              ? "No sold items yet."
              : "No saved items yet."
          }
        />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayListings.map((listing) => (
            <ProductCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}

      {/* Edit Profile Modal */}
      <Modal
        open={editModal}
        onClose={() => setEditModal(false)}
        title="Edit Profile"
        footer={
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => setEditModal(false)} fullWidth>
              Cancel
            </Button>
            <Button onClick={handleSaveProfile} loading={saving} fullWidth>
              Save Changes
            </Button>
          </div>
        }
      >
        <div className="space-y-4">
          <Input
            label="Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
          />
          <Input
            label="Phone"
            type="tel"
            value={editPhone}
            onChange={(e) => setEditPhone(e.target.value)}
            placeholder="+63 9XX XXX XXXX"
          />
          <TextArea
            label="Bio"
            value={editBio}
            onChange={(e) => setEditBio(e.target.value)}
            placeholder="Tell us about yourself..."
            rows={3}
            maxLength={300}
            showCount
          />
          <Select
            label="Location"
            options={locationOptions}
            value={editLocation}
            onChange={(e) => setEditLocation(e.target.value)}
            placeholder="Select location"
          />
          <FileUpload
            label="Avatar"
            currentPreview={editAvatar}
            onFileSelect={(dataUrl) => setEditAvatar(dataUrl)}
          />
        </div>
      </Modal>

      <ReportModal
        open={reportModal}
        onClose={() => setReportModal(false)}
        listingId=""
      />
    </div>
  );
}
