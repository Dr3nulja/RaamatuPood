import Link from 'next/link';

const collectedData = [
  'Контактные данные: имя, email, номер телефона (если вы его указали).',
  'Данные заказа: книги в заказе, адрес доставки, способ оплаты, статус заказа.',
  'Данные аккаунта: история заказов, избранное, отзывы и настройки профиля.',
  'Технические данные: IP-адрес, тип устройства, данные браузера, cookie и действия на сайте.',
];

const usageReasons = [
  'Оформление, подтверждение и доставка заказов.',
  'Поддержка пользователей и ответы на обращения.',
  'Персонализация каталога и рекомендации книг.',
  'Предотвращение мошенничества, защита аккаунтов и стабильность сайта.',
  'Выполнение юридических и бухгалтерских обязательств.',
];

const userRights = [
  'Получить копию данных, которые мы храним о вас.',
  'Исправить неточные или устаревшие данные.',
  'Удалить аккаунт и связанные данные, если нет обязательств по хранению.',
  'Ограничить или оспорить обработку данных в отдельных случаях.',
  'Отозвать согласие на маркетинговые рассылки в любой момент.',
];

export default function PrivacyPage() {
  return (
    <main className="ui-page">
      <section className="relative overflow-hidden border-b border-amber-100 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-700">
        <div className="absolute -left-20 -top-20 h-64 w-64 rounded-full bg-amber-200/20 blur-3xl" />
        <div className="absolute -bottom-16 right-0 h-72 w-72 rounded-full bg-yellow-200/20 blur-3xl" />

        <div className="ui-container relative px-4 py-12 md:py-16">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-100">Privacy Policy</p>
          <h1 className="mt-3 max-w-4xl text-4xl font-bold leading-tight !text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.3)] md:text-5xl">
            Политика конфиденциальности RaamatuPood
          </h1>
          <p className="mt-5 max-w-3xl text-base text-amber-50 md:text-lg">
            Мы бережно относимся к вашим данным и объясняем простым языком, что именно собираем, зачем это нужно и какие у вас есть права.
          </p>
          <p className="mt-3 text-sm font-medium text-amber-100">Последнее обновление: 1 апреля 2023</p>
        </div>
      </section>

      <section className="ui-container px-4 py-8 md:py-12">
        <div className="ui-card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-secondary md:text-3xl">1. Введение</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">
            Эта политика описывает, как RaamatuPood собирает и использует персональные данные при работе с сайтом,
            аккаунтом и заказами. Мы следуем принципам законности, прозрачности, минимизации данных и безопасности,
            которые применяются в современных стандартах защиты данных, включая базовые принципы GDPR.
          </p>
          <p className="mt-3 text-base leading-relaxed text-zinc-700">
            Используя сайт, вы подтверждаете, что ознакомились с этой политикой. Для некоторых действий
            (например, маркетинговых рассылок) мы запрашиваем отдельное согласие, которое можно отозвать.
          </p>
        </div>
      </section>

      <section className="bg-surface-muted/70 py-8 md:py-12">
        <div className="ui-container grid gap-6 px-4 lg:grid-cols-2">
          <article className="ui-panel p-6 md:p-7">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">2. Какие данные мы собираем</h2>
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
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">3. Как мы используем данные</h2>
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
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">4. Защита и хранение данных</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              Мы применяем технические и организационные меры: контроль доступа, защищенные соединения,
              мониторинг подозрительной активности и ограничение доступа сотрудников к персональным данным.
            </p>
            <p className="mt-3 text-base leading-relaxed text-zinc-700">
              Данные хранятся только столько, сколько нужно для выполнения заказа, поддержки аккаунта,
              соблюдения закона и решения спорных ситуаций. После истечения срока данные удаляются или обезличиваются.
            </p>
          </article>

          <article className="ui-card p-6 md:p-8">
            <h2 className="text-2xl font-bold text-secondary md:text-3xl">5. Передача третьим лицам</h2>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              Мы не продаем персональные данные. Передача возможна только в необходимых случаях:
            </p>
            <ul className="mt-4 space-y-3">
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                Платежным и логистическим партнерам для обработки оплаты и доставки.
              </li>
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                ИТ-провайдерам, которые обеспечивают работу сайта и поддержку инфраструктуры.
              </li>
              <li className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                Государственным органам, если это требуется по закону.
              </li>
            </ul>
            <p className="mt-4 text-base leading-relaxed text-zinc-700">
              Во всех случаях мы требуем от партнеров соблюдения конфиденциальности и защиты данных.
            </p>
          </article>
        </div>
      </section>

      <section className="ui-container px-4 pb-12 md:pb-16">
        <div className="ui-card p-6 md:p-8">
          <h2 className="text-2xl font-bold text-secondary md:text-3xl">6. Ваши права и управление согласием</h2>
          <ul className="mt-5 space-y-3">
            {userRights.map((item) => (
              <li key={item} className="relative pl-6 text-sm leading-relaxed text-zinc-700 md:text-base">
                <span className="absolute left-0 top-2 h-2.5 w-2.5 rounded-full bg-primary" />
                {item}
              </li>
            ))}
          </ul>
          <p className="mt-5 text-base leading-relaxed text-zinc-700">
            Чтобы реализовать права, напишите нам через страницу контактов. Мы отвечаем на запросы в разумные сроки
            и можем попросить подтверждение личности, чтобы защитить ваш аккаунт от несанкционированных действий.
          </p>

          <h2 className="mt-8 text-2xl font-bold text-secondary md:text-3xl">7. Контакты</h2>
          <p className="mt-4 text-base leading-relaxed text-zinc-700">
            Если у вас есть вопросы о приватности, обработке данных или этой политике, свяжитесь с нами:
          </p>
          <div className="mt-4 flex flex-wrap gap-3">
            <Link
              href="/contacts"
              className="inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              Страница контактов
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
