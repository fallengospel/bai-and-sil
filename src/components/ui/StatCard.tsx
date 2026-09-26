import React from "react";

type StatCardSize = "sm" | "md";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  iconBg?: string;
  valueClassName?: string;
  size?: StatCardSize;
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  label,
  value,
  icon,
  iconBg = "bg-gradient-to-br from-bai-blue to-bai-blue/80",
  valueClassName = "animate-count-up",
  size = "md",
  className = "",
}) => {
  const isSm = size === "sm";
  return (
    <div
      className={`bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5 ${
        isSm ? "p-5" : "p-6"
      } ${className}`}
    >
      <div className={`flex items-center ${isSm ? "gap-3" : "gap-4"}`}>
        {icon && (
          <div
            className={`${isSm ? "w-11 h-11" : "w-12 h-12"} ${iconBg} rounded-2xl flex items-center justify-center shadow-sm`}
          >
            {icon}
          </div>
        )}
        <div>
          <p className={`${isSm ? "text-xs" : "text-sm"} text-gray-500`}>{label}</p>
          <p
            className={`${isSm ? "text-xl" : "text-2xl"} font-bold text-gray-900 ${valueClassName}`}
          >
            {value}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;
