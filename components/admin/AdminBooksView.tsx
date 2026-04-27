'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type {
  AdminBook,
  AdminBooksResponse,
  AdminCategoryOption,
  AdminAuthorOption,
} from '@/lib/api/adminTypes';
import Button from '@/components/ui/Button';
import AddableSelect from '@/components/admin/AddableSelect';
import EditBookModal from '@/components/admin/EditBookModal';
import BookCard from '@/components/admin/BookCard';
import Modal from '@/components/ui/Modal';

type BookFormState = {
  title: string;
  price: string;
  stock: string;
  description: string;
  cover_image: string;
  uploaded_cover_url: string;
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
  uploaded_cover_url: '',
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEditBook, setSelectedEditBook] = useState<AdminBook | null>(null);

  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [bookToDelete, setBookToDelete] = useState<AdminBook | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const uploadCoverFile = async (file: File): Promise<string> => {
    try {
      const uploadData = new FormData();
      uploadData.set('file', file);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        credentials: 'include',
        body: uploadData,
      });

      const uploadPayload = (await uploadResponse.json().catch(() => null)) as { url?: string; error?: string } | null;

      if (!uploadResponse.ok) {
        const errorMessage = uploadPayload?.error || 'Failed to upload cover file';
        console.error('Cover upload failed:', errorMessage);
        
        // Show warning toast but don't crash the flow
        showToast(`Warning: ${errorMessage}. Use cover URL or try again.`);
        return '';
      }

      if (!uploadPayload?.url) {
        console.error('Cover upload: No URL returned');
        showToast('Warning: Server did not return a cover URL. Use a manual URL.');
        return '';
      }

      return uploadPayload.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown upload error';
      console.error('Cover upload exception:', errorMessage);
      showToast(`Upload error: ${errorMessage}`);
      return '';
    }
  };

  const createAuthor = async (name: string) => {
    const response = await fetch('/api/authors', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const payload = (await response.json().catch(() => null)) as { author?: { id: number; name: string }; error?: string } | null;

    if (!response.ok || !payload?.author) {
      throw new Error(payload?.error || 'Failed to create author');
    }

    // Reload authors after creation
    const updatedAuthors = await fetch('/api/admin/books', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json() as Promise<{ authors?: AdminAuthorOption[] }>)
      .then((data) => data.authors || [])
      .catch(() => authors);

    setAuthors(updatedAuthors);

    return payload.author;
  };

  const createCategory = async (name: string) => {
    const response = await fetch('/api/categories', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const payload = (await response.json().catch(() => null)) as { category?: { id: number; name: string }; error?: string } | null;

    if (!response.ok || !payload?.category) {
      throw new Error(payload?.error || 'Failed to create category');
    }

    // Reload categories after creation
    const updatedCategories = await fetch('/api/admin/books', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json() as Promise<{ categories?: AdminCategoryOption[] }>)
      .then((data) => data.categories || [])
      .catch(() => categories);

    setCategories(updatedCategories);

    return payload.category;
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

      // Reset form if any new items were created
      setBookForm((prev) => ({ ...prev, author_id: '', category_id: '' }));
    } catch (error) {
      console.error('Books load failed:', error);
      showToast('Failed to load books');
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
    setSelectedEditBook(book);
    setIsEditModalOpen(true);
  };

  const cancelEditingBook = () => {
    setIsEditModalOpen(false);
    setSelectedEditBook(null);
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

      const uploadedCoverUrl = bookForm.cover_file ? await uploadCoverFile(bookForm.cover_file) : '';
      formData.set('uploaded_cover_url', uploadedCoverUrl);

      const response = await fetch('/api/admin/books', {
        method: 'POST',
        credentials: 'include',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Create book failed');
      }

      setBookForm(initialBookForm);
      showToast('Book added');
      await loadBooksData();
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Failed to create book');
    } finally {
      setIsCreatingBook(false);
    }
  };

  const openDeleteConfirm = (book: AdminBook) => {
    setBookToDelete(book);
    setIsDeleteConfirmOpen(true);
  };

  const handleDeleteBook = async () => {
    if (!bookToDelete) return;
    
    const id = bookToDelete.id;
    setBookActionLoadingId(id);
    setIsDeleteConfirmOpen(false);
    
    try {
      const response = await fetch(`/api/admin/books/${id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setBooks((prev) => prev.filter((book) => book.id !== id));
      showToast('Book deleted');
    } catch (error) {
      console.error(error);
      showToast('Failed to delete book');
    } finally {
      setBookActionLoadingId(null);
      setBookToDelete(null);
    }
  };

  const handleSaveBook = async (bookId: number, formData: FormData) => {
    try {
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
      showToast('Book updated');
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : 'Failed to update book');
      throw error;
    }
  };

  return (
    <article className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl font-bold text-secondary">Books management</h2>

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

        <div>
          <AddableSelect
            items={authors}
            value={bookForm.author_id}
            onChange={(value) => setBookForm((prev) => ({ ...prev, author_id: value }))}
            onCreateNew={createAuthor}
            placeholder="Select author..."
            label="Author"
          />
        </div>

        <div>
          <AddableSelect
            items={categories}
            value={bookForm.category_id}
            onChange={(value) => setBookForm((prev) => ({ ...prev, category_id: value }))}
            onCreateNew={createCategory}
            placeholder="Select category..."
            label="Category"
          />
        </div>

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

        <p className="text-xs text-zinc-500 md:col-span-2 xl:col-span-4">
          Cover: paste URL or upload a file. If both are provided, uploaded file has priority.
        </p>

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
          placeholder="Search by title / author / description"
          value={booksQuery}
          onChange={(event) => setBooksQuery(event.target.value)}
        />
        <select
          className="rounded-xl border border-amber-200 px-3 py-2"
          value={booksCategoryFilter}
          onChange={(event) => setBooksCategoryFilter(event.target.value)}
        >
          <option value="all">All categories</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-3xl border border-amber-100 bg-amber-50/40 px-6 py-10 text-center text-sm text-zinc-500 shadow-sm">
            Loading books...
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-3xl border border-amber-100 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm">
            No books found
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {filteredBooks.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onEdit={startEditingBook}
                onDelete={openDeleteConfirm}
                isDeleting={bookActionLoadingId === book.id}
              />
            ))}
          </div>
        )}
      </div>

      {/* Edit Book Modal */}
      <EditBookModal
        isOpen={isEditModalOpen}
        onClose={cancelEditingBook}
        book={selectedEditBook}
        authors={authors}
        categories={categories}
        onSave={handleSaveBook}
        setAuthors={setAuthors}
        setCategories={setCategories}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen && Boolean(bookToDelete)}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setBookToDelete(null);
        }}
        title="Delete book?"
        size="md"
        footer={
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsDeleteConfirmOpen(false);
                setBookToDelete(null);
              }}
              className="rounded-lg px-4 py-2 font-semibold"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handleDeleteBook()}
              disabled={!bookToDelete || bookActionLoadingId === bookToDelete.id}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 font-semibold text-red-300 hover:bg-red-100 disabled:opacity-60"
            >
              Delete
            </Button>
          </div>
        }
      >
        <p className="text-zinc-600">
          Are you sure you want to delete "<span className="font-semibold">{bookToDelete?.title}</span>"? This action cannot be undone.
        </p>
      </Modal>
    </article>
  );
}
