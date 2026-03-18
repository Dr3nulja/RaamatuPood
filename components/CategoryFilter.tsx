'use client';

import type { CategoryOption } from '@/lib/api/catalogTypes';

type CategoryFilterProps = {
  categories: CategoryOption[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
};

export default function CategoryFilter({ categories, selectedCategoryId, onChange }: CategoryFilterProps) {
  return (
    <div className="w-full sm:w-64">
      <label htmlFor="category-filter" className="sr-only">Фильтр по категории</label>
      <select
        id="category-filter"
        value={selectedCategoryId}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
      >
        <option value="">Все категории</option>
        {categories.map((category) => (
          <option key={category.id} value={String(category.id)}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
