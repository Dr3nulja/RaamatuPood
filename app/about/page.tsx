'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function About() {
  const { t } = useTranslation();

  const whyChooseUs = [
    {
      title: t('about.whyChooseUs.item1Title'),
      description: t('about.whyChooseUs.item1Description'),
    },
    {
      title: t('about.whyChooseUs.item2Title'),
      description: t('about.whyChooseUs.item2Description'),
    },
    {
      title: t('about.whyChooseUs.item3Title'),
      description: t('about.whyChooseUs.item3Description'),
    },
    {
      title: t('about.whyChooseUs.item4Title'),
      description: t('about.whyChooseUs.item4Description'),
    },
  ];

  const values = [
    t('about.values.item1'),
    t('about.values.item2'),
    t('about.values.item3'),
  ];

  return (
    <main className="ui-page">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700">
        <div className="absolute -left-16 top-0 h-56 w-56 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-20 right-0 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="ui-container relative px-4 py-14 md:py-20">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">{t('about.heroKicker')}</p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] md:text-6xl">
            {t('about.heroTitle')}
          </h1>
          <p className="mt-6 max-w-2xl text-base text-amber-50 md:text-lg">
            {t('about.heroDescription')}
          </p>
        </div>
      </section>

      <section className="ui-container px-4 py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <article className="ui-card p-6 md:p-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('about.whoWeAreKicker')}</p>
            <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">{t('about.whoWeAreTitle')}</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700 md:text-lg">
              {t('about.whoWeAreParagraph1')}
            </p>
            <p className="mt-4 text-base leading-relaxed text-zinc-700 md:text-lg">
              {t('about.whoWeAreParagraph2')}
            </p>
          </article>

          <aside className="ui-card overflow-hidden p-3 md:p-4">
            <img
              src="https://images.unsplash.com/photo-1512820790803-83ca734da794?auto=format&fit=crop&w=1200&q=80"
              alt={t('about.heroImageAlt')}
              className="h-64 w-full rounded-xl object-cover md:h-full"
            />
          </aside>
        </div>
      </section>

      <section className="bg-surface-muted/75 py-10 md:py-14">
        <div className="ui-container px-4">
          <div className="mb-8">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('about.whyChooseUsKicker')}</p>
            <h2 className="mt-2 text-3xl font-bold text-secondary md:text-4xl">{t('about.whyChooseUsTitle')}</h2>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {whyChooseUs.map((item) => (
              <article key={item.title} className="ui-panel p-5 md:p-6">
                <h3 className="text-lg font-semibold text-zinc-900">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-700 md:text-base">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="ui-container px-4 py-10 md:py-14">
        <div className="ui-card p-6 md:p-8">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('about.missionKicker')}</p>
          <h2 className="mt-3 text-3xl font-bold text-secondary md:text-4xl">{t('about.missionTitle')}</h2>

          <ul className="mt-6 space-y-4">
            {values.map((value) => (
              <li
                key={value}
                className="relative rounded-xl border border-amber-100 bg-amber-50/45 px-4 py-3 pl-11 text-base leading-relaxed text-zinc-800"
              >
                <span className="absolute left-4 top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full bg-primary" />
                {value}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t('about.browseCatalog')}
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-6 py-3 text-sm font-semibold text-secondary transition hover:bg-amber-50"
            >
              {t('about.contactUs')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}