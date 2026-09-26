export type ConditionBadgeVariant = "blue" | "yellow" | "green" | "red" | "gray";

/**
 * Canonical condition → badge color map.
 * Used by ProductCard, ListingClient, and anywhere condition is displayed.
 */
export function getConditionVariant(condition: string): ConditionBadgeVariant {
  switch ((condition || "").toLowerCase()) {
    case "brand new":
      return "green";
    case "like new":
      return "blue";
    case "good":
      return "yellow";
    case "fair":
      return "yellow";
    case "for parts":
      return "gray";
    default:
      return "gray";
  }
}
