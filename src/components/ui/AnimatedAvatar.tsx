'use client';
import React from "react";

type AvatarSize = "sm" | "md" | "lg" | "xl";
type UserRole = "buyer" | "seller" | "admin";

interface AnimatedAvatarProps {
  name: string;
  src?: string | null;
  size?: AvatarSize;
  role?: UserRole;
  showStatus?: boolean;
  online?: boolean;
  className?: string;
}

const sizeMap: Record<AvatarSize, string> = {
  sm: "w-8 h-8",
  md: "w-12 h-12",
  lg: "w-16 h-16",
  xl: "w-24 h-24",
};

const ringSizeMap: Record<AvatarSize, string> = {
  sm: "ring-2 ring-offset-1",
  md: "ring-3 ring-offset-2",
  lg: "ring-4 ring-offset-2",
  xl: "ring-4 ring-offset-3",
};

const statusSizeMap: Record<AvatarSize, string> = {
  sm: "w-2.5 h-2.5 border",
  md: "w-3 h-3 border-2",
  lg: "w-4 h-4 border-2",
  xl: "w-5 h-5 border-2",
};

const roleStyles: Record<UserRole, { ring: string; animation: string; glow: string }> = {
  admin: {
    ring: "ring-red-500",
    animation: "animate-pulse-ring",
    glow: "shadow-glow-red",
  },
  seller: {
    ring: "ring-[#F5D36B]",
    animation: "",
    glow: "shadow-glow-yellow",
  },
  buyer: {
    ring: "ring-[#7BA8D0]",
    animation: "animate-float",
    glow: "shadow-glow-blue",
  },
};

const AnimatedAvatar: React.FC<AnimatedAvatarProps> = ({
  name,
  src,
  size = "md",
  role = "buyer",
  showStatus = false,
  online = false,
  className = "",
}) => {
  const seed = encodeURIComponent(name);
  const avatarUrl = src || `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`;
  const styles = roleStyles[role];

  return (
    <div className={`relative inline-flex ${className}`}>
      <div
        className={`
          relative rounded-full overflow-hidden
          ${sizeMap[size]}
          ${ringSizeMap[size]}
          ${styles.ring}
          ${styles.glow}
          transition-all duration-300
        `}
      >
        {src ? (
          <img
            src={src}
            alt={`${name}'s avatar`}
            className="w-full h-full object-cover"
          />
        ) : (
          <img
            src={avatarUrl}
            alt={`${name}'s avatar`}
            className="w-full h-full object-cover"
          />
        )}
      </div>

      {(showStatus || online) && (
        <span
          className={`
            absolute bottom-0 right-0
            bg-green-500 rounded-full
            ${statusSizeMap[size]}
            border-white
          `}
        />
      )}
    </div>
  );
};

export default AnimatedAvatar;
