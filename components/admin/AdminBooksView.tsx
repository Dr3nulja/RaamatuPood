'use client';

import { useEffect, useMemo, useState } from 'react';
import type {
  AdminBook,
  AdminBooksResponse,
  AdminCategoryOption,
  AdminAuthorOption,
} from '@/lib/api/adminTypes';
import Button from '@/components/ui/Button';
import { normalizeCover } from '@/components/admin/shared';

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

export default function AdminBooksView() {
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [authors, setAuthors] = useState<AdminAuthorOption[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);

  const [bookForm, setBookForm] = useState<BookFormState>(initialBookForm);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingBook, setIsCreatingBook] = useState(false);
  const [bookActionLoadingId, setBookActionLoadingId] = useState<number | null>(null);

  const [booksQuery, setBooksQuery] = useState('');
  const [booksCategoryFilter, setBooksCategoryFilter] = useState('all');

  const [editingBookId, setEditingBookId] = useState<number | null>(null);
  const [editingDraft, setEditingDraft] = useState<BookFormState>(initialBookForm);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const loadBooksData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/books', { cache: 'no-store', credentials: 'include' });
      if (!response.ok) {
        throw new Error('Failed to load admin books');
      }

      const data = (await response.json()) as AdminBooksResponse;
      setBooks(data.books || []);
      setAuthors(data.authors || []);
      setCategories(data.categories || []);
    } catch (error) {
      console.error('Books load failed:', error);
      showToast('Ошибка загрузки книг');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadBooksData();
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
      await loadBooksData();
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

      await loadBooksData();
      cancelEditingBook();
      showToast('Книга обновлена');
    } catch (error) {
      console.error(error);
      showToast('Не удалось обновить книгу');
    } finally {
      setBookActionLoadingId(null);
    }
  };

  return (
    <article className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl font-bold text-secondary">Управление книгами</h2>

      {toast && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          {toast}
        </div>
      )}

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

        <Button
          type="submit"
          loading={isCreatingBook}
          disabled={isCreatingBook}
          className="rounded-xl px-4 py-2"
        >
          {isCreatingBook ? 'Creating...' : 'Add Book'}
        </Button>

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
                          <option value="">-</option>
                          {authors.map((author) => (
                            <option key={author.id} value={author.id}>{author.name}</option>
                          ))}
                        </select>
                      ) : (
                        book.author_name || '-'
                      )}
                    </td>
                    <td className="px-3 py-3">
                      {isEditing ? (
                        <select
                          className="rounded-lg border border-amber-200 px-2 py-1"
                          value={editingDraft.category_id}
                          onChange={(event) => setEditingDraft((prev) => ({ ...prev, category_id: event.target.value }))}
                        >
                          <option value="">-</option>
                          {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                          ))}
                        </select>
                      ) : (
                        book.category_name || '-'
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
                        <p className="line-clamp-2 max-w-xs text-xs text-zinc-600">{book.description || '-'}</p>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-2">
                        {isEditing ? (
                          <>
                            <Button
                              type="button"
                              variant="ghost"
                              size="small"
                              disabled={bookActionLoadingId === book.id}
                              onClick={() => void handleSaveBook(book.id)}
                              className="rounded-lg border border-emerald-300 px-2 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-50 disabled:opacity-60"
                            >
                              Save
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              size="small"
                              disabled={bookActionLoadingId === book.id}
                              onClick={cancelEditingBook}
                              className="rounded-lg px-2 py-1 text-xs font-semibold disabled:opacity-60"
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            variant="outline"
                            size="small"
                            disabled={bookActionLoadingId === book.id}
                            onClick={() => startEditingBook(book)}
                            className="rounded-lg px-2 py-1 text-xs font-semibold disabled:opacity-60"
                          >
                            Edit
                          </Button>
                        )}
                        <Button
                          type="button"
                          variant="ghost"
                          size="small"
                          disabled={bookActionLoadingId === book.id}
                          onClick={() => void handleDeleteBook(book.id)}
                          className="rounded-lg border border-red-300 px-2 py-1 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-60"
                        >
                          Delete
                        </Button>
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
  );
}
