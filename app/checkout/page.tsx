'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { createCheckoutSession } from '@/app/actions/checkout';

interface DeliveryOption {
  id: string;
  name: string;
  price: number;
  description: string;
}

const deliveryOptions: DeliveryOption[] = [
  { id: 'omniva', name: 'Omniva pakiautomaat', price: 3.99, description: 'Самовывоз из постамата' },
  { id: 'itella', name: 'Itella Smartpost', price: 4.49, description: 'Самовывоз из пункта выдачи' },
  { id: 'courier', name: 'Курьер по Таллину', price: 6.0, description: 'Доставка до двери' },
  { id: 'pickup', name: 'Самовывоз', price: 0, description: 'Забрать в нашем магазине' },
];

interface FormData {
  name: string;
  email: string;
  phone: string;
  street: string;
  houseNumber: string;
  postalCode: string;
  city: string;
  country: string;
  deliveryMethod: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function CheckoutPage() {
  const cart = useCartStore((state) => state.cart);
  const [isMounted, setIsMounted] = useState(() => useCartStore.persist.hasHydrated());
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  useEffect(() => {
    // ИСПРАВЛЕНО: синхронизируем mounted-статус через onFinishHydration
    const unsubHydrate = useCartStore.persist.onFinishHydration(() => {
      setIsMounted(true);
    });

    if (!useCartStore.persist.hasHydrated()) {
      void useCartStore.persist.rehydrate();
    }

    return () => {
      unsubHydrate();
    };
  }, []);

  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    phone: '',
    street: '',
    houseNumber: '',
    postalCode: '',
    city: 'Tallinn',
    country: 'EE',
    deliveryMethod: 'omniva',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [submitError, setSubmitError] = useState('');

  const queryError = useMemo(() => {
    const errorCode = searchParams.get('error');
    if (!errorCode) return '';

    const map: Record<string, string> = {
      missing_fields: 'Пожалуйста, заполните обязательные поля.',
      empty_cart: 'Корзина пуста.',
      checkout_failed: 'Ошибка при создании сессии оплаты. Попробуйте ещё раз.',
    };

    return map[errorCode] || 'Ошибка при оформлении заказа.';
  }, [searchParams]);

  const cartItemsPayload = useMemo(
    () =>
      cart.map((item) => ({
        id: item.id,
        title: item.title,
        price: typeof item.price === 'string' ? Number(item.price) : item.price,
        quantity: item.quantity,
        image: item.cover_image,
      })),
    [cart]
  );

  const selectedDelivery = deliveryOptions.find((d) => d.id === formData.deliveryMethod) || deliveryOptions[0];
  const subtotal = cart.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? Number(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const deliveryFee = selectedDelivery.price;
  const total = subtotal + deliveryFee;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Имя обязательно';
    if (!formData.email.trim()) newErrors.email = 'Email обязателен';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Некорректный email';
    if (!formData.street.trim()) newErrors.street = 'Улица обязательна';
    if (!formData.houseNumber.trim()) newErrors.houseNumber = 'Номер дома обязателен';
    if (!formData.postalCode.trim()) newErrors.postalCode = 'Почтовый индекс обязателен';
    if (!formData.city.trim()) newErrors.city = 'Город обязателен';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  const handleDeliveryChange = (id: string) => {
    setFormData((prev) => ({ ...prev, deliveryMethod: id }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!validateForm()) {
      setSubmitError('Пожалуйста, заполните все обязательные поля');
      return;
    }

    if (cartItemsPayload.length === 0) {
      setSubmitError('Корзина пуста');
      return;
    }

    const payload = new FormData();
    payload.set('name', formData.name);
    payload.set('email', formData.email);
    payload.set('phone', formData.phone);
    payload.set('address', `${formData.street} ${formData.houseNumber}, ${formData.postalCode} ${formData.city}, ${formData.country}`);
    payload.set('delivery', formData.deliveryMethod);
    // ИСПРАВЛЕНО: передача корзины в Server Action через hidden/serialized payload
    payload.set('cartItems', JSON.stringify(cartItemsPayload));

    setSubmitError('');
    startTransition(async () => {
      await createCheckoutSession(payload);
    });
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#FDF8F0] to-[#F5F0E8] px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#D97706]"></div>
          <p className="mt-4 text-zinc-700">Загрузка корзины...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-[#FDF8F0] to-[#F5F0E8] px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-amber-100 bg-white px-6 py-8 text-center shadow-sm md:px-8 md:py-10">
            <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Корзина пуста</h1>
            <p className="mt-3 text-zinc-700">Добавьте книги для оформления заказа</p>
            <Link
              href="/catalog"
              className="mt-5 inline-flex rounded-xl bg-[#D97706] px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-500"
            >
              Перейти в каталог
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-[#FDF8F0] to-[#F5F0E8] px-4 py-12">
      <div className="mx-auto flex max-w-6xl gap-6 lg:grid lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-3xl border border-amber-100 bg-white px-6 py-8 shadow-sm md:px-8">
            <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Оформление заказа</h1>
            <p className="mt-2 text-zinc-700">Шаг 1: Ваши данные и доставка</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-[#8B5E3C]">
                    Имя *
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-zinc-900 outline-none transition ${
                      errors.name ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-amber-50 focus:border-amber-400'
                    }`}
                    placeholder="Ваше имя"
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-[#8B5E3C]">
                    Email *
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`mt-1 w-full rounded-xl border px-3 py-2 text-zinc-900 outline-none transition ${
                      errors.email ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-amber-50 focus:border-amber-400'
                    }`}
                    placeholder="your@email.com"
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-[#8B5E3C]">
                  Телефон
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="mt-1 w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-zinc-900 outline-none transition focus:border-amber-400"
                  placeholder="+372 5xxxxxxxx"
                />
              </div>

              <div className="border-t border-amber-100 pt-4">
                <h2 className="font-serif text-lg font-semibold text-[#8B5E3C]">Адрес доставки</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="street" className="block text-sm font-semibold text-[#8B5E3C]">
                      Улица *
                    </label>
                    <input
                      id="street"
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className={`mt-1 w-full rounded-xl border px-3 py-2 text-zinc-900 outline-none transition ${
                        errors.street ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-amber-50 focus:border-amber-400'
                      }`}
                      placeholder="Улица"
                    />
                    {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street}</p>}
                  </div>
                  <div>
                    <label htmlFor="houseNumber" className="block text-sm font-semibold text-[#8B5E3C]">
                      Номер дома *
                    </label>
                    <input
                      id="houseNumber"
                      type="text"
                      name="houseNumber"
                      value={formData.houseNumber}
                      onChange={handleInputChange}
                      className={`mt-1 w-full rounded-xl border px-3 py-2 text-zinc-900 outline-none transition ${
                        errors.houseNumber ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-amber-50 focus:border-amber-400'
                      }`}
                      placeholder="10"
                    />
                    {errors.houseNumber && <p className="mt-1 text-xs text-red-600">{errors.houseNumber}</p>}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-semibold text-[#8B5E3C]">
                      Почтовый индекс *
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`mt-1 w-full rounded-xl border px-3 py-2 text-zinc-900 outline-none transition ${
                        errors.postalCode ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-amber-50 focus:border-amber-400'
                      }`}
                      placeholder="10001"
                    />
                    {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-[#8B5E3C]">
                      Город *
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`mt-1 w-full rounded-xl border px-3 py-2 text-zinc-900 outline-none transition ${
                        errors.city ? 'border-red-400 bg-red-50' : 'border-amber-200 bg-amber-50 focus:border-amber-400'
                      }`}
                      placeholder="Tallinn"
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-semibold text-[#8B5E3C]">
                      Страна
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="mt-1 w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-zinc-900 outline-none transition focus:border-amber-400"
                    >
                      <option value="EE">Эстония</option>
                      <option value="LV">Латвия</option>
                      <option value="LT">Литва</option>
                      <option value="FI">Финляндия</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-amber-100 pt-4">
                <h2 className="font-serif text-lg font-semibold text-[#8B5E3C]">Способ доставки</h2>
                <div className="mt-4 space-y-3">
                  {deliveryOptions.map((option) => (
                    <label
                      key={option.id}
                      className="flex items-center gap-3 rounded-xl border-2 border-amber-100 px-4 py-3 transition cursor-pointer hover:border-amber-300 hover:bg-amber-50"
                      style={{
                        borderColor: formData.deliveryMethod === option.id ? '#D97706' : undefined,
                        backgroundColor: formData.deliveryMethod === option.id ? '#FEF3C7' : undefined,
                      }}
                    >
                      <input
                        type="radio"
                        name="deliveryMethod"
                        value={option.id}
                        checked={formData.deliveryMethod === option.id}
                        onChange={(e) => handleDeliveryChange(e.target.value)}
                        className="cursor-pointer"
                      />
                      <div className="flex-1">
                        <p className="font-semibold text-[#8B5E3C]">{option.name}</p>
                        <p className="text-xs text-zinc-600">{option.description}</p>
                      </div>
                      <p className="font-semibold text-[#8B5E3C]">
                        {option.price === 0 ? 'Бесплатно' : `€${option.price.toFixed(2)}`}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {(submitError || queryError) && (
                <div className="rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError || queryError}</div>
              )}

              <input type="hidden" name="cartItems" value={JSON.stringify(cartItemsPayload)} />

              <button
                type="submit"
                disabled={isPending || cart.length === 0}
                className="w-full rounded-xl bg-[#D97706] px-5 py-3 font-semibold text-white transition hover:bg-amber-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isPending ? 'Переход к оплате...' : `Оплатить €${total.toFixed(2)}`}
              </button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-amber-100 bg-white px-6 py-6 shadow-sm md:sticky md:top-4">
            <h2 className="font-serif text-lg font-bold text-[#8B5E3C]">Ваш заказ</h2>

            <div className="mt-4 space-y-3 border-b border-amber-100 pb-4">
              {cart.map((item) => {
                const linePrice = typeof item.price === 'string' ? Number(item.price) : item.price;

                return (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold text-zinc-900">{item.title}</p>
                    <p className="text-xs text-zinc-600">{item.author}</p>
                    <p className="text-xs text-zinc-600">Кол-во: {item.quantity}</p>
                  </div>
                  <p className="font-semibold text-zinc-900">€{(linePrice * item.quantity).toFixed(2)}</p>
                </div>
              );
              })}
            </div>

            <div className="mt-4 space-y-2 border-b border-amber-100 pb-4 text-sm">
              <div className="flex justify-between">
                <p className="text-zinc-700">Товары:</p>
                <p className="font-semibold text-zinc-900">€{subtotal.toFixed(2)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-zinc-700">Доставка:</p>
                <p className="font-semibold text-zinc-900">€{deliveryFee.toFixed(2)}</p>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold">
              <p className="text-[#8B5E3C]">Итого:</p>
              <p className="text-[#D97706]">€{total.toFixed(2)}</p>
            </div>

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm text-[#8B5E3C] transition hover:text-[#A0785A] hover:underline"
            >
              К корзине
            </Link>
          </section>

          <section className="rounded-3xl border border-amber-100 bg-white px-6 py-6 shadow-sm">
            <p className="text-center text-xs text-zinc-600">
              Оплата безопасна и защищена Stripe. Ваши данные не передаются третьим лицам.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
