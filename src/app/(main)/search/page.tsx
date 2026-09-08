"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CONDITIONS, PH_LOCATIONS } from "@/lib/helpers";
import { FiSearch } from "react-icons/fi";

interface Listing {
  id: string;
  slug: string;
  title: string;
  price: number;
  location: string;
  condition: string;
  status: string;
  imageUrl: string;
  seller: { id: string; name: string; avatar: string | null };
  category?: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
  listingCount: number;
}

const sortOptions = [
  { value: "newest", label: "Newest First" },
  { value: "price_asc", label: "Price: Low to High" },
  { value: "price_desc", label: "Price: High to Low" },
];

const locationOptions = PH_LOCATIONS.flatMap((loc) =>
  loc.cities.map((city) => ({
    value: `${city}, ${loc.province}`,
    label: `${city}, ${loc.province}`,
  }))
);

const conditionOptions = CONDITIONS.map((c) => ({ value: c, label: c }));

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [q, setQ] = useState(searchParams.get("q") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [location, setLocation] = useState(searchParams.get("location") || "");
  const [condition, setCondition] = useState(searchParams.get("condition") || "");
  const [minPrice, setMinPrice] = useState(searchParams.get("minPrice") || "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("maxPrice") || "");
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");

  const fetchListings = useCallback(
    async (pageNum: number, reset = false) => {
      setLoading(true);
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      if (category) params.set("category", category);
      if (location) params.set("location", location);
      if (condition) params.set("condition", condition);
      if (minPrice) params.set("minPrice", minPrice);
      if (maxPrice) params.set("maxPrice", maxPrice);
      params.set("sort", sort);
      params.set("page", String(pageNum));
      params.set("limit", "20");

      try {
        const res = await fetch(`/api/listings?${params.toString()}`);
        const data = await res.json();
        if (reset) {
          setListings(data.listings);
        } else {
          setListings((prev) => [...prev, ...data.listings]);
        }
        setHasMore(pageNum < data.pagination.totalPages);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    },
    [q, category, location, condition, minPrice, maxPrice, sort]
  );

  useEffect(() => {
    setPage(1);
    fetchListings(1, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort]);

  useEffect(() => {
    fetch("/api/categories")
      .then((r) => r.json())
      .then((data) => setCategories(data.categories || []))
      .catch(() => {});
  }, []);

  const categoryOptions = [
    { value: "", label: "All Categories" },
    ...categories.map((c) => ({ value: c.slug, label: `${c.name} (${c.listingCount})` })),
  ];

  const handleApplyFilters = () => {
    setPage(1);
    fetchListings(1, true);
  };

  const handleLoadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchListings(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-8">
        {/* Filters sidebar */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-5 sticky top-20">
            <h2 className="font-semibold text-gray-900">Filters</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db]"
                />
              </div>
            </div>

            <Select
              label="Category"
              options={categoryOptions}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            />

            <Select
              label="Location"
              options={[{ value: "", label: "All Locations" }, ...locationOptions]}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />

            <Select
              label="Condition"
              options={[{ value: "", label: "All Conditions" }, ...conditionOptions]}
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price Range
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="Min"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db]"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#1a56db]/20 focus:border-[#1a56db]"
                />
              </div>
            </div>

            <Select
              label="Sort by"
              options={sortOptions}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            />

            <Button onClick={handleApplyFilters} fullWidth>
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-xl font-bold text-gray-900">
              {q ? `Results for "${q}"` : "All Listings"}
            </h1>
            <Select
              options={sortOptions}
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="w-48"
            />
          </div>

          {loading && listings.length === 0 ? (
            <LoadingSpinner text="Searching..." className="py-16" />
          ) : listings.length === 0 ? (
            <EmptyState
              icon={<FiSearch className="w-12 h-12" />}
              title="Nothing here yet."
              description="Try adjusting your filters or search for something else."
            />
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {listings.map((listing) => (
                  <ProductCard
                    key={listing.id}
                    listing={{
                      ...listing,
                      imageUrl: listing.imageUrl || "/placeholder.png",
                    }}
                  />
                ))}
              </div>

              {hasMore && (
                <div className="text-center mt-8">
                  <Button onClick={handleLoadMore} variant="outline" loading={loading}>
                    Load more
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
