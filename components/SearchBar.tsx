'use client';

type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const safeValue = value ?? '';

  return (
    <div className="w-full">
      <label htmlFor="catalog-search" className="sr-only">Поиск книг</label>
      <input
        id="catalog-search"
        type="text"
        value={safeValue}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder="Поиск по названию книги"
        suppressHydrationWarning
        className="w-full rounded-xl border border-amber-200 bg-white px-4 py-3 text-sm text-zinc-800 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
      />
    </div>
  );
}
