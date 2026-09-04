import { prisma } from "@/lib/prisma";
import CategoryCard from "@/components/ui/CategoryCard";
import { CATEGORY_ICONS } from "@/lib/helpers";

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { listings: { where: { status: "Active" } } } } },
    orderBy: { name: "asc" },
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Categories</h1>
      <p className="text-gray-500 mb-8">Find exactly what you&apos;re looking for.</p>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            slug={cat.slug}
            name={cat.name}
            icon={CATEGORY_ICONS[cat.slug] || cat.icon || "📦"}
            count={cat._count.listings}
          />
        ))}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-16">
          <p className="text-gray-500">No categories yet. Wala pa? Magbenta ka naman.</p>
        </div>
      )}
    </div>
  );
}
