"use client";

import React, { useState } from "react";
import { FiStar } from "react-icons/fi";
import { FaStar, FaStarHalfAlt } from "react-icons/fa";

interface StarRatingProps {
  rating: number;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  interactive?: boolean;
  onChange?: (rating: number) => void;
  className?: string;
}

const sizeMap = {
  sm: "w-3 h-3",
  md: "w-4 h-4",
  lg: "w-5 h-5",
};

const StarRating: React.FC<StarRatingProps> = ({
  rating,
  maxRating = 5,
  size = "md",
  interactive = false,
  onChange,
  className = "",
}) => {
  const [hoverRating, setHoverRating] = useState(0);
  const displayRating = interactive && hoverRating > 0 ? hoverRating : rating;

  const handleClick = (value: number) => {
    if (interactive && onChange) {
      onChange(value);
    }
  };

  const renderStar = (index: number) => {
    const value = index + 1;
    const iconSize = sizeMap[size];

    if (displayRating >= value) {
      return (
        <FaStar
          key={index}
          className={`${iconSize} text-[#F3D98F] ${
            interactive ? "cursor-pointer" : ""
          }`}
          onClick={() => handleClick(value)}
          onMouseEnter={() => interactive && setHoverRating(value)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      );
    }
    if (displayRating >= value - 0.5) {
      return (
        <FaStarHalfAlt
          key={index}
          className={`${iconSize} text-[#F3D98F] ${
            interactive ? "cursor-pointer" : ""
          }`}
          onClick={() => handleClick(value)}
          onMouseEnter={() => interactive && setHoverRating(value)}
          onMouseLeave={() => interactive && setHoverRating(0)}
        />
      );
    }
    return (
      <FiStar
        key={index}
        className={`${iconSize} text-gray-300 ${
          interactive ? "cursor-pointer" : ""
        }`}
        onClick={() => handleClick(value)}
        onMouseEnter={() => interactive && setHoverRating(value)}
        onMouseLeave={() => interactive && setHoverRating(0)}
      />
    );
  };

  return (
    <div className={`flex items-center gap-0.5 ${className}`}>
      {Array.from({ length: maxRating }, (_, i) => renderStar(i))}
    </div>
  );
};

export default StarRating;
