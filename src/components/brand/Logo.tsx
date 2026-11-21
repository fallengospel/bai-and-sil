import Link from "next/link";

type Variant = "full" | "mark" | "stacked";
type Tone = "navy" | "reverse" | "mono";

interface LogoProps {
  variant?: Variant;
  tone?: Tone;
  size?: number;
  asLink?: boolean;
  className?: string;
}

// SALPAK mark: a gold arrow landing on a white bar with impact sparks —
// the moment a deal "salpaks" (lands).
const NavyMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="SALPAK"
  >
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#0A2E6E" />
    <path
      d="M32 12v26"
      stroke="#F5BD5D"
      strokeWidth="5.4"
      strokeLinecap="round"
    />
    <path
      d="M23 29l9 9 9-9"
      stroke="#F5BD5D"
      strokeWidth="5.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16 46h32" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
    <path
      d="M14 36l-5.5-5.5M50 36l5.5-5.5"
      stroke="#F5BD5D"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const ReverseMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="SALPAK"
  >
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#ffffff" />
    <path d="M32 12v26" stroke="#F5BD5D" strokeWidth="5.4" strokeLinecap="round" />
    <path
      d="M23 29l9 9 9-9"
      stroke="#F5BD5D"
      strokeWidth="5.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16 46h32" stroke="#0A2E6E" strokeWidth="5" strokeLinecap="round" />
    <path
      d="M14 36l-5.5-5.5M50 36l5.5-5.5"
      stroke="#F5BD5D"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

const MonoMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="SALPAK"
  >
    <rect
      x="4"
      y="4"
      width="56"
      height="56"
      rx="14"
      stroke="currentColor"
      strokeWidth="3.5"
    />
    <path d="M32 12v26" stroke="currentColor" strokeWidth="5.4" strokeLinecap="round" />
    <path
      d="M23 29l9 9 9-9"
      stroke="currentColor"
      strokeWidth="5.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path d="M16 46h32" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
    <path
      d="M14 36l-5.5-5.5M50 36l5.5-5.5"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
    />
  </svg>
);

function Mark({ tone, size }: { tone: Tone; size: number }) {
  const useMono = size < 20 || tone === "mono";

  return (
    <span
      className="inline-flex shrink-0"
      style={{ width: size, height: size, color: "#0A2E6E" }}
    >
      {useMono ? <MonoMark /> : tone === "reverse" ? <ReverseMark /> : <NavyMark />}
    </span>
  );
}

function Wordmark({ tone }: { tone: Exclude<Tone, "mono"> }) {
  return (
    <span
      className="font-brand font-bold tracking-tight leading-none"
      style={{
        letterSpacing: "-0.02em",
        color: tone === "navy" ? "#0A2E6E" : "#ffffff",
      }}
    >
      SALPAK
    </span>
  );
}

export default function Logo({
  variant = "full",
  tone = "navy",
  size = 32,
  asLink = false,
  className = "",
}: LogoProps) {
  const gap = Math.round(size * 0.38);

  const content = (() => {
    switch (variant) {
      case "mark":
        return <Mark tone={tone} size={size} />;

      case "stacked":
        return (
          <span className={`inline-flex flex-col items-center ${className}`}>
            <Mark tone={tone} size={size} />
            <span
              className="mt-1 font-brand font-bold leading-none"
              style={{
                fontSize: Math.max(10.5, size * 0.42),
                letterSpacing: "-0.02em",
                color: tone === "navy" ? "#0A2E6E" : "#ffffff",
              }}
            >
              SALPAK
            </span>
            <span
              className="font-brand uppercase leading-none"
              style={{
                fontSize: 10.5,
                letterSpacing: "0.24em",
                fontWeight: 700,
                color: tone === "navy" ? "#0A2E6E" : "#ffffff",
                opacity: 0.7,
                marginTop: 2,
              }}
            >
              PINOY MARKETPLACE
            </span>
          </span>
        );

      case "full":
      default:
        return (
          <span
            className={`inline-flex items-center ${className}`}
            style={{ gap }}
          >
            <Mark tone={tone} size={size} />
            <Wordmark tone={tone as "navy" | "reverse"} />
          </span>
        );
    }
  })();

  if (asLink) {
    return (
      <Link href="/" className="flex-shrink-0">
        {content}
      </Link>
    );
  }

  return content;
}
