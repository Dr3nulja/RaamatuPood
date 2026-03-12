'use client';

import { useCart } from '@/contexts/CartContext';
import Image from 'next/image';
import { useState } from 'react';

export default function CartDrawer() {
  const { items, removeItem, updateQuantity, getTotalPrice } = useCart();
  const [isOpen, setIsOpen] = useState(false);

  const totalPrice = getTotalPrice();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <>
      {/* Кнопка корзины в заголовке */}
      <button
        onClick={() => setIsOpen(true)}
        className="relative p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
      >
        <svg
          className="w-6 h-6"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        {totalItems > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
            {totalItems}
          </span>
        )}
      </button>

      {/* Оверлей */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer с корзиной */}
      <div
        className={`fixed right-0 top-0 h-full w-full sm:w-96 bg-white dark:bg-gray-900 shadow-2xl z-50 transition-transform duration-300 flex flex-col ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Заголовок */}
        <div className="bg-gradient-to-r from-amber-800 to-amber-900 dark:from-amber-900 dark:to-amber-950 text-white p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">Корзина</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Содержимое корзины */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-12 text-gray-500 dark:text-gray-400">
              <svg
                className="w-16 h-16 mx-auto mb-4 opacity-50"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-lg font-semibold">Корзина пуста</p>
              <p className="text-sm mt-2">Добавьте книги чтобы начать покупки</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.id}
                className="flex gap-4 p-4 bg-amber-50 dark:bg-gray-800 rounded-lg border border-amber-200 dark:border-amber-900"
              >
                {/* Обложка книги */}
                {item.cover_image && (
                  <div className="flex-shrink-0 w-20 h-28 rounded-lg overflow-hidden bg-amber-100 dark:bg-gray-700">
                    <img
                      src={item.cover_image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Информация о книге */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-2">
                      {item.title}
                    </h3>
                    {item.author && (
                      <p className="text-sm text-amber-700 dark:text-amber-400 mt-1">
                        {item.author}
                      </p>
                    )}
                    <p className="text-lg font-bold text-amber-800 dark:text-amber-500 mt-2">
                      €{typeof item.price === 'string' ? item.price : item.price.toFixed(2)}
                    </p>
                  </div>

                  {/* Управление количеством */}
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      className="w-8 h-8 rounded bg-amber-200 dark:bg-amber-900 hover:bg-amber-300 dark:hover:bg-amber-800 flex items-center justify-center text-amber-900 dark:text-amber-100 font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-semibold text-gray-900 dark:text-white">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      className="w-8 h-8 rounded bg-amber-200 dark:bg-amber-900 hover:bg-amber-300 dark:hover:bg-amber-800 flex items-center justify-center text-amber-900 dark:text-amber-100 font-bold transition-colors"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="ml-auto text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Итого и кнопка */}
        {items.length > 0 && (
          <div className="border-t border-amber-200 dark:border-amber-900 p-6 space-y-4 bg-amber-50 dark:bg-gray-800">
            <div className="flex justify-between items-center text-lg font-bold text-gray-900 dark:text-white">
              <span>Сумма:</span>
              <span className="text-2xl text-amber-800 dark:text-amber-500">
                €{totalPrice.toFixed(2)}
              </span>
            </div>
            <button className="w-full px-6 py-3 bg-gradient-to-r from-amber-800 to-amber-900 hover:from-amber-900 hover:to-amber-950 text-white font-bold rounded-lg transition-all duration-200 hover:shadow-lg">
              Оформить заказ
            </button>
            <button
              onClick={() => setIsOpen(false)}
              className="w-full px-6 py-3 border-2 border-amber-800 dark:border-amber-700 text-amber-800 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-gray-700 font-bold rounded-lg transition-colors"
            >
              Продолжить покупки
            </button>
          </div>
        )}
      </div>
    </>
  );
}
