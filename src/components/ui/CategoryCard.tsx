import React from "react";
import Link from "next/link";

interface CategoryCardProps {
  slug: string;
  name: string;
  icon: string;
  count: number;
  className?: string;
}

const CategoryCard: React.FC<CategoryCardProps> = ({
  slug,
  name,
  icon,
  count,
  className = "",
}) => {
  return (
    <Link href={`/search?category=${slug}`} className={`block group ${className}`}>
      <div className="card card-hover bg-white rounded-xl border border-gray-100 p-6 text-center transition-all duration-200 hover:-translate-y-1 hover:shadow-md">
        <div className="text-4xl mb-3">{icon}</div>
        <h3 className="text-sm font-semibold text-gray-900 mb-1 group-hover:text-[#1a56db] transition-colors">
          {name}
        </h3>
        <p className="text-xs text-gray-500">
          {count} {count === 1 ? "item" : "items"}
        </p>
      </div>
    </Link>
  );
};

export default CategoryCard;
