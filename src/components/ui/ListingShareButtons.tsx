"use client";

import React from "react";
import toast from "react-hot-toast";
import { FiFacebook, FiTwitter, FiLink } from "react-icons/fi";

interface ListingShareButtonsProps {
  title: string;
  url: string;
}

const ListingShareButtons: React.FC<ListingShareButtonsProps> = ({
  title,
  url,
}) => {
  const shareUrl = typeof window !== "undefined" ? window.location.href : url;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied!");
  };

  const handleFacebook = () => {
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleTwitter = () => {
    window.open(
      `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      "_blank",
      "width=600,height=400"
    );
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleFacebook}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        title="Share on Facebook"
      >
        <FiFacebook className="w-4 h-4" />
        <span className="hidden sm:inline">Facebook</span>
      </button>
      <button
        onClick={handleTwitter}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        title="Share on Twitter"
      >
        <FiTwitter className="w-4 h-4" />
        <span className="hidden sm:inline">Twitter</span>
      </button>
      <button
        onClick={handleCopyLink}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        title="Copy link"
      >
        <FiLink className="w-4 h-4" />
        <span className="hidden sm:inline">Copy Link</span>
      </button>
    </div>
  );
};

export default ListingShareButtons;
