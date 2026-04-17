import React from "react";

interface CategoryCardProps {
  name: string;
}

const categoryIcons: Record<string, string> = {
  "Фантастика": "🚀",
  "Детектив": "🔍",
  "Романтика": "💕",
  "Фэнтези": "🐉",
  "Ужасы": "👻",
  "История": "📜",
  "Биография": "👤",
  "Научный": "🔬",
  "Философия": "💭",
  "Поэзия": "✨",
  "Комедия": "😂",
  "Приключения": "🗺️",
};

export default function CategoryCard({ name }: CategoryCardProps) {
  const icon = categoryIcons[name] || "📚";

  return (
    <div
      className={`
        group relative cursor-pointer rounded-2xl border border-border
        bg-gradient-to-br from-background to-background-muted px-6 py-4
        text-sm font-semibold text-text-primary shadow-sm transition-all duration-300
        hover:-translate-y-1 hover:scale-[1.02] hover:shadow-md
      `}
    >
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-soft/0 to-primary-soft/0 transition-all duration-300 group-hover:from-primary-soft/40 group-hover:to-primary-soft/15"></div>

      <div className="relative flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold">{name}</span>
        </div>

        <span className="text-secondary opacity-0 transition-opacity duration-300 transform group-hover:translate-x-1 group-hover:opacity-100">
          →
        </span>
      </div>

      <div className="absolute -right-2 -top-2 h-8 w-8 rounded-full bg-gradient-to-br from-primary to-primary-hover opacity-0 transition-opacity duration-300 group-hover:opacity-15"></div>
    </div>
  );
}
