'use client';

import { useTranslation } from '@/hooks/useTranslation';

type SearchBarProps = {
  value?: string;
  onChange?: (value: string) => void;
};

export default function SearchBar({ value, onChange }: SearchBarProps) {
  const { t } = useTranslation();
  const safeValue = value ?? '';

  return (
    <div className="w-full">
      <label htmlFor="catalog-search" className="sr-only">{t('catalog.searchPlaceholder')}</label>
      <input
        id="catalog-search"
        type="text"
        value={safeValue}
        onChange={(event) => onChange?.(event.target.value)}
        placeholder={t('catalog.searchPlaceholder')}
        className="ui-input text-sm"
      />
    </div>
  );
}
