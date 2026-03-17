export default function AdminPanel() {
  const adminActions = [
    "Управление товарами",
    "Добавить новый товар",
    "Редактирование каталога",
    "Управление категориями",
    "Все заказы",
    "Изменение статусов заказа",
    "Возвраты и отмены",
    "Пользователи",
    "Отзывы и модерация",
    "Настройки магазина",
  ];

  return (
    <main className="min-h-[78vh] px-4 py-10 md:py-14">
      <div className="mx-auto w-full max-w-6xl">
        <section className="rounded-3xl bg-gradient-to-br from-bg-beige via-amber-100 to-orange-200 p-8 shadow-xl md:p-10">
          <h1 className="mb-3 text-3xl font-bold text-black md:text-5xl">Панель администратора</h1>
          <p className="max-w-3xl text-base text-zinc-800 md:text-lg">
            Управление магазином
          </p>

          <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {adminActions.map((action) => (
              <button
                key={action}
                type="button"
                className="group rounded-2xl border border-black/10 bg-white/95 px-5 py-4 text-left text-base font-semibold text-zinc-900 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:bg-white hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
              >
                <span className="block">{action}</span>
                <span className="mt-1 block text-xs font-medium text-zinc-500 transition group-hover:text-zinc-700">
                </span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}