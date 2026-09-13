'use client';
import React from "react";

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

function getColorFromName(name?: string): string {
  if (!name) return "bg-gray-400";
  const colors = [
    "bg-[#7298C7]",
    "bg-[#F3D98F]",
    "bg-[#e8634a]",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-teal-500",
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
  const [imgError, setImgError] = React.useState(false);

  const showImage = src && !imgError;

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
          className={`w-full h-full rounded-full flex items-center justify-center text-white font-medium ${getColorFromName(
            name
          )}`}
        >
          {getInitials(name)}
        </div>
      )}
    </div>
  );
};

export default Avatar;
