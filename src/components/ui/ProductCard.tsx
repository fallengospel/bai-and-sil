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
      className={`group relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-gray-200 ${className}`}
    >
      <Link href={`/listing/${listing.slug}`} className="block">
        <div className="relative aspect-[4/3] overflow-hidden bg-gray-100">
          <img
            src={imgSrc}
            alt={listing.title}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-110 ${
              isSold ? "brightness-75 grayscale" : ""
            }`}
          />
          {isSold && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
              <span className="relative bg-gradient-to-r from-[#e8634a] to-red-500 text-white text-xs font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                Sold
              </span>
            </div>
          )}
          {listing.category && (
            <div className="absolute top-3 left-3">
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-white/90 backdrop-blur-sm text-[#7298C7] shadow-sm">
                {listing.category.name}
              </span>
            </div>
          )}
          
          {/* Price badge */}
          <div className="absolute bottom-3 right-3">
            <span className="inline-flex items-center px-3 py-1.5 rounded-xl text-sm font-bold bg-white/95 backdrop-blur-sm text-[#7298C7] shadow-md">
              {formatPrice(listing.price)}
            </span>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <Link href={`/listing/${listing.slug}`}>
          <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 mb-2 group-hover:text-[#7298C7] transition-colors leading-relaxed">
            {listing.title}
          </h3>
        </Link>

        <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-3">
          <svg
            className="w-3.5 h-3.5 text-gray-400"
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
            <span className="text-xs text-gray-600 truncate max-w-[100px]">
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
              className={`p-1.5 rounded-lg transition-all duration-200 ${
                favorited 
                  ? "text-[#e8634a] bg-[#e8634a]/10" 
                  : "text-gray-400 hover:text-[#e8634a] hover:bg-[#e8634a]/5"
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
