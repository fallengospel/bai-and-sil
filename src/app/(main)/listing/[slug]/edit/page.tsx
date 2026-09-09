"use client";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import { CONDITIONS, PH_LOCATIONS } from "@/lib/helpers";
import { FiUploadCloud, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface ListingData {
  id: string;
  slug: string;
  title: string;
  description: string;
  price: number;
  condition: string;
  location: string;
  categoryId: string;
  images: { imageUrl: string }[];
}

const conditionOptions = CONDITIONS.map((c) => ({ value: c, label: c }));
const locationOptions = PH_LOCATIONS.flatMap((loc) =>
  loc.cities.map((city) => ({
    value: `${city}, ${loc.province}`,
    label: `${city}, ${loc.province}`,
  }))
);

export default function EditListingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [condition, setCondition] = useState("");
  const [location, setLocation] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [listingId, setListingId] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      fetch(`/api/listings/${slug}`).then((r) => r.json()),
    ])
      .then(([catData, listData]) => {
        setCategories(catData.categories || []);
        const listing = listData.listing;
        if (!listing) {
          toast.error("Listing not found");
          router.push("/");
          return;
        }
        setListingId(listing.id);
        setTitle(listing.title);
        setCategoryId(listing.categoryId);
        setDescription(listing.description);
        setPrice(String(listing.price));
        setCondition(listing.condition);
        setLocation(listing.location);
        setImages(listing.images.map((img: { imageUrl: string }) => img.imageUrl));
      })
      .catch(() => {
        toast.error("Failed to load listing");
        router.push("/");
      })
      .finally(() => setLoading(false));
  }, [slug, router]);

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      if (images.length >= 8) break;

      const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!allowedTypes.includes(file.type)) {
        toast.error("Only JPG, PNG, and WebP images are allowed");
        continue;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Image must be under 5MB");
        continue;
      }

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        const data = await res.json();
        if (data.url) {
          setImages((prev) => [...prev, data.url]);
        }
      } catch {
        toast.error("Upload failed");
      }
    }
    setUploading(false);
  };

  const removeImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleUpload(e.dataTransfer.files);
  };

  const handleSubmit = async () => {
    if (!title || !categoryId || !description || !price || !condition || !location) {
      toast.error("Please fill in all fields");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`/api/listings/${listingId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          categoryId,
          description,
          price,
          condition,
          location,
          images,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to update listing");
        return;
      }

      const data = await res.json();
      toast.success("Listing updated!");
      router.push(`/listing/${data.listing.slug}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-48" />
          <div className="h-64 bg-gray-200 rounded-xl" />
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded" />
            <div className="h-10 bg-gray-200 rounded" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <Link
          href={`/listing/${slug}`}
          className="text-sm text-[#1a56db] hover:underline flex items-center gap-1"
        >
          <FiChevronLeft className="w-4 h-4" /> Back to listing
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">Edit Listing</h1>
      </div>

      <div className="space-y-6">
        {/* Photos */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Photos</h2>
          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors ${
              dragOver ? "border-[#1a56db] bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <FiUploadCloud className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <p className="text-sm text-gray-600">
              {uploading ? "Uploading..." : "Drag & drop photos here, or click to browse"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3 mt-3">
              {images.map((img, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={img} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => removeImage(i)}
                    className="absolute top-1 right-1 p-1 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX className="w-3 h-3" />
                  </button>
                  {i === 0 && (
                    <span className="absolute bottom-1 left-1 bg-[#1a56db] text-white text-[10px] px-1.5 py-0.5 rounded">
                      Cover
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Details</h2>
          <div className="space-y-4">
            <Input
              label="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="What are you selling?"
              required
            />

            <Select
              label="Category"
              options={categories.map((c) => ({ value: c.id, label: c.name }))}
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              placeholder="Select a category"
            />

            <TextArea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your item..."
              rows={5}
              maxLength={2000}
              showCount
            />

            <Input
              label="Price (₱)"
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="0"
              min="0"
              required
            />

            <Select
              label="Condition"
              options={conditionOptions}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              placeholder="Select condition"
            />

            <Select
              label="Location"
              options={locationOptions}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Select location"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between pt-4">
          <Link href={`/listing/${slug}`}>
            <Button variant="ghost">
              <FiChevronLeft className="w-4 h-4" /> Cancel
            </Button>
          </Link>
          <Button onClick={handleSubmit} loading={submitting} leftIcon={<FiChevronRight className="w-4 h-4" />}>
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
