import Link from "next/link";

const faqItems = [
	{
		question: "How fast will my order arrive?",
		answer:
			"In Estonia, orders usually arrive within 1–3 business days. For Baltic countries it is typically 2–5 days, and for other EU countries delivery can take longer.",
	},
	{
		question: "Can I pay on delivery?",
		answer:
			"Yes, cash on delivery is available for some shipping methods. Availability depends on the selected carrier and region.",
	},
	{
		question: "What if my book is damaged?",
		answer:
			"Contact us within 48 hours after delivery and attach photos. We will offer a replacement or a refund.",
	},
	{
		question: "How can I cancel an order?",
		answer:
			"If your order has not shipped yet, support can cancel it immediately. If it has already shipped, we will help you arrange a return after delivery.",
	},
	{
		question: "Do you ship internationally?",
		answer:
			"Yes, we ship across the Baltics, Finland, and other EU countries. Cost and delivery time depend on destination.",
	},
	{
		question: "How do I register on the site?",
		answer:
			"Click the sign in / sign up button and enter your email and password. After confirming your email, checkout becomes faster.",
	},
	{
		question: "Can I return a book?",
		answer:
			"Yes, returns are possible within 14 days if the item remains in resale condition. Full details are on the returns page.",
	},
	{
		question: "How do I track my package?",
		answer:
			"After shipment, you will receive an email with a tracking number and link. If the email did not arrive, contact us and we will help.",
	},
	{
		question: "Can I change the delivery address after ordering?",
		answer:
			"Yes, if the order has not yet been handed to the carrier. Contact support as soon as possible and we will update it.",
	},
	{
		question: "Do loyal customers get discounts?",
		answer:
			"Yes, we regularly run promotions and special offers. Follow updates on the homepage and in our newsletter.",
	},
	{
		question: "How quickly does support respond?",
		answer:
			"We usually respond within 1–3 hours during working time. During high load periods it may take a bit longer.",
	},
];

export default function FaqPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12 md:px-6">
			<div className="mx-auto w-full max-w-5xl">
				<section className="rounded-3xl border border-amber-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
					<h1 className="font-serif text-3xl font-bold text-secondary md:text-5xl">Frequently asked questions</h1>
					<p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-700 md:text-lg">
						Here are the most common questions about orders, delivery, payments, and returns. Did not find your answer? Contact us.
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
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Still have questions?</h2>
					<p className="mt-2 text-zinc-700">Our team will gladly help and suggest the best solution.</p>
					<Link
						href="/contacts"
						className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						Write to us
					</Link>
				</section>
			</div>
		</main>
	);
}
