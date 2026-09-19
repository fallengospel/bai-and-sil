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
      <div className="bg-white rounded-3xl border border-gray-100 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-card-hover hover:border-bai-blue/20 group">
        <div className="w-14 h-14 bg-bai-blue-light rounded-2xl flex items-center justify-center mx-auto mb-3 group-hover:bg-bai-blue/10 transition-colors duration-300 shadow-cartoon-sm">
          <span className="text-3xl">{icon}</span>
        </div>
        <h3 className="text-sm font-bold text-gray-900 mb-1 group-hover:text-bai-blue transition-colors">
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
