"use client";

import { useState, useEffect, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ProductCard from "@/components/ui/ProductCard";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { CONDITIONS, getLocationOptions } from "@/lib/helpers";
import { toggleFavorite } from "@/lib/favorites";
import { FiSearch, FiBookmark, FiX } from "react-icons/fi";

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

const locationOptions = getLocationOptions(true);

const conditionOptions = CONDITIONS.map((c) => ({ value: c, label: c }));

function readParams(searchParams: { get: (key: string) => string | null }) {
  return {
    q: searchParams.get("q") || "",
    category: searchParams.get("category") || "",
    location: searchParams.get("location") || "",
    condition: searchParams.get("condition") || "",
    minPrice: searchParams.get("minPrice") || "",
    maxPrice: searchParams.get("maxPrice") || "",
    sort: searchParams.get("sort") || "newest",
  };
}

export default function SearchPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initial = readParams(searchParams);

  const [listings, setListings] = useState<Listing[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [favIds, setFavIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetch("/api/users/me/favorites", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data?.listings) {
          setFavIds(new Set(data.listings.map((l: Listing) => l.id)));
        }
      })
      .catch(() => {});
  }, []);

  const handleToggleFavorite = async (id: string) => {
    const next = await toggleFavorite(id);
    if (next === null) return;
    setFavIds((prev) => {
      const s = new Set(prev);
      if (next) s.add(id);
      else s.delete(id);
      return s;
    });
  };

  const [q, setQ] = useState(initial.q);
  const [category, setCategory] = useState(initial.category);
  const [location, setLocation] = useState(initial.location);
  const [condition, setCondition] = useState(initial.condition);
  const [minPrice, setMinPrice] = useState(initial.minPrice);
  const [maxPrice, setMaxPrice] = useState(initial.maxPrice);
  const [sort, setSort] = useState(initial.sort);
  const [showFilters, setShowFilters] = useState(false);

  interface SavedSearch {
    id: string;
    name: string;
    query: string;
    category: string | null;
    location: string | null;
    condition: string | null;
    minPrice: string | null;
    maxPrice: string | null;
  }
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [saveState, setSaveState] = useState<"" | "saving" | "saved" | "error" | "auth">("");

  useEffect(() => {
    fetch("/api/searches", { credentials: "include" })
      .then((r) => (r.ok ? r.json() : { searches: [] }))
      .then((data) => setSavedSearches(data.searches || []))
      .catch(() => {});
  }, []);

  const handleSaveSearch = async () => {
    if (saveState === "saving") return;
    setSaveState("saving");
    try {
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: q.trim() || category || location || "All listings",
          query: q.trim(),
          category: category || null,
          location: location || null,
          condition: condition || null,
          minPrice: minPrice || null,
          maxPrice: maxPrice || null,
        }),
      });
      if (res.status === 401) { setSaveState("auth"); return; }
      if (!res.ok) { setSaveState("error"); return; }
      const data = await res.json();
      setSavedSearches((prev) => {
        const next = prev.filter((s) => s.id !== data.search.id);
        return [data.search, ...next];
      });
      setSaveState("saved");
      setTimeout(() => setSaveState(""), 2500);
    } catch {
      setSaveState("error");
    }
  };

  const handleApplySavedSearch = (s: SavedSearch) => {
    const params = new URLSearchParams();
    if (s.query) params.set("q", s.query);
    if (s.category) params.set("category", s.category);
    if (s.location) params.set("location", s.location);
    if (s.condition) params.set("condition", s.condition);
    if (s.minPrice) params.set("minPrice", s.minPrice);
    if (s.maxPrice) params.set("maxPrice", s.maxPrice);
    router.push(`/search?${params.toString()}`);
  };

  const handleDeleteSavedSearch = async (id: string) => {
    const res = await fetch(`/api/searches?id=${id}`, { method: "DELETE", credentials: "include" }).catch(() => null);
    if (res?.ok) setSavedSearches((prev) => prev.filter((s) => s.id !== id));
  };

  const pushParams = useCallback(
    (overrides: Record<string, string> = {}) => {
      const params = new URLSearchParams();
      const values = { q, category, location, condition, minPrice, maxPrice, sort, ...overrides };
      if (values.q) params.set("q", values.q);
      if (values.category) params.set("category", values.category);
      if (values.location) params.set("location", values.location);
      if (values.condition) params.set("condition", values.condition);
      if (values.minPrice) params.set("minPrice", values.minPrice);
      if (values.maxPrice) params.set("maxPrice", values.maxPrice);
      if (values.sort && values.sort !== "newest") params.set("sort", values.sort);
      router.push(`/search?${params.toString()}`, { scroll: false });
    },
    [q, category, location, condition, minPrice, maxPrice, sort, router]
  );

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
  }, [searchParams]);

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
    pushParams();
    fetchListings(1, true);
  };

  const handleSortChange = (newSort: string) => {
    setSort(newSort);
    setPage(1);
    pushParams({ sort: newSort });
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
          <button
            onClick={() => setShowFilters(!showFilters)}
            aria-expanded={showFilters}
            className="md:hidden w-full flex items-center justify-between px-4 py-2.5 mb-3 bg-white border border-gray-200 rounded-2xl text-sm font-bold text-gray-700"
          >
            <span>{showFilters ? "Hide Filters" : "Show Filters"}</span>
            <span className="text-bai-blue">{showFilters ? "â–²" : "â–¼"}</span>
          </button>
          <div className={`bg-white rounded-2xl border border-gray-100 p-5 space-y-5 md:sticky top-20 ${showFilters ? "" : "hidden md:block"}`}>
            <h2 className="font-bold text-gray-900">Filters</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
              <div className="relative">
                <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 w-4 h-4" />
                <input
                  type="text"
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleApplyFilters(); }}
                  placeholder="Search items..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-bai-blue/20 focus:border-bai-blue"
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
              options={locationOptions}
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
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-bai-blue/20 focus:border-bai-blue"
                />
                <input
                  type="number"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="Max"
                  className="w-1/2 px-3 py-2 border border-gray-300 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-bai-blue/20 focus:border-bai-blue"
                />
              </div>
            </div>

            <Button onClick={handleApplyFilters} fullWidth>
              Apply Filters
            </Button>
          </div>
        </aside>

        {/* Results */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3 gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-gray-900">
              {q ? `Results for "${q}"` : "All Listings"}
            </h1>
            <div className="flex items-center gap-2">
              <button
                onClick={handleSaveSearch}
                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-bai-blue hover:bg-bai-blue-muted rounded-2xl transition-colors"
              >
                <FiBookmark className="w-4 h-4" />
                {saveState === "saving" ? "Saving..." : saveState === "saved" ? "Saved!" : saveState === "error" ? "Failed" : saveState === "auth" ? "Sign in to save" : "Save search"}
              </button>
              <Select
                options={sortOptions}
                value={sort}
                onChange={(e) => handleSortChange(e.target.value)}
                className="w-48"
              />
            </div>
          </div>

          {savedSearches.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-6">
              {savedSearches.map((s) => (
                <span key={s.id} className="inline-flex items-center gap-1 pl-3 pr-1.5 py-1 bg-bai-blue-light text-bai-blue text-sm font-medium rounded-full">
                  <button onClick={() => handleApplySavedSearch(s)} className="hover:underline">
                    {s.name}
                  </button>
                  <button
                    onClick={() => handleDeleteSavedSearch(s.id)}
                    aria-label={`Delete saved search ${s.name}`}
                    className="p-1 rounded-full hover:bg-bai-blue/10"
                  >
                    <FiX className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>
          )}

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
                    favorited={favIds.has(listing.id)}
                    onToggleFavorite={handleToggleFavorite}
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
