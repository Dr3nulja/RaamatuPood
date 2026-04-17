'use client';

import type { BooksSort } from '@/lib/api/catalogTypes';

type SortSelectProps = {
  value: BooksSort;
  onChange: (value: BooksSort) => void;
};

export default function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <div className="w-full sm:w-56">
      <label htmlFor="catalog-sort" className="sr-only">Сортировка</label>
      <select
        id="catalog-sort"
        value={value}
        onChange={(event) => onChange(event.target.value as BooksSort)}
        className="ui-select text-sm"
      >
        <option value="price_asc">Price ↑</option>
        <option value="price_desc">Price ↓</option>
        <option value="rating_desc">Rating</option>
      </select>
    </div>
  );
}
