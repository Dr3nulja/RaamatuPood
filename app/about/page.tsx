export default function About() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-background px-4 py-10">
      <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto px-4">
        <section className="min-w-80 max-w-4xl rounded-2xl bg-surface-muted p-8 text-zinc-900 shadow-lg">
          <h1 className="mb-2 text-4xl font-bold text-secondary">О нашем магазине</h1>
          <p className="mb-5 text-lg text-zinc-800">
            Добро пожаловать в RaamatuPood! Мы — команда энтузиастов, которые любят книги и хотят делиться этим с вами.
          </p>
          <h2 className="mb-3 text-xl font-semibold text-secondary">Почему выбирают нас?</h2>
          <ul className="mb-5 space-y-2">
            <li className="relative pl-5 text-base text-zinc-800 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-secondary-soft before:opacity-70">
              Огромный выбор книг на любой вкус
            </li>
            <li className="relative pl-5 text-base text-zinc-800 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-secondary-soft before:opacity-70">
              Быстрая и надёжная доставка
            </li>
            <li className="relative pl-5 text-base text-zinc-800 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-secondary-soft before:opacity-70">
              Персональные рекомендации
            </li>
            <li className="relative pl-5 text-base text-zinc-800 before:absolute before:left-0 before:top-2 before:h-2 before:w-2 before:rounded-full before:bg-secondary-soft before:opacity-70">
              Подарочные сертификаты и акции
            </li>
          </ul>
          <h2 className="mb-2 text-lg font-semibold text-secondary">Наша миссия</h2>
          <p className="text-base text-zinc-800">
            Мы стремимся сделать чтение доступным и приятным для каждого. Спасибо, что выбираете нас!
          </p>
        </section>
        <div className="flex items-center justify-center">
          <img 
            src="https://www.mgpu.ru/wp-content/uploads/2018/01/books2.jpg" 
            alt="Books" 
            className="max-w-4xl w-full rounded-2xl shadow-xl"
          />
        </div>
      </div>
    </main>
  );
}