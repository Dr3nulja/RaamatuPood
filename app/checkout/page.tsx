'use client';

import Link from 'next/link';
import { useState, useEffect, useMemo, useTransition } from 'react';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/cartStore';
import { createCheckoutSession } from '@/app/actions/checkout';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

interface DeliveryOption {
  id: string;
  name: string;
  checkoutValue: string;
  price: number;
  description: string;
}

const deliveryOptions: DeliveryOption[] = [
  {
    id: 'omniva',
    name: 'Omniva pakiautomaat',
    checkoutValue: 'Omniva pakiautomaat',
    price: 3.99,
    description: 'Pickup from parcel locker',
  },
  {
    id: 'itella',
    name: 'Itella Smartpost',
    checkoutValue: 'Itella Smartpost',
    price: 4.49,
    description: 'Pickup from delivery point',
  },
  {
    id: 'courier',
    name: 'Tallinn courier',
    checkoutValue: 'Tallinn Courier',
    price: 6.0,
    description: 'Door-to-door delivery',
  },
  {
    id: 'pickup',
    name: 'Store pickup',
    checkoutValue: 'Self-call',
    price: 0,
    description: 'Pick up in our store',
  },
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
  const { t, formatPrice } = useTranslation();
  const [isMounted, setIsMounted] = useState(false);
  const [isPending, startTransition] = useTransition();
  const searchParams = useSearchParams();

  useEffect(() => {
    void useCartStore.persist.rehydrate();

    const frame = window.requestAnimationFrame(() => {
      setIsMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
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
      missing_fields: t('checkout.errors.missingFields'),
      empty_cart: t('checkout.errors.emptyCart'),
      invalid_shipping_method: t('checkout.errors.invalidShippingMethod'),
      checkout_failed: t('checkout.errors.checkoutFailed'),
    };

    return map[errorCode] || t('checkout.errors.checkoutFailed');
  }, [searchParams, t]);

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

  const translatedDeliveryOptions: DeliveryOption[] = useMemo(
    () => [
      {
        id: 'omniva',
        name: 'Omniva pakiautomaat',
        checkoutValue: 'Omniva pakiautomaat',
        price: 3.99,
        description: t('checkout.shipping.omnivaDescription'),
      },
      {
        id: 'itella',
        name: 'Itella Smartpost',
        checkoutValue: 'Itella Smartpost',
        price: 4.49,
        description: t('checkout.shipping.itellaDescription'),
      },
      {
        id: 'courier',
        name: t('checkout.shipping.courierName'),
        checkoutValue: 'Tallinn Courier',
        price: 6.0,
        description: t('checkout.shipping.courierDescription'),
      },
      {
        id: 'pickup',
        name: t('checkout.shipping.pickupName'),
        checkoutValue: 'Self-call',
        price: 0,
        description: t('checkout.shipping.pickupDescription'),
      },
    ],
    [t]
  );

  const selectedDelivery = translatedDeliveryOptions.find((d) => d.id === formData.deliveryMethod) || translatedDeliveryOptions[0];
  const subtotal = cart.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? Number(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const deliveryFee = selectedDelivery.price;
  const total = subtotal + deliveryFee;

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) newErrors.name = t('checkout.errors.validationName');
    if (!formData.email.trim()) newErrors.email = t('checkout.errors.validationEmail');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = t('checkout.errors.validationEmailInvalid');
    if (!formData.street.trim()) newErrors.street = t('checkout.errors.validationStreet');
    if (!formData.houseNumber.trim()) newErrors.houseNumber = t('checkout.errors.validationHouseNumber');
    if (!formData.postalCode.trim()) newErrors.postalCode = t('checkout.errors.validationPostalCode');
    if (!formData.city.trim()) newErrors.city = t('checkout.errors.validationCity');

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
      setSubmitError(t('checkout.errors.validationFillAll'));
      return;
    }

    if (cartItemsPayload.length === 0) {
      setSubmitError(t('checkout.errors.emptyCart'));
      return;
    }

    const payload = new FormData();
    payload.set('name', formData.name);
    payload.set('email', formData.email);
    payload.set('phone', formData.phone);
    payload.set('address', `${formData.street} ${formData.houseNumber}, ${formData.postalCode} ${formData.city}, ${formData.country}`);
    payload.set('delivery', selectedDelivery.checkoutValue);
    // Pass cart payload to the Server Action in serialized form.
    payload.set('cartItems', JSON.stringify(cartItemsPayload));

    setSubmitError('');
    startTransition(async () => {
      await createCheckoutSession(payload);
    });
  };

  if (!isMounted) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-zinc-700">{t('checkout.loadingCart')}</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12">
        <div className="mx-auto max-w-3xl">
          <div className="rounded-3xl border border-amber-100 bg-white px-6 py-8 text-center shadow-sm md:px-8 md:py-10">
            <h1 className="font-serif text-3xl font-bold text-secondary">{t('checkout.cartEmptyTitle')}</h1>
            <p className="mt-3 text-zinc-700">{t('checkout.cartEmptyText')}</p>
            <Link
              href="/catalog"
              className="mt-5 inline-flex rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-white transition hover:bg-primary-hover"
            >
              {t('checkout.goToCatalog')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background-muted px-4 py-12">
      <div className="mx-auto flex max-w-6xl gap-6 lg:grid lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <section className="rounded-3xl border border-amber-100 bg-white px-6 py-8 shadow-sm md:px-8">
            <h1 className="font-serif text-3xl font-bold text-secondary">{t('checkout.title')}</h1>
            <p className="mt-2 text-zinc-700">{t('checkout.step1')}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-secondary">
                    {t('checkout.name')} *
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`ui-input mt-1 ${
                      errors.name ? 'border-red-400 bg-red-50 focus:border-red-500' : ''
                    }`}
                    placeholder={t('checkout.yourName')}
                  />
                  {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-secondary">
                    {t('checkout.email')} *
                  </label>
                  <input
                    id="email"
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`ui-input mt-1 ${
                      errors.email ? 'border-red-400 bg-red-50 focus:border-red-500' : ''
                    }`}
                    placeholder={t('checkout.emailPlaceholder')}
                  />
                  {errors.email && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
                </div>
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-semibold text-secondary">
                  {t('checkout.phone')}
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="ui-input mt-1"
                  placeholder={t('checkout.phonePlaceholder')}
                />
              </div>

              <div className="border-t border-amber-100 pt-4">
                <h2 className="font-serif text-lg font-semibold text-secondary">{t('checkout.deliveryAddress')}</h2>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="street" className="block text-sm font-semibold text-secondary">
                      {t('checkout.street')} *
                    </label>
                    <input
                      id="street"
                      type="text"
                      name="street"
                      value={formData.street}
                      onChange={handleInputChange}
                      className={`ui-input mt-1 ${
                        errors.street ? 'border-red-400 bg-red-50 focus:border-red-500' : ''
                      }`}
                      placeholder={t('checkout.streetPlaceholder')}
                    />
                    {errors.street && <p className="mt-1 text-xs text-red-600">{errors.street}</p>}
                  </div>
                  <div>
                    <label htmlFor="houseNumber" className="block text-sm font-semibold text-secondary">
                      {t('checkout.houseNumber')} *
                    </label>
                    <input
                      id="houseNumber"
                      type="text"
                      name="houseNumber"
                      value={formData.houseNumber}
                      onChange={handleInputChange}
                      className={`ui-input mt-1 ${
                        errors.houseNumber ? 'border-red-400 bg-red-50 focus:border-red-500' : ''
                      }`}
                      placeholder={t('checkout.houseNumberPlaceholder')}
                    />
                    {errors.houseNumber && <p className="mt-1 text-xs text-red-600">{errors.houseNumber}</p>}
                  </div>
                </div>

                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  <div>
                    <label htmlFor="postalCode" className="block text-sm font-semibold text-secondary">
                      {t('checkout.postalCode')} *
                    </label>
                    <input
                      id="postalCode"
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className={`ui-input mt-1 ${
                        errors.postalCode ? 'border-red-400 bg-red-50 focus:border-red-500' : ''
                      }`}
                      placeholder={t('checkout.postalCodePlaceholder')}
                    />
                    {errors.postalCode && <p className="mt-1 text-xs text-red-600">{errors.postalCode}</p>}
                  </div>
                  <div>
                    <label htmlFor="city" className="block text-sm font-semibold text-secondary">
                      {t('checkout.city')} *
                    </label>
                    <input
                      id="city"
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className={`ui-input mt-1 ${
                        errors.city ? 'border-red-400 bg-red-50 focus:border-red-500' : ''
                      }`}
                      placeholder={t('checkout.cityPlaceholder')}
                    />
                    {errors.city && <p className="mt-1 text-xs text-red-600">{errors.city}</p>}
                  </div>
                  <div>
                    <label htmlFor="country" className="block text-sm font-semibold text-secondary">
                      {t('checkout.country')}
                    </label>
                    <select
                      id="country"
                      name="country"
                      value={formData.country}
                      onChange={handleInputChange}
                      className="ui-select mt-1"
                    >
                      <option value="EE">{t('checkout.countryEstonia')}</option>
                      <option value="LV">{t('checkout.countryLatvia')}</option>
                      <option value="LT">{t('checkout.countryLithuania')}</option>
                      <option value="FI">{t('checkout.countryFinland')}</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="border-t border-amber-100 pt-4">
                <h2 className="font-serif text-lg font-semibold text-secondary">{t('checkout.deliveryMethod')}</h2>
                <div className="mt-4 space-y-3">
                  {translatedDeliveryOptions.map((option) => (
                    <label
                      key={option.id}
                      className={`flex cursor-pointer items-center gap-3 rounded-xl border-2 px-4 py-3 transition hover:border-amber-300 hover:bg-amber-50 ${
                        formData.deliveryMethod === option.id
                          ? 'border-primary bg-primary-soft'
                          : 'border-amber-100'
                      }`}
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
                        <p className="font-semibold text-secondary">{option.name}</p>
                        <p className="text-xs text-zinc-600">{option.description}</p>
                      </div>
                      <p className="font-semibold text-secondary">
                        {option.price === 0 ? t('checkout.free') : formatPrice(option.price)}
                      </p>
                    </label>
                  ))}
                </div>
              </div>

              {(submitError || queryError) && (
                <div className="rounded-xl border border-red-400 bg-red-50 px-4 py-3 text-sm text-red-700">{submitError || queryError}</div>
              )}

              <input type="hidden" name="cartItems" value={JSON.stringify(cartItemsPayload)} />

              <Button
                type="submit"
                fullWidth
                size="large"
                loading={isPending}
                disabled={isPending || cart.length === 0}
              >
                {isPending ? t('checkout.redirecting') : t('checkout.pay', { total: formatPrice(total) })}
              </Button>
            </form>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-3xl border border-amber-100 bg-white px-6 py-6 shadow-sm md:sticky md:top-4">
            <h2 className="font-serif text-lg font-bold text-secondary">{t('checkout.yourOrder')}</h2>

            <div className="mt-4 space-y-3 border-b border-amber-100 pb-4">
              {cart.map((item) => {
                const linePrice = typeof item.price === 'string' ? Number(item.price) : item.price;

                return (
                <div key={item.id} className="flex justify-between text-sm">
                  <div>
                    <p className="font-semibold text-zinc-900">{item.title}</p>
                    <p className="text-xs text-zinc-600">{item.author}</p>
                    <p className="text-xs text-zinc-600">{t('checkout.qty', { count: item.quantity })}</p>
                  </div>
                  <p className="font-semibold text-zinc-900">{formatPrice(linePrice * item.quantity)}</p>
                </div>
              );
              })}
            </div>

            <div className="mt-4 space-y-2 border-b border-amber-100 pb-4 text-sm">
              <div className="flex justify-between">
                <p className="text-zinc-700">{t('checkout.items')}</p>
                <p className="font-semibold text-zinc-900">{formatPrice(subtotal)}</p>
              </div>
              <div className="flex justify-between">
                <p className="text-zinc-700">{t('checkout.delivery')}</p>
                <p className="font-semibold text-zinc-900">{formatPrice(deliveryFee)}</p>
              </div>
            </div>

            <div className="mt-4 flex justify-between text-lg font-bold">
              <p className="text-secondary">{t('checkout.total')}</p>
              <p className="text-primary">{formatPrice(total)}</p>
            </div>

            <Link
              href="/cart"
              className="mt-4 block text-center text-sm text-secondary transition hover:text-secondary-soft hover:underline"
            >
              {t('checkout.backToCart')}
            </Link>
          </section>

          <section className="rounded-3xl border border-amber-100 bg-white px-6 py-6 shadow-sm">
            <p className="text-center text-xs text-zinc-600">
              {t('checkout.stripeNotice')}
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
