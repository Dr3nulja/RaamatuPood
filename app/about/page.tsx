export default function About() {
  return (
    <main className="flex justify-center items-center min-h-[70vh]">
      <div className="flex flex-col md:flex-row items-center gap-8 max-w-4xl mx-auto px-4">
        <section className="bg-bg-beige text-gray-900 rounded-2xl shadow-lg p-8 min-w-80 max-w-4xl flex flex-col justify-center">
          <h1 className="text-4xl font-bold mb-2 text-black">О нашем магазине</h1>
          <p className="text-lg text-black mb-5">
            Добро пожаловать в RaamatuPood! Мы — команда энтузиастов, которые любят книги и хотят делиться этим с вами.
          </p>
          <h2 className="text-xl font-semibold mb-3 text-black">Почему выбирают нас?</h2>
          <ul className="space-y-2 mb-5">
            <li className="text-base text-black relative pl-5 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-blue-900 before:opacity-20">
              Огромный выбор книг на любой вкус
            </li>
            <li className="text-base text-black relative pl-5 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-blue-900 before:opacity-20">
              Быстрая и надёжная доставка
            </li>
            <li className="text-base text-black relative pl-5 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-blue-900 before:opacity-20">
              Персональные рекомендации
            </li>
            <li className="text-base text-black relative pl-5 before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:rounded-full before:bg-blue-900 before:opacity-20">
              Подарочные сертификаты и акции
            </li>
          </ul>
          <h2 className="text-lg font-semibold mb-2 text-black">Наша миссия</h2>
          <p className="text-base text-black">
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