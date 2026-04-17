import Link from "next/link";

const rules = [
	{
		title: "Срок возврата — 14 дней",
		text: "Вы можете оформить возврат в течение 14 календарных дней с момента получения заказа.",
	},
	{
		title: "Состояние товара",
		text: "Книга должна быть без следов использования, с сохранённым товарным видом и полной комплектацией.",
	},
	{
		title: "Как оформить",
		text: "Свяжитесь с нами любым удобным способом, и мы подскажем порядок возврата и дальнейшие шаги.",
	},
];

const steps = [
	"Напишите нам номер заказа и причину возврата.",
	"Получите подтверждение и инструкцию от менеджера.",
	"Передайте товар в пункт отправки или курьеру.",
	"После проверки книги мы оформим возврат средств или обмен.",
];

const exceptions = [
	"Книги с автографом или персональной подписью автора.",
	"Товары с индивидуальной упаковкой, повреждённой после получения.",
	"Цифровые товары и подарочные сертификаты после активации.",
];

export default function ReturnsPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12 text-zinc-900 md:px-6">
			<div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
				<section className="rounded-3xl border border-amber-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
					<p className="inline-flex rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-secondary">
						Возвраты и обмен
					</p>
					<h1 className="mt-4 font-serif text-3xl font-bold text-secondary md:text-5xl">Простые и прозрачные правила</h1>
					<p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-700 md:text-lg">
						Мы ценим ваше доверие. Если книга не подошла, поможем быстро оформить возврат или обмен без лишней бюрократии.
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
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Пошаговая инструкция</h2>
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
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Что не подлежит возврату</h2>
					<ul className="mt-4 space-y-3">
						{exceptions.map((item) => (
							<li key={item} className="rounded-xl bg-background-muted px-4 py-3 text-sm text-zinc-700">
								{item}
							</li>
						))}
					</ul>
				</section>

				<section className="rounded-3xl border border-amber-200 bg-white p-6 shadow-sm md:p-8">
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Контакты для возврата</h2>
					<p className="mt-3 text-zinc-700">Email: infobook@raamatu.com</p>
					<p className="text-zinc-700">Телефон: +372 53425673</p>
					<p className="text-zinc-700">Время ответа: ежедневно, 09:00–20:00</p>
					<Link
						href="/contacts"
						className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						Написать нам
					</Link>
				</section>

				<section className="rounded-2xl border border-amber-100 bg-white px-5 py-4 text-sm text-zinc-700 shadow-sm">
					Нужны дополнительные детали? Загляните в
					<Link
						href="/faq"
						className="ml-1 font-semibold text-secondary underline-offset-4 transition hover:text-secondary-soft hover:underline focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						FAQ
					</Link>
					или перейдите в
					<Link
						href="/catalog"
						className="ml-1 font-semibold text-secondary underline-offset-4 transition hover:text-secondary-soft hover:underline focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						каталог
					</Link>
					.
				</section>
			</div>
		</main>
	);
}
