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
        className="ui-input text-sm"
      />
    </div>
  );
}
