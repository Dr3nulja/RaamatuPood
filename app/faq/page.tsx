'use client';

import Link from "next/link";
import { useTranslation } from '@/hooks/useTranslation';

export default function FaqPage() {
	const { t } = useTranslation();

	const faqItems = [
		{ question: t('faqPage.items.item1Question'), answer: t('faqPage.items.item1Answer') },
		{ question: t('faqPage.items.item2Question'), answer: t('faqPage.items.item2Answer') },
		{ question: t('faqPage.items.item3Question'), answer: t('faqPage.items.item3Answer') },
		{ question: t('faqPage.items.item4Question'), answer: t('faqPage.items.item4Answer') },
		{ question: t('faqPage.items.item5Question'), answer: t('faqPage.items.item5Answer') },
		{ question: t('faqPage.items.item6Question'), answer: t('faqPage.items.item6Answer') },
		{ question: t('faqPage.items.item7Question'), answer: t('faqPage.items.item7Answer') },
		{ question: t('faqPage.items.item8Question'), answer: t('faqPage.items.item8Answer') },
		{ question: t('faqPage.items.item9Question'), answer: t('faqPage.items.item9Answer') },
		{ question: t('faqPage.items.item10Question'), answer: t('faqPage.items.item10Answer') },
		{ question: t('faqPage.items.item11Question'), answer: t('faqPage.items.item11Answer') },
	];

	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12 md:px-6">
			<div className="mx-auto w-full max-w-5xl">
				<section className="rounded-3xl border border-amber-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
					<h1 className="font-serif text-3xl font-bold text-secondary md:text-5xl">{t('faqPage.title')}</h1>
					<p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-700 md:text-lg">
						{t('faqPage.subtitle')}
					</p>
				</section>

				<section className="mt-8 space-y-3">
					{faqItems.map((item) => (
						<details
							key={item.question}
							className="group rounded-2xl border border-amber-100 bg-white px-5 py-4 shadow-sm transition-all duration-300 hover:shadow-md"
						>
							<summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-lg font-serif text-lg font-semibold text-secondary outline-none focus-visible:ring-2 focus-visible:ring-amber-300">
								<span>{item.question}</span>
								<span className="text-secondary-soft transition-transform duration-300 group-open:rotate-45">+</span>
							</summary>

							<div className="grid grid-rows-[0fr] transition-all duration-300 group-open:grid-rows-[1fr]">
								<div className="overflow-hidden">
									<p className="pt-3 text-sm leading-relaxed text-zinc-700 md:text-base">{item.answer}</p>
								</div>
							</div>
						</details>
					))}
				</section>

				<section className="mt-8 rounded-3xl border border-amber-200 bg-white px-6 py-7 shadow-sm md:px-8 md:py-9">
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">{t('faqPage.ctaTitle')}</h2>
					<p className="mt-2 text-zinc-700">{t('faqPage.ctaDescription')}</p>
					<Link
						href="/contacts"
						className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						{t('faqPage.writeToUs')}
					</Link>
				</section>
			</div>
		</main>
	);
}
