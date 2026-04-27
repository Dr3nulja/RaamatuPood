'use client';

import { useCallback, useEffect } from 'react';
import { create } from 'zustand';
import enMessages from '@/locales/en.json';

export type Locale = 'en' | 'et';
export type TranslationParams = Record<string, string | number>;

type MessagesSchema = typeof enMessages;
type TranslationValue = string | TranslationTree;
type TranslationTree = { [key: string]: TranslationValue };

type DotNestedKeys<T> = T extends string
  ? never
  : {
      [K in keyof T & string]: T[K] extends string
        ? K
        : T[K] extends Record<string, unknown>
          ? `${K}.${DotNestedKeys<T[K]>}`
          : never;
    }[keyof T & string];

export type TranslationKey = DotNestedKeys<MessagesSchema>;

const STORAGE_KEY = 'raamatupood-locale';
const DEFAULT_LOCALE: Locale = 'en';
const INTL_LOCALE_MAP: Record<Locale, string> = {
  en: 'en-US',
  et: 'et-EE',
};

const localeLoaders: Record<Locale, () => Promise<TranslationTree>> = {
  en: async () => (await import('@/locales/en.json')).default as TranslationTree,
  et: async () => (await import('@/locales/et.json')).default as TranslationTree,
};

const runtimeCache = new Map<Locale, TranslationTree>([['en', enMessages as TranslationTree]]);

function isLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'et';
}

function readLocaleFromCookie(): Locale | null {
  if (typeof document === 'undefined') {
    return null;
  }

  const prefix = `${STORAGE_KEY}=`;
  const cookieValue = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(prefix))
    ?.slice(prefix.length);

  return isLocale(cookieValue) ? cookieValue : null;
}

function persistLocale(locale: Locale) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, locale);
  document.cookie = `${STORAGE_KEY}=${locale}; Path=/; Max-Age=31536000; SameSite=Lax`;
}

function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCALE;
  }

  const storedLocale = window.localStorage.getItem(STORAGE_KEY);
  if (isLocale(storedLocale)) {
    return storedLocale;
  }

  const cookieLocale = readLocaleFromCookie();
  if (cookieLocale) {
    return cookieLocale;
  }

  const browserLocale = window.navigator.language.toLowerCase();
  return browserLocale.startsWith('et') ? 'et' : 'en';
}

async function loadLocaleMessages(locale: Locale): Promise<TranslationTree> {
  const cached = runtimeCache.get(locale);
  if (cached) {
    return cached;
  }

  try {
    const messages = await localeLoaders[locale]();
    runtimeCache.set(locale, messages);
    return messages;
  } catch (error) {
    console.error(`Failed to load locale messages for ${locale}:`, error);
    if (locale !== DEFAULT_LOCALE) {
      return loadLocaleMessages(DEFAULT_LOCALE);
    }
    throw error;
  }
}

function resolveNestedValue(messages: TranslationTree, key: string): string | null {
  const segments = key.split('.');
  let current: TranslationValue | undefined = messages;

  for (const segment of segments) {
    if (!current || typeof current === 'string') {
      return null;
    }

    current = current[segment];
  }

  return typeof current === 'string' ? current : null;
}

function interpolate(template: string, params?: TranslationParams): string {
  if (!params) {
    return template;
  }

  return template.replace(/\{\{\s*(\w+)\s*\}\}|\{(\w+)\}/g, (match, doubleBracedKey, singleBracedKey) => {
    const paramKey = (doubleBracedKey || singleBracedKey) as string;
    const value = params[paramKey];
    return value === undefined || value === null ? match : String(value);
  });
}

type TranslationStore = {
  locale: Locale;
  intlLocale: string;
  messages: TranslationTree;
  cache: Partial<Record<Locale, TranslationTree>>;
  isReady: boolean;
  isLoading: boolean;
  error: string | null;
  initialize: () => Promise<void>;
  setLocale: (locale: Locale) => Promise<void>;
};

let initializePromise: Promise<void> | null = null;

const useTranslationStore = create<TranslationStore>((set, get) => ({
  locale: DEFAULT_LOCALE,
  intlLocale: INTL_LOCALE_MAP[DEFAULT_LOCALE],
  messages: enMessages as TranslationTree,
  cache: {
    en: enMessages as TranslationTree,
  },
  isReady: false,
  isLoading: false,
  error: null,

  initialize: async () => {
    if (get().isReady) {
      return;
    }

    if (initializePromise) {
      return initializePromise;
    }

    initializePromise = (async () => {
      const initialLocale = detectInitialLocale();
      set({
        locale: initialLocale,
        intlLocale: INTL_LOCALE_MAP[initialLocale],
        isLoading: true,
        error: null,
      });

      try {
        const messages = await loadLocaleMessages(initialLocale);
        persistLocale(initialLocale);

        set((state) => ({
          locale: initialLocale,
          intlLocale: INTL_LOCALE_MAP[initialLocale],
          messages,
          cache: {
            ...state.cache,
            [initialLocale]: messages,
          },
          isReady: true,
          isLoading: false,
          error: null,
        }));
      } catch (error) {
        console.error('Failed to initialize i18n:', error);

        const fallbackMessages = get().cache.en ?? (enMessages as TranslationTree);
        persistLocale(DEFAULT_LOCALE);

        set((state) => ({
          locale: DEFAULT_LOCALE,
          intlLocale: INTL_LOCALE_MAP[DEFAULT_LOCALE],
          messages: fallbackMessages,
          cache: {
            ...state.cache,
            en: fallbackMessages,
          },
          isReady: true,
          isLoading: false,
          error: 'Failed to initialize locale',
        }));
      }
    })().finally(() => {
      initializePromise = null;
    });

    return initializePromise;
  },

  setLocale: async (nextLocale: Locale) => {
    const currentLocale = get().locale;
    if (currentLocale === nextLocale && get().cache[nextLocale]) {
      persistLocale(nextLocale);
      return;
    }

    set({
      locale: nextLocale,
      intlLocale: INTL_LOCALE_MAP[nextLocale],
      isLoading: true,
      error: null,
    });

    persistLocale(nextLocale);

    try {
      const messages = await loadLocaleMessages(nextLocale);

      set((state) => ({
        locale: nextLocale,
        intlLocale: INTL_LOCALE_MAP[nextLocale],
        messages,
        cache: {
          ...state.cache,
          [nextLocale]: messages,
        },
        isReady: true,
        isLoading: false,
        error: null,
      }));
    } catch (error) {
      console.error(`Failed to switch locale to ${nextLocale}:`, error);

      const fallbackLocale = currentLocale;
      const fallbackMessages = get().cache[fallbackLocale] ?? (enMessages as TranslationTree);
      persistLocale(fallbackLocale);

      set((state) => ({
        locale: fallbackLocale,
        intlLocale: INTL_LOCALE_MAP[fallbackLocale],
        messages: fallbackMessages,
        cache: {
          ...state.cache,
          [fallbackLocale]: fallbackMessages,
        },
        isReady: true,
        isLoading: false,
        error: 'Failed to switch locale',
      }));
    }
  },
}));

export function useTranslation() {
  const locale = useTranslationStore((state) => state.locale);
  const intlLocale = useTranslationStore((state) => state.intlLocale);
  const messages = useTranslationStore((state) => state.messages);
  const isReady = useTranslationStore((state) => state.isReady);
  const isLoading = useTranslationStore((state) => state.isLoading);
  const error = useTranslationStore((state) => state.error);
  const initialize = useTranslationStore((state) => state.initialize);
  const setLocale = useTranslationStore((state) => state.setLocale);

  useEffect(() => {
    void initialize();
  }, [initialize]);

  const t = useCallback((key: TranslationKey | string, params?: TranslationParams): string => {
    const message =
      resolveNestedValue(messages, key) ??
      resolveNestedValue(enMessages as TranslationTree, key) ??
      key;

    return interpolate(message, params);
  }, [messages]);

  const formatPrice = useCallback(
    (value: number, currency = 'EUR', options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(intlLocale, {
        style: 'currency',
        currency,
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
        ...options,
      }).format(value),
    [intlLocale]
  );

  const formatDate = useCallback(
    (value: Date | number | string, options?: Intl.DateTimeFormatOptions) => {
      const date = value instanceof Date ? value : new Date(value);
      if (Number.isNaN(date.getTime())) {
        return '';
      }

      return new Intl.DateTimeFormat(intlLocale, {
        day: '2-digit',
        month: 'long',
        year: 'numeric',
        ...options,
      }).format(date);
    },
    [intlLocale]
  );

  return {
    locale,
    intlLocale,
    isReady,
    isLoading,
    error,
    t,
    setLocale,
    formatPrice,
    formatDate,
  };
}
