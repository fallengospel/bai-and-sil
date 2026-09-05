"use client";

import React, { useState } from "react";

interface ImageGalleryProps {
  images: string[];
  alt?: string;
  className?: string;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  images,
  alt = "Product image",
  className = "",
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [imgErrors, setImgErrors] = useState<Record<number, boolean>>({});

  const validImages = images.filter((img) => img && img.length > 0);
  const displayImages = validImages.length > 0 ? validImages : ["/placeholder.svg"];

  if (displayImages.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-xl aspect-square flex items-center justify-center ${className}`}>
        <img src="/placeholder.svg" alt="No image available" className="w-full h-full object-cover" />
      </div>
    );
  }

  const handleImgError = (index: number) => {
    setImgErrors((prev) => ({ ...prev, [index]: true }));
  };

  const getSrc = (index: number) => {
    return imgErrors[index] ? "/placeholder.svg" : displayImages[index];
  };

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={getSrc(selectedIndex)}
          alt={`${alt} ${selectedIndex + 1}`}
          onError={() => handleImgError(selectedIndex)}
          className={`w-full h-full object-contain transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "hover:scale-105"
          }`}
        />
      </div>

      {displayImages.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {displayImages.map((image, index) => (
            <button
              key={index}
              onClick={() => setSelectedIndex(index)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors ${
                selectedIndex === index
                  ? "border-[#1a56db]"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <img
                src={getSrc(index)}
                alt={`${alt} thumbnail ${index + 1}`}
                onError={() => handleImgError(index)}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {displayImages.length > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>
            {selectedIndex + 1} / {displayImages.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
