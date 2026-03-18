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
        className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
      >
        <option value="price_asc">Price ↑</option>
        <option value="price_desc">Price ↓</option>
        <option value="rating_desc">Rating</option>
      </select>
    </div>
  );
}
