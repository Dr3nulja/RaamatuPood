'use client';

import Link from "next/link";
import { useTranslation } from '@/hooks/useTranslation';

export default function DeliveryPage() {
  const { t } = useTranslation();

  const methods = [
    {
      title: "Omniva",
      description: t('delivery.methods.omnivaDescription'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M3 7.5 12 3l9 4.5v9L12 21l-9-4.5v-9Z" />
          <path d="M3 7.5 12 12l9-4.5" />
        </svg>
      ),
    },
    {
      title: "Itella",
      description: t('delivery.methods.itellaDescription'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 12h16" />
          <path d="M4 12 8 8" />
          <path d="M4 12 8 16" />
          <circle cx="17" cy="16" r="2" />
        </svg>
      ),
    },
    {
      title: t('delivery.methods.courierTitle'),
      description: t('delivery.methods.courierDescription'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <rect x="2.5" y="7" width="12" height="8" rx="1.5" />
          <path d="M14.5 9h4l3 3v3h-2" />
          <circle cx="7" cy="17" r="2" />
          <circle cx="17" cy="17" r="2" />
        </svg>
      ),
    },
    {
      title: t('delivery.methods.pickupTitle'),
      description: t('delivery.methods.pickupDescription'),
      icon: (
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8">
          <path d="M4 10.5 12 4l8 6.5V20H4v-9.5Z" />
          <path d="M9.5 20v-5h5v5" />
        </svg>
      ),
    },
  ];

  const regions = [
    { region: t('delivery.regions.estoniaRegion'), price: t('delivery.regions.estoniaPrice'), time: t('delivery.regions.estoniaTime'), details: t('delivery.regions.estoniaDetails') },
    { region: t('delivery.regions.latviaRegion'), price: t('delivery.regions.latviaPrice'), time: t('delivery.regions.latviaTime'), details: t('delivery.regions.latviaDetails') },
    { region: t('delivery.regions.lithuaniaRegion'), price: t('delivery.regions.lithuaniaPrice'), time: t('delivery.regions.lithuaniaTime'), details: t('delivery.regions.lithuaniaDetails') },
    { region: t('delivery.regions.finlandRegion'), price: t('delivery.regions.finlandPrice'), time: t('delivery.regions.finlandTime'), details: t('delivery.regions.finlandDetails') },
    { region: t('delivery.regions.euRegion'), price: t('delivery.regions.euPrice'), time: t('delivery.regions.euTime'), details: t('delivery.regions.euDetails') },
  ];

  const faq = [
    {
      q: t('delivery.faq.item1Question'),
      a: t('delivery.faq.item1Answer'),
    },
    {
      q: t('delivery.faq.item2Question'),
      a: t('delivery.faq.item2Answer'),
    },
    {
      q: t('delivery.faq.item3Question'),
      a: t('delivery.faq.item3Answer'),
    },
  ];

  return (
    <main className="min-h-screen bg-background text-zinc-900 font-sans">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-br from-background via-background-muted to-background">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 py-14 md:grid-cols-2 md:py-20 lg:px-6">
          <div>
            <p className="mb-3 inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-secondary">
              {t('delivery.heroKicker')}
            </p>
            <h1 className="font-serif text-3xl font-bold leading-tight text-secondary md:text-5xl">
              {t('delivery.heroTitle')}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-zinc-700 md:text-lg">
              {t('delivery.heroDescription')}
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href="/catalog"
                className="rounded-xl bg-amber-950 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-900 hover:shadow-md"
              >
                {t('delivery.browseCatalog')}
              </Link>
              <Link
                href="/contacts"
                className="rounded-xl border border-secondary bg-secondary px-5 py-3 text-sm font-semibold text-white transition hover:bg-secondary-hover"
              >
                {t('delivery.askQuestion')}
              </Link>
            </div>
          </div>

          <div className="rounded-3xl border border-amber-100 bg-white p-4 shadow-lg">
            <img
              src="https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?auto=format&fit=crop&w=1400&q=80"
              alt={t('delivery.heroImageAlt')}
              className="h-64 w-full rounded-2xl object-cover md:h-80"
            />
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-12 lg:px-6">
        <h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">{t('delivery.methodsTitle')}</h2>
        <p className="mt-2 text-zinc-700">{t('delivery.methodsDescription')}</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {methods.map((item) => (
            <article
              key={item.title}
              className="group rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-xl bg-amber-100 p-2 text-primary transition group-hover:bg-amber-200">
                {item.icon}
              </div>
              <h3 className="font-serif text-xl font-semibold text-secondary">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 lg:px-6">
        <h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">{t('delivery.pricingTitle')}</h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-amber-100 bg-white shadow-sm">
          <div className="hidden grid-cols-4 bg-background-muted px-5 py-3 text-sm font-semibold text-secondary md:grid">
            <div>{t('delivery.tableRegion')}</div>
            <div>{t('delivery.tablePrice')}</div>
            <div>{t('delivery.tableTiming')}</div>
            <div>{t('delivery.tableFormat')}</div>
          </div>
          <div className="divide-y divide-amber-100">
            {regions.map((row) => (
              <div key={row.region} className="grid gap-1 px-5 py-4 md:grid-cols-4 md:gap-4">
                <p className="font-semibold text-zinc-900">{row.region}</p>
                <p className="text-zinc-700">{row.price}</p>
                <p className="text-zinc-700">{row.time}</p>
                <p className="text-zinc-700">{row.details}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 lg:px-6">
        <h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">{t('delivery.goodToKnowTitle')}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {faq.map((item) => (
            <article key={item.q} className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:shadow-md">
              <h3 className="font-serif text-lg font-semibold text-secondary">{item.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-700">{item.a}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 lg:px-6">
        <div className="rounded-3xl border border-amber-900/60 bg-secondary-soft p-7 text-white shadow-lg md:p-10">
          <h2 className="font-serif text-2xl font-bold text-white drop-shadow-[0_1px_4px_rgba(0,0,0,0.35)] md:text-3xl">
            {t('delivery.ctaTitle')}
          </h2>
          <p className="mt-2 max-w-2xl text-white/95">
            {t('delivery.ctaDescription')}
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-amber-950 transition hover:bg-amber-100"
            >
              {t('delivery.browseCatalog')}
            </Link>
            <Link
              href="/contacts"
              className="rounded-xl border border-white bg-transparent px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
            >
              {t('delivery.askQuestion')}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
