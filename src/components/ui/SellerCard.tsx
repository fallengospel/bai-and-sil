import React from "react";
import Link from "next/link";
import Avatar from "./Avatar";
import StarRating from "./StarRating";

interface SellerCardProps {
  id: string;
  name: string;
  avatar?: string | null;
  rating: number;
  listingCount: number;
  memberSince: string;
  className?: string;
}

const SellerCard: React.FC<SellerCardProps> = ({
  id,
  name,
  avatar,
  rating,
  listingCount,
  memberSince,
  className = "",
}) => {
  return (
    <Link href={`/profile/${id}`} className={`block group ${className}`}>
      <div className="card card-hover bg-white rounded-xl border border-gray-100 p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="flex items-center gap-3 mb-3">
          <Avatar src={avatar} name={name} size="lg" />
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate group-hover:text-[#7BA8D0] transition-colors">
              {name}
            </h3>
            <StarRating rating={rating} size="sm" />
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span>
            {listingCount} {listingCount === 1 ? "listing" : "listings"}
          </span>
          <span>Since {memberSince}</span>
        </div>
      </div>
    </Link>
  );
};

export default SellerCard;
