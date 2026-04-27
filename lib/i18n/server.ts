import { cookies } from 'next/headers';
import enMessages from '@/locales/en.json';
import etMessages from '@/locales/et.json';

export type ServerLocale = 'en' | 'et';

const INTL_LOCALE_MAP: Record<ServerLocale, string> = {
  en: 'en-US',
  et: 'et-EE',
};

const messagesByLocale = {
  en: enMessages,
  et: etMessages,
} as const;

function resolveNestedValue(source: Record<string, unknown>, key: string): string | null {
  const parts = key.split('.');
  let current: unknown = source;

  for (const part of parts) {
    if (!current || typeof current !== 'object') {
      return null;
    }

    current = (current as Record<string, unknown>)[part];
  }

  return typeof current === 'string' ? current : null;
}

function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}|\{(\w+)\}/g, (match, doubleBraced, singleBraced) => {
    const paramKey = (doubleBraced || singleBraced) as string;
    const value = params[paramKey];
    return value === undefined || value === null ? match : String(value);
  });
}

export function detectServerLocale(): ServerLocale {
  const cookieLocale = cookies().get('raamatupood-locale')?.value;
  return cookieLocale === 'et' ? 'et' : 'en';
}

export function createServerTranslator(locale: ServerLocale) {
  const t = (key: string, params?: Record<string, string | number>): string => {
    const template =
      resolveNestedValue(messagesByLocale[locale] as unknown as Record<string, unknown>, key) ??
      resolveNestedValue(messagesByLocale.en as unknown as Record<string, unknown>, key) ??
      key;

    return interpolate(template, params);
  };

  const formatDate = (date: Date): string =>
    new Intl.DateTimeFormat(INTL_LOCALE_MAP[locale], {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(date);

  const formatPrice = (value: number): string =>
    new Intl.NumberFormat(INTL_LOCALE_MAP[locale], {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return { t, formatDate, formatPrice };
}