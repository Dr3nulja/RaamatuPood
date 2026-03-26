export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-[#FDF8F0] px-4 py-10 text-zinc-900">
      <section className="mx-auto max-w-3xl rounded-2xl border border-amber-100 bg-white p-6 shadow-sm md:p-8">
        <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Политика конфиденциальности</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-700">
          Мы уважаем вашу конфиденциальность и используем персональные данные только для обработки заказов,
          улучшения сервиса и поддержки пользователей. Мы не передаём ваши данные третьим лицам без
          законных оснований.
        </p>
        <p className="mt-3 text-sm leading-7 text-zinc-700">
          Используя сайт, вы соглашаетесь с обработкой данных в соответствии с действующим законодательством.
          По вопросам удаления или изменения персональных данных свяжитесь с поддержкой.
        </p>
      </section>
    </main>
  );
}
