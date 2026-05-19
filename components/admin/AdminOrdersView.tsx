'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminOrder, AdminOrdersResponse } from '@/lib/api/adminTypes';
import { orderStatuses, type OrderStatus } from '@/components/admin/shared';
import Button from '@/components/ui/Button';
import { useTranslation } from '@/hooks/useTranslation';

function getStatusColor(status: OrderStatus): { bg: string; badge: string; text: string } {
  const colors: Record<OrderStatus, { bg: string; badge: string; text: string }> = {
    pending: { bg: 'bg-yellow-50', badge: 'bg-yellow-100 text-yellow-800', text: 'text-yellow-700' },
    paid: { bg: 'bg-blue-50', badge: 'bg-blue-100 text-blue-800', text: 'text-blue-700' },
    shipped: { bg: 'bg-indigo-50', badge: 'bg-indigo-100 text-indigo-800', text: 'text-indigo-700' },
    delivered: { bg: 'bg-green-50', badge: 'bg-green-100 text-green-800', text: 'text-green-700' },
    cancelled: { bg: 'bg-red-50', badge: 'bg-red-100 text-red-800', text: 'text-red-700' },
  };
  return colors[status];
}

export default function AdminOrdersView() {
  const { t, formatPrice } = useTranslation();
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [orderActionLoadingId, setOrderActionLoadingId] = useState<number | null>(null);
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<'all' | OrderStatus>('all');
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  useEffect(() => {
    let isMounted = true;

    const loadOrders = async () => {
      setIsLoading(true);
      try {
        const response = await fetch('/api/admin/orders', {
          cache: 'no-store',
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error(t('admin.orders.toasts.loadFailed'));
        }

        const data = (await response.json()) as AdminOrdersResponse;
        if (isMounted) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Orders load failed:', error);
        if (isMounted) {
          showToast(t('admin.orders.toasts.loadFailed'));
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadOrders();

    return () => {
      isMounted = false;
    };
  }, [t]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => (ordersStatusFilter === 'all' ? true : order.status === ordersStatusFilter)),
    [orders, ordersStatusFilter]
  );

  const handleChangeOrderStatus = async (orderId: number, nextStatus: OrderStatus) => {
    const previousOrders = orders;
    setOrders((prev) => prev.map((order) => (order.id === orderId ? { ...order, status: nextStatus } : order)));
    setOrderActionLoadingId(orderId);

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ status: nextStatus }),
      });

      if (!response.ok) {
        throw new Error(t('admin.orders.toasts.updateFailed'));
      }

      showToast(t('admin.orders.toasts.statusUpdated', { id: orderId }));
    } catch (error) {
      console.error(error);
      setOrders(previousOrders);
      showToast(t('admin.orders.toasts.updateFailed'));
    } finally {
      setOrderActionLoadingId(null);
    }
  };

  return (
    <article className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="font-serif text-3xl font-bold text-secondary">{t('admin.orders.title')}</h2>
        <p className="mt-1 text-sm text-zinc-600">{t('admin.orders.found', { count: filteredOrders.length })}</p>
      </div>

      {/* Toast */}
      {toast && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800 shadow-sm">
          {toast}
        </div>
      )}

      {/* Status Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-zinc-700">{t('admin.orders.filterByStatus')}</span>
        <div className="flex flex-wrap gap-2">
          {(['all', ...orderStatuses] as const).map((status) => (
            <Button
              key={status}
              onClick={() => setOrdersStatusFilter(status)}
              size="small"
              variant={ordersStatusFilter === status ? 'primary' : 'outline'}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition-all ${
                ordersStatusFilter === status
                  ? 'shadow-md'
                  : 'border-amber-200 bg-white text-zinc-700 hover:border-amber-300 hover:bg-amber-50'
              }`}
            >
              {status === 'all' ? t('admin.orders.allOrders') : t(`admin.orders.status.${status}`)}
            </Button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="rounded-xl border border-amber-100 bg-white p-8 text-center text-zinc-500">
            {t('admin.orders.loading')}
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="rounded-xl border border-amber-100 bg-white p-8 text-center text-zinc-500">
            <p className="text-lg font-medium">{t('admin.orders.emptyTitle')}</p>
            <p className="mt-1 text-sm">{t('admin.orders.emptySubtitle')}</p>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const statusColors = getStatusColor(order.status);
            return (
              <div
                key={order.id}
                className="group rounded-xl border border-amber-100 bg-white p-6 shadow-sm transition-all hover:border-amber-300 hover:shadow-md"
              >
                {/* Header Row */}
                <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-serif text-xl font-bold text-zinc-800">{t('admin.orders.orderPrefix', { id: order.id })}</h3>
                      <span className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${statusColors.badge}`}>
                        {t(`admin.orders.status.${order.status}`)}
                      </span>
                    </div>
                    <p className="mt-2 text-sm text-zinc-600">{order.user_email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-medium text-zinc-500">{t('admin.orders.totalAmount')}</p>
                    <p className="text-2xl font-bold text-secondary">{formatPrice(order.total_price)}</p>
                  </div>
                </div>

                {/* Books Section */}
                <div className="mt-6 border-t border-amber-100 pt-6">
                  <p className="mb-3 text-sm font-semibold text-zinc-700">{t('admin.orders.orderItems')}</p>
                  <ul className="space-y-2">
                    {order.items.map((item) => (
                      <li key={item.id} className="flex items-center justify-between rounded-lg bg-amber-50 px-4 py-3">
                        <div className="flex-1">
                          <p className="font-medium text-zinc-800">{item.title}</p>
                          <p className="text-xs text-zinc-600">{t('admin.orders.qty', { count: item.quantity })}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-secondary">€{item.price.toFixed(2)}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Status Change Control */}
                <div className="mt-6 border-t border-amber-100 pt-6">
                  <label className="block text-sm font-medium text-zinc-700">{t('admin.orders.changeStatus')}</label>
                  <div className="mt-2 flex gap-2">
                    <select
                      value={order.status}
                      disabled={orderActionLoadingId === order.id}
                      onChange={(event) =>
                        void handleChangeOrderStatus(order.id, event.target.value as OrderStatus)
                      }
                      className="flex-1 rounded-lg border border-amber-200 px-3 py-2 text-sm transition-colors hover:border-amber-300 focus:outline-none focus:ring-2 focus:ring-amber-400 disabled:opacity-50"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {t(`admin.orders.status.${status}`)}
                        </option>
                      ))}
                    </select>
                    {orderActionLoadingId === order.id && (
                      <div className="flex items-center px-3 py-2 text-xs text-zinc-600">
                        {t('admin.orders.updating')}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </article>
  );
}
