import React from "react";
import { FiCheckCircle } from "react-icons/fi";

interface VerificationBadgeProps {
  size?: "sm" | "md";
  className?: string;
}

const VerificationBadge: React.FC<VerificationBadgeProps> = ({
  size = "sm",
  className = "",
}) => {
  const sizeClasses = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  const textClasses = size === "sm" ? "text-xs" : "text-sm";

  return (
    <span
      className={`inline-flex items-center gap-1 text-[#7298C7] ${textClasses} ${className}`}
      title="Verified Seller"
    >
      <FiCheckCircle className={sizeClasses} />
    </span>
  );
};

export default VerificationBadge;
