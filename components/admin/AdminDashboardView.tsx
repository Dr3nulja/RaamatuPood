'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { AdminOrder, AdminOrdersResponse } from '@/lib/api/adminTypes';
import { chartPalette, orderStatuses } from '@/components/admin/shared';

export default function AdminDashboardView() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
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
        console.error('Dashboard load failed:', error);
        if (isMounted) {
          showToast('Failed to load dashboard');
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

  const dashboardKpis = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    const totalOrders = orders.length;

    const statusCounter = orderStatuses.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<(typeof orderStatuses)[number], number>
    );

    for (const order of orders) {
      statusCounter[order.status] += 1;
    }

    const bookCounts = new Map<number, { title: string; count: number }>();
    for (const order of orders) {
      for (const item of order.items) {
        if (!item.book_id) {
          continue;
        }

        const prev = bookCounts.get(item.book_id);
        bookCounts.set(item.book_id, {
          title: item.title,
          count: (prev?.count || 0) + item.quantity,
        });
      }
    }

    const popularBooks = [...bookCounts.entries()]
      .map(([bookId, value]) => ({ bookId, ...value }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const monthlyRevenueMap = new Map<string, number>();
    for (const order of orders) {
      const date = new Date(order.created_at);
      if (Number.isNaN(date.getTime())) {
        continue;
      }

      const monthLabel = new Intl.DateTimeFormat('en-US', {
        month: 'short',
        year: '2-digit',
      }).format(date);

      monthlyRevenueMap.set(monthLabel, (monthlyRevenueMap.get(monthLabel) || 0) + order.total_price);
    }

    const revenueSeries = [...monthlyRevenueMap.entries()].map(([month, revenue]) => ({
      month,
      revenue: Number(revenue.toFixed(2)),
    }));

    const statusSeries = orderStatuses.map((status) => ({
      name: status,
      value: statusCounter[status],
    }));

    return {
      totalRevenue,
      totalOrders,
      statusCounter,
      popularBooks,
      revenueSeries,
      statusSeries,
    };
  }, [orders]);

  return (
    <>
      {toast && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          {toast}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total revenue</p>
          <p className="mt-2 text-2xl font-bold text-amber-800">€{dashboardKpis.totalRevenue.toFixed(2)}</p>
        </article>
        <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Total orders</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">{dashboardKpis.totalOrders}</p>
        </article>
        <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">Delivered</p>
          <p className="mt-2 text-2xl font-bold text-emerald-700">{dashboardKpis.statusCounter.delivered}</p>
        </article>
        <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <p className="text-sm text-zinc-500">In progress</p>
          <p className="mt-2 text-2xl font-bold text-zinc-900">
            {dashboardKpis.statusCounter.pending + dashboardKpis.statusCounter.paid + dashboardKpis.statusCounter.shipped}
          </p>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Orders by status</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardKpis.statusSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                  {dashboardKpis.statusSeries.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={chartPalette[index % chartPalette.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </article>

        <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Revenue by month</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardKpis.revenueSeries}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="revenue" stroke="var(--ds-primary)" strokeWidth={3} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
        <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Popular books</h3>
          <ul className="mt-4 space-y-3">
            {isLoading ? (
              <li className="text-sm text-zinc-500">Loading...</li>
            ) : dashboardKpis.popularBooks.length === 0 ? (
              <li className="text-sm text-zinc-500">No popularity data yet</li>
            ) : (
              dashboardKpis.popularBooks.map((item, index) => (
                <li key={item.bookId} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                  <div>
                    <p className="text-sm font-semibold text-zinc-900">#{index + 1} {item.title}</p>
                    <p className="text-xs text-zinc-500">ID: {item.bookId}</p>
                  </div>
                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800">{item.count} pcs.</span>
                </li>
              ))
            )}
          </ul>
        </article>

        <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-zinc-900">Status share</h3>
          <div className="mt-4 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={dashboardKpis.statusSeries} dataKey="value" nameKey="name" outerRadius={108} label>
                  {dashboardKpis.statusSeries.map((entry, index) => (
                    <Cell key={`${entry.name}-${index}`} fill={chartPalette[index % chartPalette.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </article>
      </div>
    </>
  );
}
