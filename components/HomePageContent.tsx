'use client';

import Link from 'next/link';
import HomeBookSearch from '@/components/HomeBookSearch';
import { useTranslation } from '@/hooks/useTranslation';

export type HomePageBook = {
  id: number;
  title: string;
  rating: number;
  coverImage: string | null;
  authors: string[];
};

type HomePageContentProps = {
  popularBooks: HomePageBook[];
  recommendedBooks: HomePageBook[];
};

function normalizeCover(url: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `/images/${url}`;
}

function BookGrid({ books }: { books: HomePageBook[] }) {
  const { t } = useTranslation();

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {books.map((book) => (
        <article
          key={book.id}
          className="overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm transition duration-300 hover:-translate-y-1 hover:scale-[1.01] hover:shadow-xl"
        >
          <div className="aspect-[3/4] overflow-hidden bg-amber-50">
            {normalizeCover(book.coverImage) ? (
              <img
                src={normalizeCover(book.coverImage) || ''}
                alt={book.title}
                className="h-full w-full object-cover transition duration-300 hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-sm text-amber-700">{t('home.noCover')}</div>
            )}
          </div>

          <div className="space-y-2 p-4">
            <h3 className="line-clamp-2 text-base font-semibold text-zinc-900">{book.title}</h3>
            <p className="text-sm text-zinc-600">{book.authors[0] || t('catalog.unknownAuthor')}</p>
            <p className="text-sm font-semibold text-amber-700">★ {Number(book.rating ?? 0).toFixed(1)}</p>
            <Link
              href={`/catalog/${book.id}`}
              className="inline-flex rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-900 transition hover:bg-amber-100"
            >
              {t('catalog.details')}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function HomePageContent({ popularBooks, recommendedBooks }: HomePageContentProps) {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-white to-background-muted text-zinc-900">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:py-16">
          <div>
            <h1 className="mt-4 text-4xl font-bold leading-tight !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.35)] md:text-6xl">
              {t('home.heroTitle')}
            </h1>
            <div className="mt-6 max-w-2xl rounded-2xl border border-white/35 bg-white/95 p-4 shadow-xl backdrop-blur md:p-5">
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-secondary">{t('home.searchTitle')}</p>
              <HomeBookSearch />
            </div>
            <p className="mt-5 max-w-xl text-base text-amber-50 md:text-lg">{t('home.heroDescription')}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-xl bg-white px-6 py-3 text-sm font-semibold text-amber-900 transition hover:bg-amber-100"
              >
                {t('home.browseCatalog')}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-100/30 bg-white/10 p-4 shadow-2xl backdrop-blur md:p-6">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
              alt={t('home.heroImageAlt')}
              className="h-72 w-full rounded-2xl object-cover md:h-96"
            />
          </div>
        </div>
      </section>

      <main className="mx-auto max-w-7xl space-y-16 px-4 py-8 md:py-12">
        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('home.topPicks')}</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900 md:text-4xl">{t('home.popularBooks')}</h2>
            </div>
            <Link href="/catalog" className="text-sm font-semibold text-amber-800 hover:text-amber-600">
              {t('home.viewAll')} →
            </Link>
          </div>

          <BookGrid books={popularBooks} />
        </section>

        <section>
          <div className="mb-8 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('home.newRecommendations')}</p>
              <h2 className="mt-2 text-3xl font-bold text-zinc-900 md:text-4xl">{t('home.recommendedReads')}</h2>
            </div>
            <Link href="/catalog" className="text-sm font-semibold text-amber-800 hover:text-amber-600">
              {t('home.toCatalog')} →
            </Link>
          </div>

          <BookGrid books={recommendedBooks} />
        </section>
      </main>
    </div>
  );
}
