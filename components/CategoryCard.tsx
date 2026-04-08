import React from "react";

interface CategoryCardProps {
  name: string;
}

// Иконки и цвета для разных категорий
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

// Цветовые схемы для категорий
const categoryColors: Record<string, { bg: string; border: string; text: string; hover: string }> = {
  default: {
    bg: "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-900/30 dark:to-yellow-900/30",
    border: "border-amber-200 dark:border-amber-800",
    text: "text-amber-900 dark:text-amber-100",
    hover: "hover:from-amber-100 hover:to-yellow-100 dark:hover:from-amber-900/50 dark:hover:to-yellow-900/50",
  },
};

export default function CategoryCard({ name }: CategoryCardProps) {
  const icon = categoryIcons[name] || "📚";
  const colors = categoryColors.default;

  return (
    <div
      className={`
        group relative px-6 py-4 rounded-2xl text-sm font-semibold
        border-2 cursor-pointer transition-all duration-300
        ${colors.bg}
        ${colors.border}
        ${colors.text}
        ${colors.hover}
        hover:shadow-lg hover:-translate-y-1 hover:scale-105
        dark:shadow-lg
      `}
    >
      {/* Фоновый градиент при хувере */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-amber-200/0 to-yellow-200/0 group-hover:from-amber-200/10 group-hover:to-yellow-200/10 dark:group-hover:from-amber-200/5 dark:group-hover:to-yellow-200/5 transition-all duration-300"></div>

      {/* Контент */}
      <div className="relative flex items-center gap-3 justify-between">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <span className="font-semibold">{name}</span>
        </div>

        {/* Стрелка при хувере */}
        <span className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:translate-x-1">
          →
        </span>
      </div>

      {/* Декоративный элемент */}
      <div className="absolute -right-2 -top-2 w-8 h-8 rounded-full bg-gradient-to-br from-amber-300 to-yellow-300 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
    </div>
  );
}
