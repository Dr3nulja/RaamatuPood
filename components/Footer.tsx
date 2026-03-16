import Link from "next/link";
import React from "react";

const Footer: React.FC = () => (
  <footer id="contacts" className="bg-amber-900 dark:bg-amber-950 text-white border-t border-amber-800 flex-shrink-0">
    <div className="container mx-auto px-4 py-12">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
        <div>
          <h3 className="font-bold text-lg mb-4">RaamatuPood</h3>
          <p className="text-amber-100 text-sm">Ваш верный помощник в выборе книг</p>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Навигация</h4>
          <ul className="space-y-2 text-amber-100 text-sm">
            <li><Link href="/catalog" className="hover:text-white transition">Каталог</Link></li>
            <li><Link href="/about" className="hover:text-white transition">О нас</Link></li>
            <li><Link href="/contacts" className="hover:text-white transition">Контакты</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Информация</h4>
          <ul className="space-y-2 text-amber-100 text-sm">
            <li><Link href="/#" className="hover:text-white transition">Доставка</Link></li>
            <li><Link href="/#" className="hover:text-white transition">Возвраты</Link></li>
            <li><Link href="/#" className="hover:text-white transition">FAQ</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-4">Контакты</h4>

          <ul className="space-y-2 text-amber-100 text-sm">
            <li>Email: infobook@raamatu.com</li>
            <li>Тел: +372 53425673</li>
            <li>Режим: 24/7</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-amber-800 pt-8 flex justify-between items-center text-amber-100 text-sm">
        <p>&copy; 2026 RaamatuPood. Все права защищены.</p>
      </div>
    </div>
  </footer>
);

export default Footer;