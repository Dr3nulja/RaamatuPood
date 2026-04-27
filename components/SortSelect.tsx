'use client';

import type { BooksSort } from '@/lib/api/catalogTypes';
import { useTranslation } from '@/hooks/useTranslation';

type SortSelectProps = {
  value: BooksSort;
  onChange: (value: BooksSort) => void;
};

export default function SortSelect({ value, onChange }: SortSelectProps) {
  const { t } = useTranslation();

  return (
    <div className="w-full sm:w-56">
      <label htmlFor="catalog-sort" className="sr-only">{t('catalog.sortBy')}</label>
      <select
        id="catalog-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as BooksSort)}
        className="ui-select text-sm"
      >
        <option value="price_asc">{t('catalog.priceLowToHigh')}</option>
        <option value="price_desc">{t('catalog.priceHighToLow')}</option>
        <option value="rating_desc">{t('catalog.popularFirst')}</option>
      </select>
    </div>
  );
}
