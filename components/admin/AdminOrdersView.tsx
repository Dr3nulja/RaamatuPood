'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminOrder, AdminOrdersResponse } from '@/lib/api/adminTypes';
import { orderStatuses, type OrderStatus } from '@/components/admin/shared';

export default function AdminOrdersView() {
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
          throw new Error('Failed to load admin orders');
        }

        const data = (await response.json()) as AdminOrdersResponse;
        if (isMounted) {
          setOrders(data.orders || []);
        }
      } catch (error) {
        console.error('Orders load failed:', error);
        if (isMounted) {
          showToast('Ошибка загрузки заказов');
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
  }, []);

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
        throw new Error('Order status update failed');
      }

      showToast(`Заказ #${orderId}: статус обновлён`);
    } catch (error) {
      console.error(error);
      setOrders(previousOrders);
      showToast('Не удалось обновить статус заказа');
    } finally {
      setOrderActionLoadingId(null);
    }
  };

  return (
    <article className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl font-bold text-secondary">Управление заказами</h2>

      {toast && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          {toast}
        </div>
      )}

      <div className="mt-4 flex items-center gap-3">
        <label className="text-sm font-medium text-zinc-700">Фильтр статуса</label>
        <select
          className="rounded-xl border border-amber-200 px-3 py-2 text-sm"
          value={ordersStatusFilter}
          onChange={(event) => setOrdersStatusFilter(event.target.value as 'all' | OrderStatus)}
        >
          <option value="all">Все</option>
          {orderStatuses.map((status) => (
            <option key={status} value={status}>{status}</option>
          ))}
        </select>
      </div>

      <div className="mt-6 overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-amber-100 text-left text-zinc-500">
              <th className="px-3 py-2">ID</th>
              <th className="px-3 py-2">User</th>
              <th className="px-3 py-2">Total</th>
              <th className="px-3 py-2">Status</th>
              <th className="px-3 py-2">Books</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td className="px-3 py-4 text-zinc-500" colSpan={5}>Loading orders...</td>
              </tr>
            ) : filteredOrders.length === 0 ? (
              <tr>
                <td className="px-3 py-4 text-zinc-500" colSpan={5}>Заказы не найдены</td>
              </tr>
            ) : (
              filteredOrders.map((order) => (
                <tr key={order.id} className="border-b border-amber-50 align-top">
                  <td className="px-3 py-3 font-medium text-zinc-800">#{order.id}</td>
                  <td className="px-3 py-3">{order.user_email}</td>
                  <td className="px-3 py-3">€{order.total_price.toFixed(2)}</td>
                  <td className="px-3 py-3">
                    <select
                      value={order.status}
                      disabled={orderActionLoadingId === order.id}
                      onChange={(event) =>
                        void handleChangeOrderStatus(order.id, event.target.value as OrderStatus)
                      }
                      className="rounded-lg border border-amber-200 px-2 py-1"
                    >
                      {orderStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-3 py-3">
                    <ul className="space-y-1">
                      {order.items.map((item) => (
                        <li key={item.id} className="text-xs text-zinc-700">
                          {item.title} x {item.quantity} (€{item.price.toFixed(2)})
                        </li>
                      ))}
                    </ul>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </article>
  );
}
