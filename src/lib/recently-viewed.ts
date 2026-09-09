export interface ViewedItem {
  id: string;
  slug: string;
  title: string;
  price: number;
  imageUrl: string;
  condition: string;
  viewedAt: number;
}

const STORAGE_KEY = "recentlyViewed";
const MAX_ITEMS = 20;

export function trackRecentlyViewed(item: Omit<ViewedItem, "viewedAt">) {
  if (typeof window === "undefined") return;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const items: ViewedItem[] = stored ? JSON.parse(stored) : [];
    const filtered = items.filter((i) => i.id !== item.id);
    filtered.unshift({ ...item, viewedAt: Date.now() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered.slice(0, MAX_ITEMS)));
  } catch {
    // ignore
  }
}

export function getRecentlyViewed(): ViewedItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}
