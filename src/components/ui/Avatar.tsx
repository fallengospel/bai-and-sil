'use client';

import { useState } from 'react';

type AvatarSize = "sm" | "md" | "lg" | "xl";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string;
  size?: AvatarSize;
  ring?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-14 h-14 text-base",
  xl: "w-20 h-20 text-lg",
};

const ringSizeMap: Record<AvatarSize, string> = {
  sm: "ring-2 ring-white",
  md: "ring-2 ring-white",
  lg: "ring-2 ring-white",
  xl: "ring-4 ring-white",
};

function getInitials(name?: string): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function getColorFromName(name?: string): { bg: string; text: string } {
  if (!name) return { bg: "bg-gray-400", text: "text-ink" };
  // Per-background initials color so every combination meets WCAG AA (4.5:1).
  const colors = [
    { bg: "bg-bai-blue", text: "text-white" },
    { bg: "bg-sil-yellow", text: "text-ink" },
    { bg: "bg-coral", text: "text-ink" },
    { bg: "bg-emerald-500", text: "text-ink" },
    { bg: "bg-purple-600", text: "text-white" },
    { bg: "bg-pink-500", text: "text-ink" },
    { bg: "bg-teal-500", text: "text-ink" },
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

const Avatar: React.FC<AvatarProps> = ({
  src,
  alt = "",
  name,
  size = "md",
  ring = false,
  className = "",
}) => {
  const [imgError, setImgError] = useState(false);

  const showImage = src && !imgError;
  const initialsColor = getColorFromName(name);

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-full ${sizeMap[size]} ${
        ring ? ringSizeMap[size] : ""
      } ${className}`}
    >
      {showImage ? (
        <img
          src={src}
          alt={alt || name || "Avatar"}
          className="w-full h-full rounded-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <div
          className={`w-full h-full rounded-full flex items-center justify-center font-medium ${initialsColor.bg} ${initialsColor.text}`}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
