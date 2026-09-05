'use client';
import React, { useState } from "react";
import Link from "next/link";
import Badge from "./Badge";
import Avatar from "./Avatar";
import { FiHeart } from "react-icons/fi";
import { FaHeart } from "react-icons/fa";

interface ListingSeller {
  id: string;
  name: string;
  avatar?: string | null;
}

interface ListingCategory {
  id: string;
  name: string;
  slug: string;
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
  seller: ListingSeller;
  category?: ListingCategory;
}

interface ProductCardProps {
  listing: Listing;
  favorited?: boolean;
  onToggleFavorite?: (id: string) => void;
  className?: string;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

function getConditionVariant(
  condition: string
): "blue" | "yellow" | "green" | "red" | "gray" {
  switch (condition.toLowerCase()) {
    case "new":
      return "green";
    case "like new":
      return "blue";
    case "good":
      return "yellow";
    case "fair":
      return "gray";
    default:
      return "gray";
  }
}

const ProductCard: React.FC<ProductCardProps> = ({
  listing,
  favorited = false,
  onToggleFavorite,
  className = "",
}) => {
  const isSold = listing.status === "Sold";
  const [imgError, setImgError] = useState(false);
  const imgSrc = imgError || !listing.imageUrl ? "/placeholder.svg" : listing.imageUrl;

  return (
    <div
      className={`card card-hover group relative bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-200 hover:-translate-y-1 hover:shadow-md ${className}`}
    >
      <Link href={`/listing/${listing.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={imgSrc}
            alt={listing.title}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${
              isSold ? "brightness-75" : ""
            }`}
          />
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40" />
              <span className="relative bg-[#e8634a] text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                Sold
              </span>
            </div>
          )}
          {listing.category && (
            <div className="absolute top-2 left-2">
              <Badge variant="blue" size="sm">
                {listing.category.name}
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <div className="p-3">
        <Link href={`/listing/${listing.slug}`}>
          <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1 group-hover:text-[#1a56db] transition-colors">
            {listing.title}
          </h3>
        </Link>

        <p className="text-lg font-bold text-[#1a56db] mb-2">
          {formatPrice(listing.price)}
        </p>

        <div className="flex items-center gap-1 text-xs text-gray-500 mb-2">
          <svg
            className="w-3 h-3"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="truncate">{listing.location}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar
              src={listing.seller.avatar}
              name={listing.seller.name}
              size="sm"
            />
            <span className="text-xs text-gray-600 truncate">
              {listing.seller.name}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant={getConditionVariant(listing.condition)} size="sm">
              {listing.condition}
            </Badge>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onToggleFavorite?.(listing.id);
              }}
              className={`text-gray-400 hover:text-[#e8634a] transition-colors ${
                favorited ? "text-[#e8634a]" : ""
              }`}
              aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
            >
              {favorited ? (
                <FaHeart className="w-4 h-4" />
              ) : (
                <FiHeart className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
