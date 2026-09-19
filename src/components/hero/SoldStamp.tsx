export default function SoldStamp({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 40"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* Outer ring */}
      <rect
        x="2"
        y="2"
        width="96"
        height="36"
        rx="4"
        stroke="#E63B2E"
        strokeWidth="3"
        fill="none"
      />
      {/* Inner ring */}
      <rect
        x="6"
        y="6"
        width="88"
        height="28"
        rx="2"
        stroke="#E63B2E"
        strokeWidth="1.5"
        fill="none"
      />
      {/* Text */}
      <text
        x="50"
        y="26"
        textAnchor="middle"
        fontSize="18"
        fontWeight="900"
        fill="#E63B2E"
        fontFamily="sans-serif"
        letterSpacing="0.1em"
      >
        SOLD
      </text>
    </svg>
  );
}
