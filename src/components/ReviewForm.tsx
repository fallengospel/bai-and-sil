"use client";

import { useState } from "react";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import TextArea from "@/components/ui/TextArea";
import { FiStar } from "react-icons/fi";
import { FaStar } from "react-icons/fa";

interface ReviewFormProps {
  listingId: string;
  revieweeId: string;
  onSuccess?: () => void;
}

export default function ReviewForm({ listingId, revieweeId, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("Please select a rating");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ listingId, revieweeId, rating, comment }),
      });

      if (!res.ok) {
        const data = await res.json();
        toast.error(data.error || "Failed to submit review");
        return;
      }

      toast.success("Review submitted!");
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch {
      toast.error("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-4">
      <h3 className="font-semibold text-gray-900">Leave a Review</h3>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="p-0.5 transition-colors"
            >
              {star <= (hoveredRating || rating) ? (
                <FaStar className="w-7 h-7 text-[#F3D98F]" />
              ) : (
                <FiStar className="w-7 h-7 text-gray-300" />
              )}
            </button>
          ))}
        </div>
      </div>

      <TextArea
        label="Comment (optional)"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience with this seller..."
        rows={3}
        maxLength={500}
        showCount
      />

      <Button onClick={handleSubmit} loading={submitting} fullWidth>
        Submit Review
      </Button>
    </div>
  );
}
