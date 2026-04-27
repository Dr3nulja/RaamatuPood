'use client';

import type { CategoryOption } from '@/lib/api/catalogTypes';
import { useTranslation } from '@/hooks/useTranslation';

type CategoryFilterProps = {
  categories: CategoryOption[];
  selectedCategoryId: string;
  onChange: (categoryId: string) => void;
};

export default function CategoryFilter({ categories, selectedCategoryId, onChange }: CategoryFilterProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full sm:w-64">
      <label htmlFor="category-filter" className="sr-only">{t('catalog.allCategories')}</label>
      <select
        id="category-filter"
        value={selectedCategoryId}
        onChange={(event) => onChange(event.target.value)}
        className="ui-select text-sm"
      >
        <option value="">{t('catalog.allCategories')}</option>
        {categories.map((category) => (
          <option key={category.id} value={String(category.id)}>
            {category.name}
          </option>
        ))}
      </select>
    </div>
  );
}
