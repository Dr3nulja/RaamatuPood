'use client';

import { useTranslation, type Locale } from '@/hooks/useTranslation';

const LOCALES: Locale[] = ['en', 'et'];

export default function LanguageSwitcher() {
  const { locale, setLocale } = useTranslation();

  return (
    <div className="inline-flex items-center gap-2">
      {LOCALES.map((item) => {
        const isActive = item === locale;

        return (
          <button
            key={item}
            type="button"
            onClick={() => {
              void setLocale(item);
            }}
            aria-pressed={isActive}
            className={`px-3 py-1.5 text-xs font-semibold uppercase tracking-wide transition-colors duration-200 ${
              isActive
                ? 'rounded-xl border border-primary bg-primary text-white'
                : 'rounded-xl border border-zinc-300 bg-transparent text-zinc-800 hover:bg-zinc-100'
            }`}
          >
            {item.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}
