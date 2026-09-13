"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Badge from "./Badge";

interface ViewedItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: string;
  viewedAt: number;
}

const RecentlyViewed: React.FC = () => {
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("recentlyViewed");
      if (stored) {
        const parsed: ViewedItem[] = JSON.parse(stored);
        setItems(parsed.slice(0, 8));
      }
    } catch {
      // ignore
    }
  }, []);

  if (items.length === 0) return null;

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Recently Viewed</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <Link
            key={item.id}
            href={`/listing/${item.slug}`}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:-translate-y-1 hover:shadow-md transition-all duration-200"
          >
            <div className="aspect-square overflow-hidden">
              <img
                src={item.imageUrl || "/placeholder.svg"}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3">
              <h3 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                {item.title}
              </h3>
              <p className="text-lg font-bold text-[#7BA8D0] mb-1">
                ₱{item.price.toLocaleString()}
              </p>
              <Badge variant="gray" size="sm">
                {item.condition}
              </Badge>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
};

export default RecentlyViewed;
