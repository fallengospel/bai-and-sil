import React from "react";

type BadgeVariant = "blue" | "yellow" | "green" | "red" | "gray";
type BadgeSize = "sm" | "md";

interface BadgeProps {
  variant?: BadgeVariant;
  size?: BadgeSize;
  children: React.ReactNode;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({
  variant = "blue",
  size = "md",
  children,
  className = "",
}) => {
  const variantStyles: Record<BadgeVariant, string> = {
    blue: "badge-blue bg-blue-100 text-[#1a56db]",
    yellow: "badge-yellow bg-yellow-100 text-[#f5a623]",
    green: "badge-green bg-green-100 text-green-700",
    red: "badge-red bg-red-100 text-[#e8634a]",
    gray: "badge-gray bg-gray-100 text-gray-700",
  };

  const sizeStyles: Record<BadgeSize, string> = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-2.5 py-1 text-sm",
  };

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
