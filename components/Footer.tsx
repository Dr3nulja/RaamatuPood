import Link from "next/link";
import React from "react";

const Footer: React.FC = () => (
  <footer id="contacts" className="flex-shrink-0 border-t border-secondary-hover bg-secondary text-white">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-lg mb-4">RaamatuPood</h3>
          <p className="text-amber-50 text-sm">Ваш верный помощник в выборе книг</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Навигация</h4>
          <ul className="space-y-2 text-amber-50 text-sm">
            <li><Link href="/" className="transition hover:text-primary-soft">Главная</Link></li>
            <li><Link href="/catalog" className="transition hover:text-primary-soft">Каталог</Link></li>
            <li><Link href="/account" className="transition hover:text-primary-soft">Моя библиотека</Link></li>
            <li><Link href="/contacts" className="transition hover:text-primary-soft">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Информация</h4>
          <ul className="space-y-2 text-amber-50 text-sm">
            <li><Link href="/about" className="transition hover:text-primary-soft">О нас</Link></li>
            <li><Link href="/privacy" className="transition hover:text-primary-soft">Политика конфиденциальности</Link></li>
            <li><Link href="/delivery" className="transition hover:text-primary-soft">Доставка</Link></li>
            <li><Link href="/returns" className="transition hover:text-primary-soft">Возвраты</Link></li>
            <li><Link href="/faq" className="transition hover:text-primary-soft">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Контакты и соцсети</h4>

          <ul className="space-y-2 text-amber-50 text-sm">
            <li>Email: infobook@raamatu.com</li>
            <li>Тел: +372 53425673</li>
            <li>Режим: 24/7</li>
            <li className="pt-2 flex gap-3">
              <a href="#" className="transition hover:text-primary-soft">Instagram</a>
              <a href="#" className="transition hover:text-primary-soft">Facebook</a>
              <a href="#" className="transition hover:text-primary-soft">X</a>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-secondary-hover pt-8 flex justify-between items-center text-amber-50 text-sm">
        <p>&copy; 2026 RaamatuPood. Все права защищены.</p>
      </div>
    </div>
  </footer>
);

export default Footer;