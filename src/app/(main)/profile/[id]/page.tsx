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
import Modal from "@/components/ui/Modal";
import ProductCard from "@/components/ui/ProductCard";
import ReportModal from "@/components/ui/ReportModal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PH_LOCATIONS } from "@/lib/helpers";
import { FiMessageSquare, FiFlag } from "react-icons/fi";

interface UserProfile {
  id: string;
  name: string;
  avatar: string | null;
  location: string | null;
  bio: string | null;
  rating: number;
  reviewCount: number;
  createdAt: string;
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
  const [activeTab, setActiveTab] = useState<"active" | "sold" | "saved">("active");
  const [editModal, setEditModal] = useState(false);
  const [reportModal, setReportModal] = useState(false);
  const [saving, setSaving] = useState(false);

  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editLocation, setEditLocation] = useState("");
  const [editAvatar, setEditAvatar] = useState("");

  const isOwnProfile = currentUserId === id;

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setCurrentUserId(data.user.id);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(`/api/users/${id}`).then((r) => r.json()),
      fetch(`/api/listings?limit=50`).then((r) => r.json()),
    ])
      .then(([userData, listingsData]) => {
        setProfile(userData.user);
        const userListings = (listingsData.listings || []).filter(
          (l: Listing) => l.seller.id === id
        );
        setListings(userListings);
        if (userData.user) {
          setEditName(userData.user.name);
          setEditBio(userData.user.bio || "");
          setEditLocation(userData.user.location || "");
          setEditAvatar(userData.user.avatar || "");
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
        body: JSON.stringify({
          name: editName,
          bio: editBio,
          location: editLocation,
          avatar: editAvatar,
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="bg-white rounded-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar src={profile.avatar} name={profile.name} size="xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">{profile.name}</h1>
            {profile.location && (
              <p className="text-sm text-gray-500 mt-0.5">{profile.location}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <StarRating rating={profile.rating} size="sm" />
              <span className="text-sm text-gray-500">
                {profile.rating.toFixed(1)} ({profile.reviewCount} reviews)
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-1">Member since {memberSince}</p>
          </div>

          <div className="flex items-center gap-2">
            {isOwnProfile ? (
              <Button variant="outline" onClick={() => setEditModal(true)}>
                Edit Profile
              </Button>
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

        {profile.bio && <p className="text-sm text-gray-600 mt-4">{profile.bio}</p>}

        <div className="flex items-center gap-6 mt-4 text-sm text-gray-500">
          <span>
            <strong className="text-gray-900">{profile._count.listings}</strong> listings
          </span>
          <span>
            <strong className="text-gray-900">{soldListings.length}</strong> sold
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-100 mb-6">
        {(["active", "sold", "saved"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab
                ? "border-[#1a56db] text-[#1a56db]"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab === "active" ? "Listings" : tab === "sold" ? "Sold" : "Saved"}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      {activeTab === "saved" && !isOwnProfile ? (
        <EmptyState
          icon={<FiFlag className="w-12 h-12" />}
          title="Not your profile"
          description="You can only view saved items on your own profile."
        />
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
          <Input
            label="Avatar URL"
            value={editAvatar}
            onChange={(e) => setEditAvatar(e.target.value)}
            placeholder="https://..."
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
