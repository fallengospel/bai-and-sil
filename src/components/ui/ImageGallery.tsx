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

  if (images.length === 0) {
    return (
      <div className={`bg-gray-100 rounded-xl aspect-square flex items-center justify-center ${className}`}>
        <span className="text-gray-400 text-sm">No images available</span>
      </div>
    );
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div
        className="relative aspect-square rounded-xl overflow-hidden bg-gray-100 cursor-zoom-in"
        onClick={() => setIsZoomed(!isZoomed)}
      >
        <img
          src={images[selectedIndex]}
          alt={`${alt} ${selectedIndex + 1}`}
          className={`w-full h-full object-contain transition-transform duration-300 ${
            isZoomed ? "scale-150 cursor-zoom-out" : "hover:scale-105"
          }`}
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((image, index) => (
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
                src={image}
                alt={`${alt} thumbnail ${index + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {images.length > 1 && (
        <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
          <span>
            {selectedIndex + 1} / {images.length}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
