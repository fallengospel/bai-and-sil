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
      <div className="bg-white rounded-2xl border border-gray-100 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-gray-200 group">
        <div className="w-14 h-14 bg-gray-50 rounded-xl flex items-center justify-center mx-auto mb-3 group-hover:bg-[#1a56db]/5 transition-colors duration-300">
          <span className="text-3xl">{icon}</span>
        </div>
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
