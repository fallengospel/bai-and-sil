"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import TextArea from "@/components/ui/TextArea";
import Badge from "@/components/ui/Badge";
import ProductCard from "@/components/ui/ProductCard";
import { CONDITIONS, PH_LOCATIONS } from "@/lib/helpers";
import { FiUploadCloud, FiX, FiChevronLeft, FiChevronRight } from "react-icons/fi";

interface Category {
  id: string;
  name: string;
  slug: string;
}

const conditionOptions = CONDITIONS.map((c) => ({ value: c, label: c }));
const locationOptions = PH_LOCATIONS.flatMap((loc) =>
  loc.cities.map((city) => ({
    value: `${city}, ${loc.province}`,
    label: `${city}, ${loc.province}`,
  }))
);

export default function SellPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState(1);
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

  useEffect(() => {
    fetch("/api/categories")
      .then((res) => res.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const handleUpload = async (files: FileList | null) => {
    if (!files) return;
    setUploading(true);

    for (const file of Array.from(files)) {
      if (images.length >= 8) break;
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
      const res = await fetch("/api/listings", {
        method: "POST",
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
        toast.error(data.error || "Failed to create listing");
        return;
      }

      const data = await res.json();
      toast.success("Listing created!");
      router.push(`/listing/${data.listing.slug}`);
    } catch {
      toast.error("Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  const previewListing = {
    id: "preview",
    slug: "preview",
    title: title || "Your listing title",
    price: parseFloat(price) || 0,
    location: location || "Your location",
    condition: condition || "Brand New",
    status: "Active",
    imageUrl: images[0] || "/placeholder.png",
    seller: { id: "", name: "You", avatar: null },
    category: categories.find((c) => c.id === categoryId),
  };

  const canProceedStep1 = images.length > 0;
  const canProceedStep2 = title && categoryId && description && price && condition && location;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      {/* Progress */}
      <div className="flex items-center justify-center gap-4 mb-8">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                step >= s
                  ? "bg-[#1a56db] text-white"
                  : "bg-gray-200 text-gray-500"
              }`}
            >
              {s}
            </div>
            <span className={`text-sm hidden sm:inline ${step >= s ? "text-gray-900" : "text-gray-400"}`}>
              {s === 1 ? "Photos" : s === 2 ? "Details" : "Preview"}
            </span>
            {s < 3 && <div className="w-8 h-px bg-gray-300" />}
          </div>
        ))}
      </div>

      {/* Step 1: Photos */}
      {step === 1 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Add Photos</h2>
          <p className="text-sm text-gray-500">Up to 8 photos. First photo is the cover.</p>

          <div
            onDrop={handleDrop}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors ${
              dragOver ? "border-[#1a56db] bg-blue-50" : "border-gray-300 hover:border-gray-400"
            }`}
          >
            <FiUploadCloud className="w-10 h-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">
              {uploading ? "Uploading..." : "Drag & drop photos here, or click to browse"}
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => handleUpload(e.target.files)}
            />
          </div>

          {images.length > 0 && (
            <div className="grid grid-cols-4 gap-3">
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

          <div className="flex justify-end pt-4">
            <Button onClick={() => setStep(2)} disabled={!canProceedStep1}>
              Next <FiChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Details */}
      {step === 2 && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">Item Details</h2>

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
            placeholder="Describe your item — condition, age, reason for selling..."
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

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(1)}>
              <FiChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={() => setStep(3)} disabled={!canProceedStep2}>
              Next <FiChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === 3 && (
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-gray-900">Preview Your Listing</h2>
          <p className="text-sm text-gray-500">This is how buyers will see your item.</p>

          <div className="max-w-sm mx-auto">
            <ProductCard listing={previewListing} />
          </div>

          <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-500">Title</span>
              <span className="font-medium">{title}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Price</span>
              <span className="font-medium">₱{parseFloat(price || "0").toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Condition</span>
              <Badge>{condition}</Badge>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Location</span>
              <span className="font-medium">{location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Photos</span>
              <span className="font-medium">{images.length}</span>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <Button variant="ghost" onClick={() => setStep(2)}>
              <FiChevronLeft className="w-4 h-4" /> Back
            </Button>
            <Button onClick={handleSubmit} loading={submitting}>
              List Item
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
