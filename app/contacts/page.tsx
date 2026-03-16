export default function Contacts() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-amber-50 via-white to-amber-50 py-16 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Заголовок */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-amber-900 mb-4">Контакты</h1>
          <p className="text-lg text-amber-700 max-w-2xl mx-auto">
            Свяжитесь с нами — мы всегда готовы помочь вам найти идеальную книгу
          </p>
        </div>
        
        {/* Карточки с информацией */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {/* О компании */}
          <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-amber-100 hover:scale-105 flex flex-col items-center text-center">
            
            <h2 className="text-2xl font-bold mb-4 text-amber-900">RaamatuPood</h2>
            <p className="text-amber-700 text-base leading-relaxed">
              Ваш верный помощник в выборе книг. Мы предлагаем огромный выбор литературы для всех возрастов и интересов.
            </p>
          </div>

          {/* Контакты */}
          <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-amber-100 hover:scale-105 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-6 text-amber-900">Контакты</h2>
            <ul className="space-y-5 w-full text-left">
              <li className="flex items-start gap-3">
                <div>
                  <p className="font-semibold text-amber-900 text-sm uppercase tracking-wide">Email</p>
                  <p className="text-amber-700 text-base hover:text-amber-900 transition-colors">infobook@raamatu.com</p>
                </div>
              </li>
              <li className="flex items-start gap-3"> 
                <div>
                  <p className="font-semibold text-amber-900 text-sm uppercase tracking-wide">Телефон</p>
                  <p className="text-amber-700 text-base hover:text-amber-900 transition-colors">+372 53425673</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <div>
                  <p className="font-semibold text-amber-900 text-sm uppercase tracking-wide">Режим работы</p>
                  <p className="text-amber-700 text-base">24/7</p>
                </div>
              </li>
            </ul>
          </div>

          {/* Адрес */}
          <div className="group bg-white rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300 p-8 border border-amber-100 hover:scale-105 flex flex-col items-center text-center">
            <h2 className="text-2xl font-bold mb-4 text-amber-900">Адрес</h2>
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200 w-full text-center">
              <p className="text-amber-900 font-semibold text-lg">Rohuaia tn 67</p>
              <p className="text-amber-700 text-sm mt-2">Jõhvi, 41533</p>
              <p className="text-amber-700 text-sm">Ida-Viru maakond, Эстония</p>
            </div>
          </div>
        </div>

        {/* Google Maps */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden border border-amber-100 p-2">
          <div className="mb-6 px-8 pt-8">
            <h2 className="text-3xl font-bold text-amber-900 mb-2">Наше местоположение</h2>
            <p className="text-amber-700">Найдите нас на карте и посетите наш магазин</p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-inner border border-amber-100 mx-8 mb-8">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d184.9884995179597!2d27.393560111662485!3d59.36091456438828!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x469465605dd01af3%3A0xef1cb4f518b677e!2sRohuaia%20tn%2067%2C%20J%C3%B5hvi%2C%2041533%20Ida-Viru%20maakond!5e0!3m2!1sru!2see!4v1773660938972!5m2!1sru!2see"
              width="100%"
              height="450"
              style={{ border: 0 }}
              allowFullScreen={true}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="w-full"
            ></iframe>
          </div>
        </div>
      </div>
    </main>
  );
}