export function PhoneIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 160" fill="none" className={className} aria-hidden="true">
      {/* Phone body */}
      <rect x="15" y="5" width="90" height="150" rx="14" fill="#101B3A" />
      <rect x="20" y="14" width="80" height="128" rx="8" fill="#E8F4FD" />
      {/* Screen content */}
      <rect x="28" y="26" width="64" height="36" rx="4" fill="#023E8A" />
      <rect x="28" y="70" width="64" height="8" rx="2" fill="#CBD5E1" />
      <rect x="28" y="84" width="40" height="8" rx="2" fill="#CBD5E1" />
      <rect x="28" y="100" width="64" height="32" rx="4" fill="#FFC72C" />
      <text x="60" y="120" textAnchor="middle" fontSize="11" fontWeight="700" fill="#101B3A" fontFamily="sans-serif">P11,500</text>
      {/* Camera notch */}
      <circle cx="60" cy="10" r="3" fill="#023E8A" />
    </svg>
  );
}

export function SneakerIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 100" fill="none" className={className} aria-hidden="true">
      {/* Sole */}
      <path d="M10 75 Q10 85 20 88 L120 88 Q135 88 138 78 L138 70 Q138 62 128 60 L90 55 L60 58 L30 62 Q15 65 10 75Z" fill="#101B3A" />
      {/* Upper */}
      <path d="M25 62 Q20 45 30 30 Q40 18 55 20 L80 22 L100 30 Q120 40 128 55 L90 52 L60 55 L30 58Z" fill="#E8F4FD" />
      {/* Swoosh/stripe */}
      <path d="M40 50 Q60 35 100 42" stroke="#FFC72C" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Laces */}
      <line x1="55" y1="24" x2="65" y2="28" stroke="#023E8A" strokeWidth="1.5" />
      <line x1="60" y1="22" x2="70" y2="26" stroke="#023E8A" strokeWidth="1.5" />
      <line x1="65" y1="21" x2="75" y2="25" stroke="#023E8A" strokeWidth="1.5" />
    </svg>
  );
}

export function FanIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 100 120" fill="none" className={className} aria-hidden="true">
      {/* Stand */}
      <rect x="45" y="85" width="10" height="30" rx="3" fill="#101B3A" />
      <ellipse cx="50" cy="118" rx="20" ry="4" fill="#101B3A" />
      {/* Head circle */}
      <circle cx="50" cy="45" r="38" fill="#E8F4FD" stroke="#101B3A" strokeWidth="3" />
      {/* Grill lines */}
      {[0, 30, 60, 90, 120, 150].map((angle) => (
        <line
          key={angle}
          x1="50"
          y1="45"
          x2={50 + 34 * Math.cos((angle * Math.PI) / 180)}
          y2={45 + 34 * Math.sin((angle * Math.PI) / 180)}
          stroke="#CBD5E1"
          strokeWidth="1"
        />
      ))}
      {/* Center */}
      <circle cx="50" cy="45" r="8" fill="#023E8A" />
      <circle cx="50" cy="45" r="3" fill="#FFC72C" />
    </svg>
  );
}

export function ControllerIllustration({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 140 80" fill="none" className={className} aria-hidden="true">
      {/* Body */}
      <path d="M30 25 Q20 20 15 30 Q8 45 15 60 Q20 70 35 65 L55 50 L85 50 L105 65 Q120 70 125 60 Q132 45 125 30 Q120 20 110 25 L90 35 L50 35Z" fill="#101B3A" />
      {/* Face */}
      <ellipse cx="70" cy="40" rx="35" ry="18" fill="#1a2744" />
      {/* D-pad left */}
      <rect x="38" y="33" width="12" height="4" rx="1" fill="#023E8A" />
      <rect x="42" y="29" width="4" height="12" rx="1" fill="#023E8A" />
      {/* Buttons right */}
      <circle cx="92" cy="32" r="4" fill="#E63B2E" />
      <circle cx="100" cy="38" r="4" fill="#FFC72C" />
      <circle cx="92" cy="44" r="4" fill="#023E8A" />
      <circle cx="84" cy="38" r="4" fill="#E8F4FD" />
      {/* Sticks */}
      <circle cx="55" cy="50" r="5" fill="#1a2744" stroke="#023E8A" strokeWidth="1" />
      <circle cx="85" cy="50" r="5" fill="#1a2744" stroke="#023E8A" strokeWidth="1" />
    </svg>
  );
}
