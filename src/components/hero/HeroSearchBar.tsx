"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FiSearch } from "react-icons/fi";

const CHIPS = [
  { label: "Electronics", slug: "electronics" },
  { label: "Fashion", slug: "fashion" },
  { label: "Gaming", slug: "gaming" },
  { label: "Home Living", slug: "home-living" },
  { label: "Vehicles", slug: "vehicles" },
];

export default function HeroSearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div className="w-full max-w-lg">
      <form onSubmit={handleSubmit} className="relative">
        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ano hanap mo?"
          className="w-full pl-12 pr-24 py-3.5 bg-white rounded-lg text-ink placeholder-gray-400 text-base font-medium shadow-lg border-2 border-transparent focus:outline-none focus:border-[#FFC72C] transition-colors"
        />
        <button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-2 bg-[#FFC72C] text-ink text-sm font-bold rounded-lg hover:bg-[#E6B820] transition-colors"
        >
          Hanapin
        </button>
      </form>
      <div className="flex flex-wrap gap-2 mt-3">
        {CHIPS.map((chip) => (
          <a
            key={chip.slug}
            href={`/search?category=${chip.slug}`}
            className="px-3 py-1.5 bg-white/15 hover:bg-white/25 text-white/90 text-xs font-medium rounded-lg backdrop-blur-sm border border-white/10 transition-colors"
          >
            {chip.label}
          </a>
        ))}
      </div>
    </div>
  );
}
