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
      <div className="w-px h-3 bg-[#101B3A]/40" />
      {/* Tag body */}
      <div className="relative bg-[#FFC72C] px-3 py-1.5 rounded-sm shadow-sm">
        <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-[#FFC72C] rounded-full" />
        <span className="text-sm font-bold text-[#101B3A] whitespace-nowrap">
          {price}
        </span>
      </div>
    </div>
  );
}
