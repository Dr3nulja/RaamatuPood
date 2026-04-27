'use client';

import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';

export default function PrivacyPage() {
  const { t } = useTranslation();

  const collectedData = [
    t('privacy.collectedData.item1'),
    t('privacy.collectedData.item2'),
    t('privacy.collectedData.item3'),
    t('privacy.collectedData.item4'),
  ];

  const usageReasons = [
    t('privacy.usageReasons.item1'),
    t('privacy.usageReasons.item2'),
    t('privacy.usageReasons.item3'),
    t('privacy.usageReasons.item4'),
    t('privacy.usageReasons.item5'),
  ];

  const userRights = [
    t('privacy.userRights.item1'),
    t('privacy.userRights.item2'),
    t('privacy.userRights.item3'),
    t('privacy.userRights.item4'),
    t('privacy.userRights.item5'),
  ];

  return (
    <main className="ui-page">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="ui-container relative px-4 py-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">{t('privacy.heroKicker')}</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] md:text-5xl">
            {t('privacy.heroTitle')}
          </h1>
          <p className="mt-5 max-w-3xl text-base text-amber-50 md:text-lg">
            {t('privacy.heroDescription')}
          </p>
          <p className="mt-3 text-sm font-medium text-amber-100">{t('privacy.lastUpdated')}</p>
        </div>
      </section>

      <section className="ui-container px-4 py-8 md:py-12">
        <div className="ui-card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-secondary md:text-3xl">{t('privacy.introductionTitle')}</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">
            {t('privacy.introductionParagraph1')}
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-700">
            {t('privacy.introductionParagraph2')}
          </p>
        </div>
      </section>

      <section className="bg-surface-muted/70 py-8 md:py-12">
        <div className="ui-container grid gap-6 px-4 lg:grid-cols-2">
          <article className="ui-panel p-6 md:p-7">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">{t('privacy.dataCollectedTitle')}</h2>
            <ul className="mt-5 space-y-3">
              {collectedData.map((item) => (
                <li key={item} className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                  <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </article>

          <article className="ui-panel p-6 md:p-7">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">{t('privacy.usageTitle')}</h2>
            <ul className="mt-5 space-y-3">
              {usageReasons.map((item) => (
                <li key={item} className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                  <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>
      </section>

      <section className="ui-container px-4 py-8 md:py-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <article className="ui-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">{t('privacy.protectionTitle')}</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              {t('privacy.protectionParagraph1')}
            </p>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              {t('privacy.protectionParagraph2')}
            </p>
          </article>

          <article className="ui-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">{t('privacy.sharingTitle')}</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              {t('privacy.sharingIntro')}
            </p>
            <ul className="mt-4 space-y-3">
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                {t('privacy.sharingItem1')}
              </li>
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                {t('privacy.sharingItem2')}
              </li>
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                {t('privacy.sharingItem3')}
              </li>
            </ul>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              {t('privacy.sharingOutro')}
            </p>
          </article>
        </div>
      </section>

      <section className="ui-container px-4 pb-12 md:pb-16">
        <div className="ui-card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-secondary md:text-3xl">{t('privacy.rightsTitle')}</h2>
          <ul className="mt-5 space-y-3">
            {userRights.map((item) => (
              <li key={item} className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            {t('privacy.rightsDescription')}
          </p>

          <h2 className="mt-8 text-2xl font-bold text-secondary md:text-3xl">{t('privacy.contactsTitle')}</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">
            {t('privacy.contactsDescription')}
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/contacts"
              className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t('privacy.contactsPage')}
            </Link>
            <a
              href="mailto:privacy@raamatupood.example"
              className="inline-flex items-center rounded-xl border border-amber-200 bg-white px-5 py-2.5 text-sm font-semibold text-secondary transition hover:bg-amber-50"
            >
              privacy@raamatupood.example
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
