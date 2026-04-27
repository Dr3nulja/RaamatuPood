'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

type OrderItem = {
  id: number;
  bookId: number | null;
  title: string;
  quantity: number;
  price: number;
};

type AccountOrder = {
  id: number;
  totalPrice: number;
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  deliveryMethod: string;
  address: string;
  items: OrderItem[];
};

type OrderCardProps = {
  order: AccountOrder;
};

const statusStyles: Record<AccountOrder['status'], string> = {
  pending: 'bg-amber-100 text-amber-900',
  paid: 'bg-sky-100 text-sky-900',
  shipped: 'bg-indigo-100 text-indigo-900',
  delivered: 'bg-emerald-100 text-emerald-900',
  cancelled: 'bg-red-100 text-red-900',
};

const statusLabelKeys: Record<AccountOrder['status'], string> = {
  pending: 'profile.orders.pending',
  paid: 'profile.orders.processing',
  shipped: 'profile.orders.processing',
  delivered: 'profile.orders.delivered',
  cancelled: 'profile.orders.cancelled',
};

export default function OrderCard({ order }: OrderCardProps) {
  const { t, formatDate, formatPrice } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current !== null) {
        window.clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (message: string) => {
    setToast(message);
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }

    toastTimerRef.current = window.setTimeout(() => {
      setToast(null);
    }, 1800);
  };

  const handleRepeatOrder = () => {
    showToast(t('profile.orders.repeatNotAvailable'));
  };

  const handleCancelOrder = () => {
    const confirmed = window.confirm(t('profile.orders.cancelConfirm', { id: order.id }));
    if (!confirmed) {
      return;
    }

    showToast(t('profile.orders.cancelNotAvailable'));
  };

  const formattedDate = formatDate(order.createdAt);
  const formattedTotal = formatPrice(order.totalPrice);

  return (
    <article className="rounded-[2rem] border border-amber-100 bg-white p-5 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-lg md:p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold tracking-tight text-zinc-900">{t('profile.orders.orderId', { id: order.id })}</h3>
            <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[order.status]}`}>
              {t(statusLabelKeys[order.status])}
            </span>
          </div>
          <p className="text-sm text-zinc-500">{t('profile.orders.fromDate', { date: formattedDate })}</p>
          <p className="text-sm text-zinc-600">{t('profile.orders.delivery')}: {order.deliveryMethod || '—'}</p>
        </div>

        <div className="text-left sm:text-right">
          <p className="text-2xl font-bold text-amber-700">{formattedTotal}</p>
          <p className="text-sm text-zinc-500">{t('profile.orders.amount', { total: formattedTotal })}</p>
        </div>
      </div>

      <div className="mt-4 rounded-2xl bg-zinc-50 p-4 text-sm text-zinc-600">
        <p className="font-medium text-zinc-700">{t('profile.form.address')}</p>
        <p className={`mt-1 ${isExpanded ? '' : 'line-clamp-1'}`}>{order.address || t('profile.orders.noAddress')}</p>
      </div>

      <div className="mt-4 space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h4 className="text-sm font-semibold uppercase tracking-[0.2em] text-amber-700">{t('profile.orders.books')}</h4>
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={() => setIsExpanded((value) => !value)}
            className="rounded-full border-amber-200 bg-white text-zinc-700 hover:bg-amber-50"
          >
            {isExpanded ? t('profile.orders.hide') : t('profile.orders.details')}
          </Button>
        </div>

        <div className={`grid gap-2 ${isExpanded ? '' : 'max-h-32 overflow-hidden'}`}>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between gap-3 rounded-2xl border border-amber-100 bg-white px-4 py-3"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {item.title} × {item.quantity}
                </p>
                <p className="text-xs text-zinc-500">{t('profile.orders.itemPrice')}: {formatPrice(item.price)}</p>
              </div>
              {item.bookId ? (
                <Link
                  href={`/catalog/${item.bookId}`}
                  className="rounded-full border border-amber-200 px-3 py-1.5 text-xs font-semibold text-secondary transition hover:bg-amber-50"
                >
                  {t('profile.orders.review')}
                </Link>
              ) : null}
            </div>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 pt-1">
          <Link
            href={`/account/orders/${order.id}`}
            className="inline-flex items-center justify-center rounded-full border border-amber-200 px-3 py-1.5 text-xs font-semibold text-secondary transition hover:bg-amber-50"
          >
            {t('profile.orders.details')}
          </Link>
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={handleRepeatOrder}
            className="rounded-full border-amber-200 bg-white text-zinc-700 hover:bg-amber-50"
          >
            {t('profile.orders.repeat')}
          </Button>
          <Button
            type="button"
            variant="outline"
            size="small"
            onClick={handleCancelOrder}
            className="rounded-full border-red-200 bg-white text-red-600 hover:bg-red-50"
          >
            {t('profile.orders.cancel')}
          </Button>
        </div>

        {toast ? <p className="text-xs font-medium text-amber-800">{toast}</p> : null}
      </div>
    </article>
  );
}