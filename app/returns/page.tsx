"use client";

import Link from "next/link";
import { useTranslation } from "@/hooks/useTranslation";

export default function ReturnsPage() {
	const { t } = useTranslation();

	const rules = [
		{
			title: t("returns.rules.periodTitle"),
			text: t("returns.rules.periodText"),
		},
		{
			title: t("returns.rules.conditionTitle"),
			text: t("returns.rules.conditionText"),
		},
		{
			title: t("returns.rules.requestTitle"),
			text: t("returns.rules.requestText"),
		},
	];

	const steps = [
		t("returns.steps.step1"),
		t("returns.steps.step2"),
		t("returns.steps.step3"),
		t("returns.steps.step4"),
	];

	const exceptions = [
		t("returns.exceptions.item1"),
		t("returns.exceptions.item2"),
		t("returns.exceptions.item3"),
	];

	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12 text-zinc-900 md:px-6">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<section className="rounded-3xl border border-amber-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
					<p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-secondary">
						{t("returns.kicker")}
					</p>
					<h1 className="mt-4 font-serif text-3xl font-bold text-secondary md:text-5xl">{t("returns.heroTitle")}</h1>
					<p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-700 md:text-lg">
						{t("returns.heroDescription")}
					</p>
				</section>

				<section className="grid gap-4 md:grid-cols-3">
					{rules.map((rule) => (
						<article
							key={rule.title}
							className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
						>
							<h2 className="font-serif text-xl font-semibold text-secondary">{rule.title}</h2>
							<p className="mt-3 text-sm leading-relaxed text-zinc-700">{rule.text}</p>
						</article>
					))}
				</section>

				<section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm md:p-8">
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">{t("returns.guideTitle")}</h2>
					<ol className="mt-6 grid gap-4 md:grid-cols-2">
						{steps.map((step, index) => (
							<li
								key={step}
								className="flex items-start gap-3 rounded-2xl border border-amber-100 bg-background p-4 transition hover:bg-amber-50"
							>
								<span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-white">
									{index + 1}
								</span>
								<p className="text-sm leading-relaxed text-zinc-700">{step}</p>
							</li>
						))}
					</ol>
				</section>

				<section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm md:p-8">
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">{t("returns.exceptionsTitle")}</h2>
					<ul className="mt-4 space-y-3">
						{exceptions.map((item) => (
							<li key={item} className="rounded-xl bg-background-muted px-4 py-3 text-sm text-zinc-700">
								{item}
							</li>
						))}
					</ul>
				</section>

				<section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm md:p-8">
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">{t("returns.contactsTitle")}</h2>
					<p className="mt-3 text-zinc-700">Email: infobook@raamatu.com</p>
					<p className="text-zinc-700">{t("returns.phone")} +372 53425673</p>
					<p className="text-zinc-700">{t("returns.responseTime")}</p>
					<Link
						href="/contacts"
						className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						{t("returns.writeToUs")}
					</Link>
				</section>

				<section className="rounded-2xl border border-amber-100 bg-white px-5 py-4 text-sm text-zinc-700 shadow-sm">
					{t("returns.moreDetailsPrefix")}{" "}
					<Link
						href="/faq"
						className="ml-1 font-semibold text-secondary underline-offset-4 transition hover:text-secondary-soft hover:underline focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						{t("returns.faqLink")}
					</Link>
					{" "}{t("returns.moreDetailsMiddle")}{" "}
					<Link
						href="/catalog"
						className="ml-1 font-semibold text-secondary underline-offset-4 transition hover:text-secondary-soft hover:underline focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						{t("returns.catalogLink")}
					</Link>
					{t("returns.moreDetailsSuffix")}
				</section>
			</div>
		</main>
	);
}
