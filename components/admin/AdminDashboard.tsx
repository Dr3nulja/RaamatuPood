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
import type {
  AdminBook,
  AdminBooksResponse,
  AdminCategoryOption,
  AdminOrder,
  AdminOrdersResponse,
  AdminAuthorOption,
} from '@/lib/api/adminTypes';

type BookFormState = {
  title: string;
  price: string;
  stock: string;
  description: string;
  cover_image: string;
  author_id: string;
  category_id: string;
  cover_file: File | null;
};

const initialBookForm: BookFormState = {
  title: '',
  price: '',
  stock: '',
  description: '',
  cover_image: '',
  author_id: '',
  category_id: '',
  cover_file: null,
};

const orderStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof orderStatuses)[number];
type AdminSection = 'dashboard' | 'books' | 'orders';

const sectionButtonClass =
  'flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition';

const chartPalette = ['#D97706', '#F59E0B', '#FBBF24', '#A16207', '#92400E'];

function normalizeCover(url: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `/images/${url}`;
}

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState<AdminSection>('dashboard');
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [authors, setAuthors] = useState<AdminAuthorOption[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);

  const [bookForm, setBookForm] = useState<BookFormState>(initialBookForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [bookActionLoadingId, setBookActionLoadingId] = useState<number | null>(null);
  const [orderActionLoadingId, setOrderActionLoadingId] = useState<number | null>(null);

  const [booksQuery, setBooksQuery] = useState('');
  const [booksCategoryFilter, setBooksCategoryFilter] = useState('all');
  const [ordersStatusFilter, setOrdersStatusFilter] = useState<'all' | OrderStatus>('all');

  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<BookFormState>(initialBookForm);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [booksResponse, ordersResponse] = await Promise.all([
        fetch('/api/admin/books', { cache: 'no-store', credentials: 'include' }),
        fetch('/api/admin/orders', { cache: 'no-store', credentials: 'include' }),
      ]);

      if (!booksResponse.ok || !ordersResponse.ok) {
        throw new Error('Failed to load admin data');
      }

      const booksData = (await booksResponse.json()) as AdminBooksResponse;
      const ordersData = (await ordersResponse.json()) as AdminOrdersResponse;

      setBooks(booksData.books);
      setOrders(ordersData.orders);
      setAuthors(booksData.authors || []);
      setCategories(booksData.categories || []);
    } catch (error) {
      console.error('Admin data load failed:', error);
      showToast('Ошибка загрузки данных admin-панели');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const filteredBooks = useMemo(() => {
    const normalizedQuery = booksQuery.trim().toLowerCase();

    return books.filter((book) => {
      const queryMatches = !normalizedQuery
        || book.title.toLowerCase().includes(normalizedQuery)
        || (book.author_name || '').toLowerCase().includes(normalizedQuery)
        || (book.description || '').toLowerCase().includes(normalizedQuery);

      const categoryMatches = booksCategoryFilter === 'all' || String(book.category_id) === booksCategoryFilter;

      return queryMatches && categoryMatches;
    });
  }, [books, booksCategoryFilter, booksQuery]);

  const filteredOrders = useMemo(
    () => orders.filter((order) => (ordersStatusFilter === 'all' ? true : order.status === ordersStatusFilter)),
    [orders, ordersStatusFilter]
  );

  const dashboardKpis = useMemo(() => {
    const totalRevenue = orders.reduce((sum, order) => sum + order.total_price, 0);
    const totalOrders = orders.length;

    const statusCounter = orderStatuses.reduce(
      (acc, status) => ({ ...acc, [status]: 0 }),
      {} as Record<OrderStatus, number>
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

      const monthLabel = new Intl.DateTimeFormat('ru-RU', {
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

  const startEditingBook = (book: AdminBook) => {
    setEditingBookId(book.id);
    setEditingDraft({
      title: book.title,
      price: String(book.price),
      stock: String(book.stock),
      description: book.description || '',
      cover_image: book.cover_image || '',
      author_id: book.author_id ? String(book.author_id) : '',
      category_id: book.category_id ? String(book.category_id) : '',
      cover_file: null,
    });
  };

  const cancelEditingBook = () => {
    setEditingBookId(null);
    setEditingDraft(initialBookForm);
  };

  const handleCreateBook = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingBook(true);

    try {
      const formData = new FormData();
      formData.set('title', bookForm.title);
      formData.set('price', bookForm.price);
      formData.set('stock', bookForm.stock);
      formData.set('description', bookForm.description);
      formData.set('cover_image', bookForm.cover_image);
      formData.set('author_id', bookForm.author_id);
      formData.set('category_id', bookForm.category_id);
      if (bookForm.cover_file) {
        formData.set('cover', bookForm.cover_file);
      }

      const response = await fetch('/api/admin/books', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Create book failed');
      }

      setBookForm(initialBookForm);
      showToast('Книга добавлена');
      await loadData();
    } catch (error) {
      console.error(error);
      showToast('Не удалось создать книгу');
    } finally {
      setIsCreatingBook(false);
    }
  };

  const handleDeleteBook = async (id: number) => {
    setBookActionLoadingId(id);
    try {
      const response = await fetch(`/api/admin/books/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setBooks((prev) => prev.filter((book) => book.id !== id));
      showToast('Книга удалена');
    } catch (error) {
      console.error(error);
      showToast('Не удалось удалить книгу');
    } finally {
      setBookActionLoadingId(null);
    }
  };

  const handleSaveBook = async (bookId: number) => {
    if (editingBookId !== bookId) {
      return;
    }

    if (!editingDraft.title.trim()) {
      showToast('Название книги обязательно');
      return;
    }

    const nextPrice = Number(editingDraft.price);
    const nextStock = Number(editingDraft.stock);
    if (!Number.isFinite(nextPrice) || !Number.isInteger(nextStock) || nextStock < 0) {
      showToast('Неверные price/stock');
      return;
    }

    setBookActionLoadingId(bookId);
    try {
      const formData = new FormData();
      formData.set('title', editingDraft.title.trim());
      formData.set('price', String(nextPrice));
      formData.set('stock', String(nextStock));
      formData.set('description', editingDraft.description);
      formData.set('cover_image', editingDraft.cover_image);
      formData.set('author_id', editingDraft.author_id);
      formData.set('category_id', editingDraft.category_id);
      if (editingDraft.cover_file) {
        formData.set('cover', editingDraft.cover_file);
      }

      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'PATCH',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Edit failed');
      }

      await loadData();
      cancelEditingBook();
      showToast('Книга обновлена');
    } catch (error) {
      console.error(error);
      showToast('Не удалось обновить книгу');
    } finally {
      setBookActionLoadingId(null);
    }
  };

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
    <main className="min-h-screen bg-[#F7F4EF] px-4 py-8">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm lg:sticky lg:top-24 lg:h-fit">
          <h1 className="font-serif text-2xl font-bold text-[#8B5E3C]">Admin Panel</h1>
          <p className="mt-1 text-sm text-zinc-500">CRM интернет-библиотеки</p>

          <nav className="mt-5 space-y-2">
            <button
              type="button"
              onClick={() => setActiveSection('dashboard')}
              className={`${sectionButtonClass} ${activeSection === 'dashboard' ? 'bg-amber-100 text-amber-900' : 'text-zinc-700 hover:bg-amber-50'}`}
            >
              Dashboard
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('books')}
              className={`${sectionButtonClass} ${activeSection === 'books' ? 'bg-amber-100 text-amber-900' : 'text-zinc-700 hover:bg-amber-50'}`}
            >
              Управление книгами
            </button>
            <button
              type="button"
              onClick={() => setActiveSection('orders')}
              className={`${sectionButtonClass} ${activeSection === 'orders' ? 'bg-amber-100 text-amber-900' : 'text-zinc-700 hover:bg-amber-50'}`}
            >
              Заказы
            </button>
          </nav>

          {toast && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              {toast}
            </div>
          )}
        </aside>

        <section className="space-y-6">
          {activeSection === 'dashboard' && (
            <>
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">Общая выручка</p>
                  <p className="mt-2 text-2xl font-bold text-amber-800">€{dashboardKpis.totalRevenue.toFixed(2)}</p>
                </article>
                <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">Всего заказов</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">{dashboardKpis.totalOrders}</p>
                </article>
                <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">Доставлено</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-700">{dashboardKpis.statusCounter.delivered}</p>
                </article>
                <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                  <p className="text-sm text-zinc-500">В обработке</p>
                  <p className="mt-2 text-2xl font-bold text-zinc-900">
                    {dashboardKpis.statusCounter.pending + dashboardKpis.statusCounter.paid + dashboardKpis.statusCounter.shipped}
                  </p>
                </article>
              </div>

              <div className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900">Заказы по статусам</h3>
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
                  <h3 className="text-lg font-semibold text-zinc-900">Выручка по месяцам</h3>
                  <div className="mt-4 h-72">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={dashboardKpis.revenueSeries}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#D97706" strokeWidth={3} dot={{ r: 3 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </article>
              </div>

              <div className="grid gap-6 xl:grid-cols-[1fr_340px]">
                <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900">Популярные книги</h3>
                  <ul className="mt-4 space-y-3">
                    {dashboardKpis.popularBooks.length === 0 ? (
                      <li className="text-sm text-zinc-500">Пока нет данных для популярности</li>
                    ) : (
                      dashboardKpis.popularBooks.map((item, index) => (
                        <li key={item.bookId} className="flex items-center justify-between rounded-xl border border-amber-100 bg-amber-50/70 px-4 py-3">
                          <div>
                            <p className="text-sm font-semibold text-zinc-900">#{index + 1} {item.title}</p>
                            <p className="text-xs text-zinc-500">ID: {item.bookId}</p>
                          </div>
                          <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-800">{item.count} шт.</span>
                        </li>
                      ))
                    )}
                  </ul>
                </article>

                <article className="rounded-2xl border border-amber-100 bg-white p-5 shadow-sm">
                  <h3 className="text-lg font-semibold text-zinc-900">Доля статусов</h3>
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
          )}

          {activeSection === 'books' && (
            <article className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#8B5E3C]">Управление книгами</h2>

              <form onSubmit={handleCreateBook} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  placeholder="Title"
                  value={bookForm.title}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, title: event.target.value }))}
                  required
                />
                <input
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="Price"
                  value={bookForm.price}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, price: event.target.value }))}
                  required
                />
                <input
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  type="number"
                  min="0"
                  placeholder="Stock"
                  value={bookForm.stock}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, stock: event.target.value }))}
                  required
                />
                <input
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  placeholder="Cover URL (optional)"
                  value={bookForm.cover_image}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, cover_image: event.target.value }))}
                />

                <select
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  value={bookForm.author_id}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, author_id: event.target.value }))}
                >
                  <option value="">Автор (не выбран)</option>
                  {authors.map((author) => (
                    <option key={author.id} value={author.id}>{author.name}</option>
                  ))}
                </select>

                <select
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  value={bookForm.category_id}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, category_id: event.target.value }))}
                >
                  <option value="">Категория (не выбрана)</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>

                <input
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  type="file"
                  accept="image/*"
                  onChange={(event) =>
                    setBookForm((prev) => ({ ...prev, cover_file: event.target.files?.[0] || null }))
                  }
                />

                <button
                  type="submit"
                  disabled={isCreatingBook}
                  className="rounded-xl bg-[#D97706] px-4 py-2 font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isCreatingBook ? 'Creating...' : 'Add Book'}
                </button>

                <textarea
                  className="rounded-xl border border-amber-200 px-3 py-2 md:col-span-2 xl:col-span-4"
                  placeholder="Description"
                  rows={2}
                  value={bookForm.description}
                  onChange={(event) => setBookForm((prev) => ({ ...prev, description: event.target.value }))}
                />
              </form>

              <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
                <input
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  placeholder="Поиск по title / author / description"
                  value={booksQuery}
                  onChange={(event) => setBooksQuery(event.target.value)}
                />
                <select
                  className="rounded-xl border border-amber-200 px-3 py-2"
                  value={booksCategoryFilter}
                  onChange={(event) => setBooksCategoryFilter(event.target.value)}
                >
                  <option value="all">Все категории</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>{category.name}</option>
                  ))}
                </select>
              </div>

              <div className="mt-6 overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-amber-100 text-left text-zinc-500">
                      <th className="px-3 py-2">Cover</th>
                      <th className="px-3 py-2">Title</th>
                      <th className="px-3 py-2">Price</th>
                      <th className="px-3 py-2">Stock</th>
                      <th className="px-3 py-2">Author</th>
                      <th className="px-3 py-2">Category</th>
                      <th className="px-3 py-2">Description</th>
                      <th className="px-3 py-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isLoading ? (
                      <tr>
                        <td className="px-3 py-4 text-zinc-500" colSpan={8}>Loading books...</td>
                      </tr>
                    ) : filteredBooks.length === 0 ? (
                      <tr>
                        <td className="px-3 py-4 text-zinc-500" colSpan={8}>Книги не найдены</td>
                      </tr>
                    ) : (
                      filteredBooks.map((book) => {
                        const isEditing = editingBookId === book.id;

                        return (
                          <tr key={book.id} className="border-b border-amber-50 align-top">
                            <td className="px-3 py-3">
                              <div className="h-16 w-12 overflow-hidden rounded bg-amber-100">
                                {normalizeCover(book.cover_image) ? (
                                  <img src={normalizeCover(book.cover_image) || ''} alt={book.title} className="h-full w-full object-cover" />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center text-[10px] text-amber-700">No cover</div>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  className="w-52 rounded-lg border border-amber-200 px-2 py-1"
                                  value={editingDraft.title}
                                  onChange={(event) => setEditingDraft((prev) => ({ ...prev, title: event.target.value }))}
                                />
                              ) : (
                                <span className="font-medium text-zinc-800">{book.title}</span>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  className="w-24 rounded-lg border border-amber-200 px-2 py-1"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  value={editingDraft.price}
                                  onChange={(event) => setEditingDraft((prev) => ({ ...prev, price: event.target.value }))}
                                />
                              ) : (
                                `€${book.price.toFixed(2)}`
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <input
                                  className="w-20 rounded-lg border border-amber-200 px-2 py-1"
                                  type="number"
                                  min="0"
                                  value={editingDraft.stock}
                                  onChange={(event) => setEditingDraft((prev) => ({ ...prev, stock: event.target.value }))}
                                />
                              ) : (
                                book.stock
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <select
                                  className="rounded-lg border border-amber-200 px-2 py-1"
                                  value={editingDraft.author_id}
                                  onChange={(event) => setEditingDraft((prev) => ({ ...prev, author_id: event.target.value }))}
                                >
                                  <option value="">—</option>
                                  {authors.map((author) => (
                                    <option key={author.id} value={author.id}>{author.name}</option>
                                  ))}
                                </select>
                              ) : (
                                book.author_name || '—'
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <select
                                  className="rounded-lg border border-amber-200 px-2 py-1"
                                  value={editingDraft.category_id}
                                  onChange={(event) => setEditingDraft((prev) => ({ ...prev, category_id: event.target.value }))}
                                >
                                  <option value="">—</option>
                                  {categories.map((category) => (
                                    <option key={category.id} value={category.id}>{category.name}</option>
                                  ))}
                                </select>
                              ) : (
                                book.category_name || '—'
                              )}
                            </td>
                            <td className="px-3 py-3">
                              {isEditing ? (
                                <div className="space-y-2">
                                  <textarea
                                    className="w-64 rounded-lg border border-amber-200 px-2 py-1"
                                    rows={2}
                                    value={editingDraft.description}
                                    onChange={(event) => setEditingDraft((prev) => ({ ...prev, description: event.target.value }))}
                                  />
                                  <input
                                    className="w-64 rounded-lg border border-amber-200 px-2 py-1"
                                    placeholder="Cover URL"
                                    value={editingDraft.cover_image}
                                    onChange={(event) => setEditingDraft((prev) => ({ ...prev, cover_image: event.target.value }))}
                                  />
                                  <input
                                    className="w-64 rounded-lg border border-amber-200 px-2 py-1"
                                    type="file"
                                    accept="image/*"
                                    onChange={(event) =>
                                      setEditingDraft((prev) => ({ ...prev, cover_file: event.target.files?.[0] || null }))
                                    }
                                  />
                                </div>
                              ) : (
                                <p className="line-clamp-2 max-w-xs text-xs text-zinc-600">{book.description || '—'}</p>
                              )}
                            </td>
                            <td className="px-3 py-3">
                              <div className="flex flex-wrap gap-2">
                                {isEditing ? (
                                  <>
                                    <button
                                      type="button"
                                      disabled={bookActionLoadingId === book.id}
                                      onClick={() => void handleSaveBook(book.id)}
                                      className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                                    >
                                      Save
                                    </button>
                                    <button
                                      type="button"
                                      disabled={bookActionLoadingId === book.id}
                                      onClick={cancelEditingBook}
                                      className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                                    >
                                      Cancel
                                    </button>
                                  </>
                                ) : (
                                  <button
                                    type="button"
                                    disabled={bookActionLoadingId === book.id}
                                    onClick={() => startEditingBook(book)}
                                    className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                                  >
                                    Edit
                                  </button>
                                )}
                                <button
                                  type="button"
                                  disabled={bookActionLoadingId === book.id}
                                  onClick={() => void handleDeleteBook(book.id)}
                                  className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </article>
          )}

          {activeSection === 'orders' && (
            <article className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
              <h2 className="font-serif text-2xl font-bold text-[#8B5E3C]">Управление заказами</h2>

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
                                  {item.title} × {item.quantity} (€{item.price.toFixed(2)})
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
          )}
        </section>
      </div>
    </main>
  );
}
