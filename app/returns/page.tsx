import Link from "next/link";

const rules = [
	{
		title: "Return period — 14 days",
		text: "You can request a return within 14 calendar days from the date you received the order.",
	},
	{
		title: "Item condition",
		text: "The book must be unused, in resale condition, and include all original parts.",
	},
	{
		title: "How to request",
		text: "Contact us in any convenient way and we will guide you through the return process and next steps.",
	},
];

const steps = [
	"Send us your order number and return reason.",
	"Receive confirmation and instructions from support.",
	"Hand the item over at a drop-off point or to a courier.",
	"After inspection, we process a refund or exchange.",
];

const exceptions = [
	"Books with an autograph or personalized author signature.",
	"Items with custom packaging damaged after delivery.",
	"Digital goods and gift certificates after activation.",
];

export default function ReturnsPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12 text-zinc-900 md:px-6">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<section className="rounded-3xl border border-amber-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
					<p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-secondary">
						Returns and exchanges
					</p>
					<h1 className="mt-4 font-serif text-3xl font-bold text-secondary md:text-5xl">Simple and transparent rules</h1>
					<p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-700 md:text-lg">
						We value your trust. If a book is not right for you, we will help you arrange a return or exchange quickly and without hassle.
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
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Step-by-step guide</h2>
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
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Items not eligible for return</h2>
					<ul className="mt-4 space-y-3">
						{exceptions.map((item) => (
							<li key={item} className="rounded-xl bg-background-muted px-4 py-3 text-sm text-zinc-700">
								{item}
							</li>
						))}
					</ul>
				</section>

				<section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm md:p-8">
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Return contacts</h2>
					<p className="mt-3 text-zinc-700">Email: infobook@raamatu.com</p>
					<p className="text-zinc-700">Phone: +372 53425673</p>
					<p className="text-zinc-700">Response time: daily, 09:00-20:00</p>
					<Link
						href="/contacts"
						className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						Write to us
					</Link>
				</section>

				<section className="rounded-2xl border border-amber-100 bg-white px-5 py-4 text-sm text-zinc-700 shadow-sm">
					Need more details? Visit
					<Link
						href="/faq"
						className="ml-1 font-semibold text-secondary underline-offset-4 transition hover:text-secondary-soft hover:underline focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						FAQ
					</Link>
					or go to
					<Link
						href="/catalog"
						className="ml-1 font-semibold text-secondary underline-offset-4 transition hover:text-secondary-soft hover:underline focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						catalog
					</Link>
					.
				</section>
			</div>
		</main>
	);
}
