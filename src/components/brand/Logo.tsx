import React from "react";
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

const NavyMark = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 64 64"
    fill="none"
    role="img"
    aria-label="BAI & SIL"
  >
    <rect x="6" y="23" width="52" height="35" rx="11" fill="#0A2E6E" />
    <path
      d="M20 27V21a12 12 0 0 1 22.5-5.8"
      stroke="#F5BD5D"
      strokeWidth="5.2"
      strokeLinecap="round"
    />
    <path
      d="M36.5 12.5 43.8 14.4 42 21.7"
      stroke="#F5BD5D"
      strokeWidth="5.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 33.5v18M25.5 39.5h13M25.5 45h13"
      stroke="#fff"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
    <path
      d="M32 33.5h5.2a5.6 5.6 0 0 1 0 11.2"
      stroke="#fff"
      strokeWidth="3.6"
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
    aria-label="BAI & SIL"
  >
    <rect x="6" y="23" width="52" height="35" rx="11" fill="#ffffff" />
    <path
      d="M20 27V21a12 12 0 0 1 22.5-5.8"
      stroke="#F5BD5D"
      strokeWidth="5.2"
      strokeLinecap="round"
    />
    <path
      d="M36.5 12.5 43.8 14.4 42 21.7"
      stroke="#F5BD5D"
      strokeWidth="5.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 33.5v18M25.5 39.5h13M25.5 45h13"
      stroke="#0A2E6E"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
    <path
      d="M32 33.5h5.2a5.6 5.6 0 0 1 0 11.2"
      stroke="#0A2E6E"
      strokeWidth="3.6"
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
    aria-label="BAI & SIL"
  >
    <rect x="6" y="23" width="52" height="35" rx="11" fill="currentColor" />
    <path
      d="M20 27V21a12 12 0 0 1 22.5-5.8"
      stroke="currentColor"
      strokeWidth="5.2"
      strokeLinecap="round"
    />
    <path
      d="M36.5 12.5 43.8 14.4 42 21.7"
      stroke="currentColor"
      strokeWidth="5.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M32 33.5v18M25.5 39.5h13M25.5 45h13"
      stroke="currentColor"
      strokeWidth="3.6"
      strokeLinecap="round"
    />
    <path
      d="M32 33.5h5.2a5.6 5.6 0 0 1 0 11.2"
      stroke="currentColor"
      strokeWidth="3.6"
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
      BAI
      <span className="text-brand-gold">&amp;</span>
      SIL
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
              BAI
              <span className="text-brand-gold">&amp;</span>
              SIL
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
