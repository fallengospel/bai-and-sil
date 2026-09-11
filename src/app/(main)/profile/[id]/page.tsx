"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Avatar from "@/components/ui/Avatar";
import StarRating from "@/components/ui/StarRating";
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
import AnimatedAvatar from "@/components/ui/AnimatedAvatar";
import { PH_LOCATIONS } from "@/lib/helpers";
import {
  FiMessageSquare, FiFlag, FiPackage, FiStar, FiMapPin, FiCalendar,
  FiPhone, FiMail, FiEdit2, FiHeart, FiShoppingBag, FiDollarSign,
  FiTrendingUp, FiClock, FiCheckCircle, FiAlertCircle, FiUsers,
  FiBarChart2, FiEye, FiShare2, FiBookmark
} from "react-icons/fi";

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  location: string | null;
  bio: string | null;
  phone: string | null;
  email?: string;
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
  views?: number;
  createdAt: string;
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
  const [currentUserRole, setCurrentUserRole] = useState<string>("");
  const [activeTab, setActiveTab] = useState<string>("overview");
  const [editModal, setEditModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [favorites, setFavorites] = useState<Listing[]>([]);

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
        if (data.user) {
          setCurrentUserId(data.user.id);
          setCurrentUserRole(data.user.role || "buyer");
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/users/${id}`, { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/listings?limit=50`, { credentials: "include" }).then((r) => r.json()),
      fetch(`/api/reviews?userId=${id}`, { credentials: "include" }).then((r) => r.json()),
      isOwnProfile ? fetch(`/api/users/me/favorites`, { credentials: "include" }).then((r) => r.json()).catch(() => ({ favorites: [] })) : Promise.resolve({ favorites: [] }),
    ])
      .then(([userData, listingsData, reviewsData, favsData]) => {
        setProfile(userData.user);
        const userListings = (listingsData.listings || []).filter(
          (l: Listing) => l.seller?.id === id
        );
        setListings(userListings);
        setReviews(reviewsData.reviews || []);
        setFavorites((favsData.favorites || []).map((f: any) => f.listing || f).filter(Boolean));
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
  }, [id, isOwnProfile]);

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
  const totalViews = listings.reduce((sum, l) => sum + (l.views || 0), 0);
  const avgPrice = activeListings.length > 0 ? activeListings.reduce((sum, l) => sum + l.price, 0) / activeListings.length : 0;

  const memberSince = new Date(profile.createdAt).toLocaleDateString("en-PH", {
    month: "long",
    year: "numeric",
  });

  const memberDays = Math.floor((Date.now() - new Date(profile.createdAt).getTime()) / (1000 * 60 * 60 * 24));

  const getTabs = () => {
    const baseTabs: { id: string; label: string; icon: any }[] = [
      { id: "overview", label: "Overview", icon: FiEye },
    ];

    if (profile.role === "seller") {
      baseTabs.push(
        { id: "listings", label: `Listings (${activeListings.length})`, icon: FiPackage },
        { id: "reviews", label: `Reviews (${reviews.length})`, icon: FiStar }
      );
    } else if (profile.role === "buyer") {
      baseTabs.push(
        { id: "favorites", label: `Favorites (${favorites.length})`, icon: FiHeart },
        { id: "reviews", label: `Reviews (${reviews.length})`, icon: FiStar }
      );
    } else {
      baseTabs.push(
        { id: "listings", label: `All Listings (${listings.length})`, icon: FiPackage },
        { id: "reviews", label: `Reviews (${reviews.length})`, icon: FiStar }
      );
    }

    return baseTabs;
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 page-transition">
      {/* Profile Header Card */}
      <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden mb-6 shadow-sm">
        {/* Cover Banner */}
        <div className={`h-32 md:h-40 relative ${
          profile.role === "admin" ? "bg-gradient-to-r from-red-500 to-red-600" :
          profile.role === "seller" ? "bg-gradient-to-r from-[#f5a623] to-yellow-500" :
          "bg-gradient-to-r from-[#1a56db] to-blue-500"
        }`}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {/* Profile Info */}
        <div className="px-6 md:px-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-end gap-4 -mt-12 md:-mt-16">
            {/* Avatar */}
            <div className="relative">
              <AnimatedAvatar
                name={profile.name}
                src={profile.avatar}
                size="xl"
                role={profile.role as any}
                showStatus
              />
              {profile.verified && (
                <div className="absolute -bottom-1 -right-1">
                  <VerificationBadge size="md" />
                </div>
              )}
            </div>

            {/* Name & Meta */}
            <div className="flex-1 md:mb-1">
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{profile.name}</h1>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-semibold rounded-full capitalize ${
                  profile.role === "seller" ? "bg-[#f5a623]/10 text-[#d4901a]" :
                  profile.role === "admin" ? "bg-red-100 text-red-700" :
                  "bg-[#1a56db]/10 text-[#1a56db]"
                }`}>
                  {profile.role === "seller" && <FiShoppingBag className="w-3 h-3 mr-1" />}
                  {profile.role === "admin" && <FiUsers className="w-3 h-3 mr-1" />}
                  {profile.role === "buyer" && <FiHeart className="w-3 h-3 mr-1" />}
                  {profile.role}
                </span>
              </div>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 flex-wrap">
                {profile.location && (
                  <span className="flex items-center gap-1">
                    <FiMapPin className="w-4 h-4" />
                    {profile.location}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <FiCalendar className="w-4 h-4" />
                  Member for {memberDays} days
                </span>
                <div className="flex items-center gap-1">
                  <StarRating rating={profile.rating} size="sm" />
                  <span>{profile.rating.toFixed(1)} ({profile.reviewCount})</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3 md:mb-1">
              {isOwnProfile ? (
                <>
                  <Button variant="outline" onClick={() => setEditModal(true)} leftIcon={<FiEdit2 className="w-4 h-4" />}>
                    Edit Profile
                  </Button>
                  {profile.role === "seller" && (
                    <Link href="/seller/dashboard" className="px-4 py-2 text-sm font-medium bg-[#f5a623] text-white rounded-xl hover:bg-yellow-500 transition-all">
                      Dashboard
                    </Link>
                  )}
                  {profile.role === "buyer" && (
                    <Link href="/buyer/dashboard" className="px-4 py-2 text-sm font-medium bg-[#1a56db] text-white rounded-xl hover:bg-blue-700 transition-all">
                      Dashboard
                    </Link>
                  )}
                  {profile.role === "admin" && (
                    <Link href="/admin" className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-xl hover:bg-red-700 transition-all">
                      Admin Panel
                    </Link>
                  )}
                </>
              ) : (
                <>
                  <Button onClick={handleMessage} leftIcon={<FiMessageSquare className="w-4 h-4" />}>
                    Message
                  </Button>
                  <Button variant="ghost" onClick={() => setReportModal(true)} leftIcon={<FiFlag className="w-4 h-4" />}>
                    Report
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Bio */}
          {profile.bio && (
            <p className="text-gray-600 mt-4 leading-relaxed max-w-2xl">{profile.bio}</p>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {profile.role === "seller" && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiPackage className="w-5 h-5 text-[#1a56db]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{activeListings.length}</p>
              <p className="text-xs text-gray-500">Active Listings</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiDollarSign className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{soldListings.length}</p>
              <p className="text-xs text-gray-500">Items Sold</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiEye className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{totalViews}</p>
              <p className="text-xs text-gray-500">Total Views</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiStar className="w-5 h-5 text-[#f5a623]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{profile.rating.toFixed(1)}</p>
              <p className="text-xs text-gray-500">Rating</p>
            </div>
          </>
        )}
        {profile.role === "buyer" && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiHeart className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{favorites.length}</p>
              <p className="text-xs text-gray-500">Saved Items</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiStar className="w-5 h-5 text-[#1a56db]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              <p className="text-xs text-gray-500">Reviews Given</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiCalendar className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{memberDays}</p>
              <p className="text-xs text-gray-500">Days Active</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiCheckCircle className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{profile.verified ? "Yes" : "No"}</p>
              <p className="text-xs text-gray-500">Verified</p>
            </div>
          </>
        )}
        {profile.role === "admin" && (
          <>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiUsers className="w-5 h-5 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">Admin</p>
              <p className="text-xs text-gray-500">Role</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiPackage className="w-5 h-5 text-[#1a56db]" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{listings.length}</p>
              <p className="text-xs text-gray-500">All Listings</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiBarChart2 className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{listings.filter(l => l.status === "Active").length}</p>
              <p className="text-xs text-gray-500">Active</p>
            </div>
            <div className="bg-white rounded-xl border border-gray-100 p-4 text-center shadow-sm">
              <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <FiStar className="w-5 h-5 text-purple-600" />
              </div>
              <p className="text-2xl font-bold text-gray-900">{reviews.length}</p>
              <p className="text-xs text-gray-500">Reviews</p>
            </div>
          </>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b border-gray-100 mb-6 overflow-x-auto">
        {getTabs().map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 pb-3 px-4 text-sm font-medium border-b-2 transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? "border-[#1a56db] text-[#1a56db]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* About Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiEdit2 className="w-4 h-4 text-gray-400" />
              About
            </h3>
            <div className="space-y-3">
              {profile.bio && (
                <p className="text-sm text-gray-600">{profile.bio}</p>
              )}
              {!profile.bio && (
                <p className="text-sm text-gray-400 italic">No bio added yet.</p>
              )}
            </div>
          </div>

          {/* Contact Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiMail className="w-4 h-4 text-gray-400" />
              Contact Information
            </h3>
            <div className="space-y-3">
              {profile.location && (
                <div className="flex items-center gap-3 text-sm">
                  <FiMapPin className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{profile.location}</span>
                </div>
              )}
              {profile.phone && (
                <div className="flex items-center gap-3 text-sm">
                  <FiPhone className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{profile.phone}</span>
                </div>
              )}
              {isOwnProfile && profile.email && (
                <div className="flex items-center gap-3 text-sm">
                  <FiMail className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-600">{profile.email}</span>
                </div>
              )}
              {!profile.phone && !profile.location && (
                <p className="text-sm text-gray-400 italic">No contact info added.</p>
              )}
            </div>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiTrendingUp className="w-4 h-4 text-gray-400" />
              Statistics
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Member since</span>
                <span className="font-medium text-gray-900">{memberSince}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Days active</span>
                <span className="font-medium text-gray-900">{memberDays}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Rating</span>
                <span className="font-medium text-gray-900">{profile.rating.toFixed(1)} / 5.0</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Reviews</span>
                <span className="font-medium text-gray-900">{profile.reviewCount}</span>
              </div>
            </div>
          </div>

          {/* Activity Card */}
          <div className="bg-white rounded-xl border border-gray-100 p-6 shadow-sm">
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <FiClock className="w-4 h-4 text-gray-400" />
              Recent Activity
            </h3>
            <div className="space-y-3">
              {listings.slice(0, 3).map((listing) => (
                <div key={listing.id} className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                    {listing.imageUrl ? (
                      <img src={listing.imageUrl} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FiPackage className="w-4 h-4 text-gray-400 m-auto mt-2" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/listing/${listing.slug}`} className="text-gray-900 hover:text-[#1a56db] truncate block">
                      {listing.title}
                    </Link>
                    <p className="text-xs text-gray-400">{new Date(listing.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              ))}
              {listings.length === 0 && (
                <p className="text-sm text-gray-400 italic">No activity yet.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "listings" && (
        <>
          {isOwnProfile && profile.role === "seller" && (
            <div className="flex justify-end mb-4">
              <Link href="/sell" className="px-4 py-2 bg-[#f5a623] text-white text-sm font-medium rounded-xl hover:bg-yellow-500 transition-all">
                + New Listing
              </Link>
            </div>
          )}
          {activeListings.length === 0 ? (
            <EmptyState
              icon={<FiPackage className="w-12 h-12" />}
              title="No listings yet"
              description={isOwnProfile ? "Create your first listing to get started." : "This user hasn't listed anything yet."}
              action={isOwnProfile ? { label: "Create Listing", href: "/sell" } : undefined}
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {activeListings.map((listing) => (
                <ProductCard key={listing.id} listing={listing} />
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === "reviews" && (
        <div className="space-y-4">
          {reviews.length === 0 ? (
            <EmptyState
              icon={<FiStar className="w-12 h-12" />}
              title="No reviews yet"
              description="This user hasn't received any reviews."
            />
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="bg-white rounded-xl border border-gray-100 p-5 shadow-sm">
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
      )}

      {activeTab === "favorites" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {favorites.length === 0 ? (
            <EmptyState
              icon={<FiHeart className="w-12 h-12" />}
              title="No favorites yet"
              description="Items you save will appear here."
            />
          ) : (
            favorites.map((listing) => (
              <ProductCard key={listing.id} listing={listing} />
            ))
          )}
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
          <FileUpload
            label="Avatar"
            currentPreview={editAvatar}
            onFileSelect={(dataUrl) => setEditAvatar(dataUrl)}
          />
          <Input
            label="Full Name"
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
