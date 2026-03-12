"use client";

import React from "react";
import Image from "next/image";

interface BookCardProps {
  title: string;
  author?: string;
  cover?: string;
}

function isValidImageUrl(url: string): boolean {
  if (!url) return false;
  return url.startsWith("/") || url.startsWith("http://") || url.startsWith("https://");
}

function normalizeImageUrl(url: string): string {
  if (!url) return "";
  if (url.startsWith("/") || url.startsWith("http")) {
    return url;
  }
  // Add /images/ prefix for relative paths
  return `/images/${url}`;
}

export default function BookCard({ title, author, cover }: BookCardProps) {
  const [imageError, setImageError] = React.useState(false);
  const normalizedCover = cover ? normalizeImageUrl(cover) : "";
  const isValid = cover && isValidImageUrl(normalizedCover) && !imageError;

  return (
    <div className="w-40">
      <div className="h-56 bg-gray-200 rounded-md mb-2 flex items-center justify-center overflow-hidden relative">
        {isValid ? (
          <Image
            src={normalizedCover}
            alt={title}
            fill
            className="object-cover"
            sizes="160px"
            onError={() => {
              setImageError(true);
            }}
          />
        ) : (
          <span className="text-gray-500">Обложка</span>
        )}
      </div>
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
        {title}
      </h3>
      {author && <p className="text-xs text-gray-500">{author}</p>}
    </div>
  );
}
