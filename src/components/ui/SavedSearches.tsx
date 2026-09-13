"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import Button from "@/components/ui/Button";
import { FiBookmark, FiX, FiPlus } from "react-icons/fi";

interface SavedSearch {
  id: string;
  name: string;
  query: string;
  category?: string;
  location?: string;
  condition?: string;
  minPrice?: number;
  maxPrice?: number;
}

interface SavedSearchesProps {
  currentQuery: string;
  currentCategory: string;
  currentLocation: string;
  currentCondition: string;
  currentMinPrice: string;
  currentMaxPrice: string;
}

export default function SavedSearches({
  currentQuery,
  currentCategory,
  currentLocation,
  currentCondition,
  currentMinPrice,
  currentMaxPrice,
}: SavedSearchesProps) {
  const router = useRouter();
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [searchName, setSearchName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me", { credentials: "include" })
      .then((r) => {
        if (r.ok) {
          setIsLoggedIn(true);
          return r.json();
        }
        return null;
      })
      .then((data) => {
        if (data?.user) {
          fetchSavedSearches();
        }
      })
      .catch(() => {});
  }, []);

  const fetchSavedSearches = async () => {
    try {
      const res = await fetch("/api/searches", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setSearches(data.searches || []);
      }
    } catch {
      // ignore
    }
  };

  const handleSave = async () => {
    if (!searchName.trim()) {
      toast.error("Enter a name for this search");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          name: searchName.trim(),
          query: currentQuery,
          category: currentCategory || undefined,
          location: currentLocation || undefined,
          condition: currentCondition || undefined,
          minPrice: currentMinPrice ? parseFloat(currentMinPrice) : undefined,
          maxPrice: currentMaxPrice ? parseFloat(currentMaxPrice) : undefined,
        }),
      });

      if (res.ok) {
        toast.success("Search saved!");
        setShowSaveModal(false);
        setSearchName("");
        fetchSavedSearches();
      } else {
        toast.error("Failed to save search");
      }
    } catch {
      toast.error("Failed to save search");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/searches?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });
      setSearches((prev) => prev.filter((s) => s.id !== id));
      toast.success("Search deleted");
    } catch {
      toast.error("Failed to delete search");
    }
  };

  const handleLoad = (search: SavedSearch) => {
    const params = new URLSearchParams();
    if (search.query) params.set("q", search.query);
    if (search.category) params.set("category", search.category);
    if (search.location) params.set("location", search.location);
    if (search.condition) params.set("condition", search.condition);
    if (search.minPrice) params.set("minPrice", String(search.minPrice));
    if (search.maxPrice) params.set("maxPrice", String(search.maxPrice));
    router.push(`/search?${params.toString()}`);
  };

  if (!isLoggedIn) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-gray-900 text-sm">Saved Searches</h3>
        <button
          onClick={() => setShowSaveModal(true)}
          className="text-xs text-[#7298C7] hover:underline flex items-center gap-1"
        >
          <FiPlus className="w-3 h-3" /> Save current
        </button>
      </div>

      {searches.length === 0 ? (
        <p className="text-xs text-gray-400 py-2">No saved searches yet</p>
      ) : (
        <div className="space-y-2">
          {searches.map((search) => (
            <div
              key={search.id}
              className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 group"
            >
              <button
                onClick={() => handleLoad(search)}
                className="flex items-center gap-2 text-sm text-gray-700 hover:text-[#7298C7] text-left flex-1 min-w-0"
              >
                <FiBookmark className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                <span className="truncate">{search.name}</span>
              </button>
              <button
                onClick={() => handleDelete(search.id)}
                className="p-1 text-gray-400 hover:text-[#e8634a] opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <FiX className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {showSaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowSaveModal(false)} />
          <div className="relative bg-white rounded-xl shadow-xl w-full max-w-sm mx-4 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Save Search</h3>
            <input
              type="text"
              value={searchName}
              onChange={(e) => setSearchName(e.target.value)}
              placeholder="e.g., Electronics in Manila"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#7298C7]/20 focus:border-[#7298C7]"
            />
            <div className="flex gap-3 mt-4">
              <Button variant="ghost" onClick={() => setShowSaveModal(false)} fullWidth>
                Cancel
              </Button>
              <Button onClick={handleSave} loading={loading} fullWidth>
                Save
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
