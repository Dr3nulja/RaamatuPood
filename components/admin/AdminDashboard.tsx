'use client';

import { useEffect, useMemo, useState } from 'react';
import type { AdminBook, AdminOrder, AdminOrdersResponse, AdminBooksResponse } from '@/lib/api/adminTypes';

type BookFormState = {
  title: string;
  price: string;
  stock: string;
  description: string;
  cover_image: string;
  author_id: string;
  category_id: string;
};

const initialBookForm: BookFormState = {
  title: '',
  price: '',
  stock: '',
  description: '',
  cover_image: '',
  author_id: '',
  category_id: '',
};

const orderStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;
type OrderStatus = (typeof orderStatuses)[number];

export default function AdminDashboard() {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [bookForm, setBookForm] = useState<BookFormState>(initialBookForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [bookActionLoadingId, setBookActionLoadingId] = useState<number | null>(null);
  const [orderActionLoadingId, setOrderActionLoadingId] = useState<number | null>(null);
  const [stockInputs, setStockInputs] = useState<Record<number, string>>({});
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
      setStockInputs(
        Object.fromEntries(booksData.books.map((book) => [book.id, String(book.stock)]))
      );
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

  const sortedBooks = useMemo(() => [...books].sort((a, b) => b.id - a.id), [books]);

  const handleCreateBook = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsCreatingBook(true);

    try {
      const response = await fetch('/api/admin/books', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: bookForm.title,
          price: Number(bookForm.price),
          stock: Number(bookForm.stock),
          description: bookForm.description || null,
          cover_image: bookForm.cover_image || null,
          author_id: bookForm.author_id ? Number(bookForm.author_id) : null,
          category_id: bookForm.category_id ? Number(bookForm.category_id) : null,
        }),
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

  const handleEditBook = async (book: AdminBook) => {
    const nextTitle = window.prompt('Title', book.title)?.trim();
    if (!nextTitle) {
      return;
    }

    const nextPriceRaw = window.prompt('Price', String(book.price));
    const nextStockRaw = window.prompt('Stock', String(book.stock));

    if (nextPriceRaw === null || nextStockRaw === null) {
      return;
    }

    const nextPrice = Number(nextPriceRaw);
    const nextStock = Number(nextStockRaw);

    if (!Number.isFinite(nextPrice) || !Number.isInteger(nextStock) || nextStock < 0) {
      showToast('Неверные price/stock');
      return;
    }

    setBookActionLoadingId(book.id);
    try {
      const response = await fetch(`/api/admin/books/${book.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          title: nextTitle,
          price: nextPrice,
          stock: nextStock,
        }),
      });

      if (!response.ok) {
        throw new Error('Edit failed');
      }

      setBooks((prev) =>
        prev.map((item) =>
          item.id === book.id
            ? {
                ...item,
                title: nextTitle,
                price: nextPrice,
                stock: nextStock,
              }
            : item
        )
      );
      setStockInputs((prev) => ({ ...prev, [book.id]: String(nextStock) }));
      showToast('Книга обновлена');
    } catch (error) {
      console.error(error);
      showToast('Не удалось обновить книгу');
    } finally {
      setBookActionLoadingId(null);
    }
  };

  const handleUpdateStock = async (bookId: number) => {
    const nextStock = Number(stockInputs[bookId]);
    if (!Number.isInteger(nextStock) || nextStock < 0) {
      showToast('Stock должен быть целым числом ≥ 0');
      return;
    }

    setBookActionLoadingId(bookId);
    try {
      const response = await fetch(`/api/admin/books/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ stock: nextStock }),
      });

      if (!response.ok) {
        throw new Error('Stock update failed');
      }

      setBooks((prev) => prev.map((book) => (book.id === bookId ? { ...book, stock: nextStock } : book)));
      showToast('Stock обновлён');
    } catch (error) {
      console.error(error);
      showToast('Не удалось обновить stock');
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
    <main className="min-h-screen bg-[#FDF8F0] px-4 py-10">
      <div className="mx-auto max-w-7xl space-y-8">
        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <h1 className="font-serif text-3xl font-bold text-[#8B5E3C]">Admin Panel</h1>
          <p className="mt-2 text-zinc-600">Управление книгами и заказами</p>
          {toast && (
            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
              {toast}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#8B5E3C]">Books</h2>

          <form onSubmit={handleCreateBook} className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input className="rounded-xl border border-amber-200 px-3 py-2" placeholder="Title" value={bookForm.title} onChange={(e) => setBookForm((prev) => ({ ...prev, title: e.target.value }))} required />
            <input className="rounded-xl border border-amber-200 px-3 py-2" type="number" step="0.01" min="0" placeholder="Price" value={bookForm.price} onChange={(e) => setBookForm((prev) => ({ ...prev, price: e.target.value }))} required />
            <input className="rounded-xl border border-amber-200 px-3 py-2" type="number" min="0" placeholder="Stock" value={bookForm.stock} onChange={(e) => setBookForm((prev) => ({ ...prev, stock: e.target.value }))} required />
            <input className="rounded-xl border border-amber-200 px-3 py-2" placeholder="Cover image URL" value={bookForm.cover_image} onChange={(e) => setBookForm((prev) => ({ ...prev, cover_image: e.target.value }))} />
            <input className="rounded-xl border border-amber-200 px-3 py-2 md:col-span-2" placeholder="Description" value={bookForm.description} onChange={(e) => setBookForm((prev) => ({ ...prev, description: e.target.value }))} />
            <input className="rounded-xl border border-amber-200 px-3 py-2" placeholder="Author ID (optional)" value={bookForm.author_id} onChange={(e) => setBookForm((prev) => ({ ...prev, author_id: e.target.value }))} />
            <input className="rounded-xl border border-amber-200 px-3 py-2" placeholder="Category ID (optional)" value={bookForm.category_id} onChange={(e) => setBookForm((prev) => ({ ...prev, category_id: e.target.value }))} />

            <button
              type="submit"
              disabled={isCreatingBook}
              className="rounded-xl bg-[#D97706] px-4 py-2 font-semibold text-white transition hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isCreatingBook ? 'Creating...' : 'Add Book'}
            </button>
          </form>

          <div className="mt-6 overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="border-b border-amber-100 text-left text-zinc-500">
                  <th className="px-3 py-2">Title</th>
                  <th className="px-3 py-2">Price</th>
                  <th className="px-3 py-2">Stock</th>
                  <th className="px-3 py-2">Category</th>
                  <th className="px-3 py-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td className="px-3 py-4 text-zinc-500" colSpan={5}>Loading books...</td>
                  </tr>
                ) : (
                  sortedBooks.map((book) => (
                    <tr key={book.id} className="border-b border-amber-50 align-top">
                      <td className="px-3 py-3 font-medium text-zinc-800">{book.title}</td>
                      <td className="px-3 py-3">€{book.price.toFixed(2)}</td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2">
                          <input
                            className="w-20 rounded-lg border border-amber-200 px-2 py-1"
                            type="number"
                            min="0"
                            value={stockInputs[book.id] ?? String(book.stock)}
                            onChange={(event) =>
                              setStockInputs((prev) => ({ ...prev, [book.id]: event.target.value }))
                            }
                          />
                          <button
                            type="button"
                            disabled={bookActionLoadingId === book.id}
                            onClick={() => void handleUpdateStock(book.id)}
                            className="rounded-lg border border-amber-300 px-2 py-1 text-xs font-semibold text-amber-800 hover:bg-amber-50 disabled:opacity-60"
                          >
                            Save
                          </button>
                        </div>
                      </td>
                      <td className="px-3 py-3">{book.category_name || '—'}</td>
                      <td className="px-3 py-3">
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={bookActionLoadingId === book.id}
                            onClick={() => void handleEditBook(book)}
                            className="rounded-lg border border-zinc-300 px-2 py-1 text-xs font-semibold text-zinc-700 hover:bg-zinc-50 disabled:opacity-60"
                          >
                            Edit
                          </button>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
          <h2 className="font-serif text-2xl font-bold text-[#8B5E3C]">Orders</h2>

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
                ) : (
                  orders.map((order) => (
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
        </section>
      </div>
    </main>
  );
}
