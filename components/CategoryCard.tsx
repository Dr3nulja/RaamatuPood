import React from "react";

interface CategoryCardProps {
  name: string;
}

export default function CategoryCard({ name }: CategoryCardProps) {
  return (
    <div className="px-4 py-2 bg-white dark:bg-gray-800 rounded-full text-sm shadow-sm">
      {name}
    </div>
  );
}
