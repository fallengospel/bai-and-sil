"use client";

import React, { useRef, useState } from "react";
import { FiUploadCloud, FiX } from "react-icons/fi";

interface FileUploadProps {
  accept?: string;
  maxSize?: number;
  currentPreview?: string;
  onFileSelect: (dataUrl: string) => void;
  label?: string;
  className?: string;
}

const FileUpload: React.FC<FileUploadProps> = ({
  accept = "image/*",
  maxSize = 2 * 1024 * 1024,
  currentPreview,
  onFileSelect,
  label,
  className = "",
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(currentPreview || null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);

    if (file.size > maxSize) {
      setError(`File size must be less than ${Math.round(maxSize / 1024 / 1024)}MB`);
      return;
    }

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setPreview(result);
      onFileSelect(result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemove = () => {
    setPreview(null);
    onFileSelect("");
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className={className}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      )}
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
        id="file-upload"
      />
      {preview ? (
        <div className="relative inline-block">
          <img
            src={preview}
            alt="Preview"
            className="w-24 h-24 rounded-full object-cover border-2 border-gray-200"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute -top-1 -right-1 w-6 h-6 bg-[#e8634a] text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <FiX className="w-3 h-3" />
          </button>
        </div>
      ) : (
        <label
          htmlFor="file-upload"
          className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-[#7BA8D0] hover:bg-blue-50 transition-colors"
        >
          <FiUploadCloud className="w-8 h-8 text-gray-400 mb-2" />
          <span className="text-sm text-gray-500">Click to upload image</span>
          <span className="text-xs text-gray-400 mt-1">Max {Math.round(maxSize / 1024 / 1024)}MB</span>
        </label>
      )}
      {error && <p className="mt-1 text-xs text-[#e8634a]">{error}</p>}
    </div>
  );
};

export default FileUpload;
