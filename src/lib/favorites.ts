import toast from "react-hot-toast";

/**
 * Toggles a listing in the current user's favorites.
 * Returns the new favorited state, or null if the toggle failed.
 */
export async function toggleFavorite(listingId: string): Promise<boolean | null> {
  try {
    const res = await fetch(`/api/listings/${listingId}/favorite`, {
      method: "POST",
      credentials: "include",
    });
    if (res.status === 401) {
      toast.error("Please log in to save items");
      return null;
    }
    if (!res.ok) {
      toast.error("Failed to update favorite");
      return null;
    }
    const data = await res.json();
    return data.favorited;
  } catch {
    toast.error("Failed to update favorite");
    return null;
  }
}
