import Link from "next/link";

const faqItems = [
	{
		question: "Как быстро придёт заказ?",
		answer:
			"По Эстонии заказ обычно приходит за 1–3 рабочих дня. Для стран Балтии — 2–5 дней, для других стран ЕС сроки могут быть больше.",
	},
	{
		question: "Можно ли оплатить при получении?",
		answer:
			"Да, в некоторых способах доставки доступна оплата при получении. Точная опция зависит от выбранного перевозчика и региона.",
	},
	{
		question: "Что делать, если книга повреждена?",
		answer:
			"Свяжитесь с нами в течение 48 часов после получения заказа и приложите фото. Мы предложим замену или возврат средств.",
	},
	{
		question: "Как отменить заказ?",
		answer:
			"Если заказ ещё не отправлен, отмена возможна сразу через поддержку. Если уже отправлен — поможем оформить возврат после получения.",
	},
	{
		question: "Есть ли доставка за границу?",
		answer:
			"Да, мы доставляем по странам Балтии, в Финляндию и другие страны ЕС. Стоимость и сроки зависят от страны назначения.",
	},
	{
		question: "Как зарегистрироваться на сайте?",
		answer:
			"Нажмите кнопку входа/регистрации, укажите e-mail и пароль. После подтверждения почты вы сможете оформлять заказы быстрее.",
	},
	{
		question: "Можно ли вернуть книгу?",
		answer:
			"Да, возврат возможен в течение 14 дней при сохранении товарного вида. Подробные условия указаны на странице возвратов.",
	},
	{
		question: "Как отследить посылку?",
		answer:
			"После отправки вы получите письмо с трек-номером и ссылкой на отслеживание. Если письма нет, напишите нам — поможем.",
	},
	{
		question: "Можно ли изменить адрес доставки после заказа?",
		answer:
			"Да, если заказ ещё не передан службе доставки. Обратитесь в поддержку как можно раньше, и мы внесём изменения.",
	},
	{
		question: "Есть ли скидки для постоянных клиентов?",
		answer:
			"Да, мы регулярно запускаем акции и специальные предложения. Следите за обновлениями на главной странице и в рассылке.",
	},
	{
		question: "Как быстро отвечает поддержка?",
		answer:
			"Обычно мы отвечаем в течение 1–3 часов в рабочее время. В периоды высокой нагрузки ответ может занять немного больше времени.",
	},
];

export default function FaqPage() {
	return (
		<main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12 md:px-6">
			<div className="mx-auto w-full max-w-5xl">
				<section className="rounded-3xl border border-amber-100 bg-white px-6 py-8 shadow-sm md:px-10 md:py-12">
					<h1 className="font-serif text-3xl font-bold text-secondary md:text-5xl">Часто задаваемые вопросы</h1>
					<p className="mt-4 max-w-3xl text-base leading-relaxed text-zinc-700 md:text-lg">
						Здесь собрали самые популярные вопросы о заказах, доставке, оплате и возвратах. Не нашли ответ? Напишите нам!
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
					<h2 className="font-serif text-2xl font-bold text-secondary md:text-3xl">Всё ещё есть вопросы?</h2>
					<p className="mt-2 text-zinc-700">Наша команда с радостью поможет и подскажет лучший вариант решения.</p>
					<Link
						href="/contacts"
						className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition-all duration-200 hover:bg-primary-hover focus:outline-none focus:ring-2 focus:ring-amber-300"
					>
						Написать нам
					</Link>
				</section>
			</div>
		</main>
	);
}
