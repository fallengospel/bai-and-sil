import LoadingSpinner from "@/components/ui/LoadingSpinner";

export default function Loading() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <LoadingSpinner size="lg" text="Bai is looking..." />
    </div>
  );
}
