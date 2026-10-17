export default function PriceTag({
  price,
  className = "",
}: {
  price: string;
  className?: string;
}) {
  return (
    <div className={`inline-flex flex-col items-center ${className}`}>
      {/* String */}
      <div className="w-px h-3 bg-ink/40" />
      {/* Tag body */}
      <div className="relative bg-sun px-3 py-1.5 rounded-lg shadow-sm">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-sun rounded-full" />
        <span className="text-sm font-bold text-ink whitespace-nowrap">
          {price}
        </span>
      </div>
    </div>
  );
}
