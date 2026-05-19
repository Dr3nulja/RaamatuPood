'use client';

import React, { useEffect, useMemo, useState } from 'react';
import type {
  AdminBook,
  AdminBooksResponse,
  AdminCategoryOption,
  AdminAuthorOption,
  AdminLanguageOption,
} from '@/lib/api/adminTypes';
import Button from '@/components/ui/Button';
import AddableSelect from '@/components/admin/AddableSelect';
import EditBookModal from '@/components/admin/EditBookModal';
import BookCard from '@/components/admin/BookCard';
import Modal from '@/components/ui/Modal';
import CoverImageUploader from '@/components/admin/CoverImageUploader';
import { useTranslation } from '@/hooks/useTranslation';

type BookFormState = {
  title: string;
  price: string;
  stock: string;
  description: string;
  language_id: string;
  publication_year: string;
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
  language_id: '',
  publication_year: new Date().getFullYear().toString(),
  cover_image: '',
  uploaded_cover_url: '',
  author_id: '',
  category_id: '',
  cover_file: null,
};

export default function AdminBooksView() {
  const { t } = useTranslation();
  const [books, setBooks] = useState<AdminBook[]>([]);
  const [authors, setAuthors] = useState<AdminAuthorOption[]>([]);
  const [categories, setCategories] = useState<AdminCategoryOption[]>([]);
  const [languages, setLanguages] = useState<AdminLanguageOption[]>([]);

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
        const errorMessage = uploadPayload?.error || t('admin.books.uploadFailed');
        console.error('Cover upload failed:', errorMessage);
        
        // Show warning toast but don't crash the flow
        showToast(t('admin.books.uploadWarning', { error: errorMessage }));
        return '';
      }

      if (!uploadPayload?.url) {
        console.error('Cover upload: No URL returned');
        showToast(t('admin.books.uploadNoUrl'));
        return '';
      }

      return uploadPayload.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('admin.books.uploadUnknown');
      console.error('Cover upload exception:', errorMessage);
      showToast(t('admin.books.uploadError', { error: errorMessage }));
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
      throw new Error(payload?.error || t('admin.books.createAuthorFailed'));
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
      throw new Error(payload?.error || t('admin.books.createCategoryFailed'));
    }

    // Reload categories after creation
    const updatedCategories = await fetch('/api/admin/books', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json() as Promise<{ categories?: AdminCategoryOption[] }>)
      .then((data) => data.categories || [])
      .catch(() => categories);

    setCategories(updatedCategories);

    return payload.category;
  };

  const createLanguage = async (name: string) => {
    const response = await fetch('/api/languages', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name }),
    });

    const payload = (await response.json().catch(() => null)) as { language?: { id: number; name: string }; error?: string } | null;

    if (!response.ok || !payload?.language) {
      throw new Error(payload?.error || t('admin.books.createLanguageFailed'));
    }

    // Reload languages after creation
    const updatedLanguages = await fetch('/api/admin/books', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json() as Promise<{ languages?: AdminLanguageOption[] }>)
      .then((data) => data.languages || [])
      .catch(() => languages);

    setLanguages(updatedLanguages);

    return payload.language;
  };

  const loadBooksData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/books', { cache: 'no-store', credentials: 'include' });
      if (!response.ok) {
        throw new Error(t('admin.books.loadFailed'));
      }

      const data = (await response.json()) as AdminBooksResponse;
      setBooks(data.books || []);
      setAuthors(data.authors || []);
      setCategories(data.categories || []);
      setLanguages(data.languages || []);

      // Reset form - don't set default language, let user select it
      setBookForm((prev) => ({ ...prev, author_id: '', category_id: '', language_id: '' }));
    } catch (error) {
      console.error('Books load failed:', error);
      showToast(t('admin.books.loadFailed'));
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
      formData.set('language_id', bookForm.language_id);
      formData.set('publication_year', bookForm.publication_year);
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
        throw new Error(t('admin.books.createFailed'));
      }

      setBookForm(initialBookForm);
      showToast(t('admin.books.added'));
      await loadBooksData();
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : t('admin.books.createFailed'));
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
        throw new Error(t('admin.books.deleteFailed'));
      }

      setBooks((prev) => prev.filter((book) => book.id !== id));
      showToast(t('admin.books.deleted'));
    } catch (error) {
      console.error(error);
      showToast(t('admin.books.deleteFailed'));
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
        throw new Error(t('admin.books.editFailed'));
      }

      await loadBooksData();
      cancelEditingBook();
      showToast(t('admin.books.updated'));
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : t('admin.books.updateFailed'));
      throw error;
    }
  };

  return (
    <article className="rounded-2xl border border-amber-100 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-2xl font-bold text-secondary">{t('admin.books.title')}</h2>

      {toast && (
        <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-sm font-semibold text-amber-800">
          {toast}
        </div>
      )}

      <form onSubmit={handleCreateBook} className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <input
          className="rounded-xl border border-amber-200 px-3 py-2"
          placeholder={t('admin.books.fields.title')}
          value={bookForm.title}
          onChange={(event) => setBookForm((prev) => ({ ...prev, title: event.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-amber-200 px-3 py-2"
          type="number"
          step="0.01"
          min="0"
          placeholder={t('admin.books.fields.price')}
          value={bookForm.price}
          onChange={(event) => setBookForm((prev) => ({ ...prev, price: event.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-amber-200 px-3 py-2"
          type="number"
          min="0"
          placeholder={t('admin.books.fields.stock')}
          value={bookForm.stock}
          onChange={(event) => setBookForm((prev) => ({ ...prev, stock: event.target.value }))}
          required
        />
        <input
          className="rounded-xl border border-amber-200 px-3 py-2"
          type="number"
          min="1000"
          max="9999"
          placeholder={t('admin.books.fields.year')}
          value={bookForm.publication_year}
          onChange={(event) => setBookForm((prev) => ({ ...prev, publication_year: event.target.value }))}
          required
        />

        <CoverImageUploader
          coverUrl={bookForm.cover_image}
          coverFile={bookForm.cover_file}
          onUrlChange={(url) => setBookForm((prev) => ({ ...prev, cover_image: url }))}
          onFileChange={(file) => setBookForm((prev) => ({ ...prev, cover_file: file }))}
        />

        <div>
          <AddableSelect
            items={languages}
            value={bookForm.language_id}
            onChange={(value) => setBookForm((prev) => ({ ...prev, language_id: value }))}
            onCreateNew={createLanguage}
            placeholder={t('admin.books.selectLanguage')}
            label={t('admin.books.language')}
          />
        </div>

        

        <div>
          <AddableSelect
            items={authors}
            value={bookForm.author_id}
            onChange={(value) => setBookForm((prev) => ({ ...prev, author_id: value }))}
            onCreateNew={createAuthor}
            placeholder={t('admin.books.selectAuthor')}
            label={t('admin.books.author')}
          />
        </div>

        <div>
          <AddableSelect
            items={categories}
            value={bookForm.category_id}
            onChange={(value) => setBookForm((prev) => ({ ...prev, category_id: value }))}
            onCreateNew={createCategory}
            placeholder={t('admin.books.selectCategory')}
            label={t('admin.books.category')}
          />
        </div>

        <textarea
          className="rounded-xl border border-amber-200 px-3 py-2 md:col-span-2 xl:col-span-4"
          placeholder={t('admin.books.fields.description')}
          rows={2}
          value={bookForm.description}
          onChange={(event) => setBookForm((prev) => ({ ...prev, description: event.target.value }))}
        />


        <Button
          type="submit"
          loading={isCreatingBook}
          disabled={isCreatingBook}
          className="rounded-xl px-4 py-2"
        >
          {isCreatingBook ? t('admin.common.creating') : t('admin.common.addBook')}
        </Button>

        <p className="text-xs text-zinc-500 md:col-span-2 xl:col-span-4">
          {t('admin.books.requiredHint')}
        </p>

        
      </form>

      <div className="mt-6 grid gap-3 md:grid-cols-[1fr_220px]">
        <input
          className="rounded-xl border border-amber-200 px-3 py-2"
          placeholder={t('admin.books.searchPlaceholder')}
          value={booksQuery}
          onChange={(event) => setBooksQuery(event.target.value)}
        />
        <select
          className="rounded-xl border border-amber-200 px-3 py-2"
          value={booksCategoryFilter}
          onChange={(event) => setBooksCategoryFilter(event.target.value)}
        >
          <option value="all">{t('admin.books.allCategories')}</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="rounded-3xl border border-amber-100 bg-amber-50/40 px-6 py-10 text-center text-sm text-zinc-500 shadow-sm">
            {t('admin.books.loading')}
          </div>
        ) : filteredBooks.length === 0 ? (
          <div className="rounded-3xl border border-amber-100 bg-white px-6 py-10 text-center text-sm text-zinc-500 shadow-sm">
            {t('admin.books.noneFound')}
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
        languages={languages}
        onSave={handleSaveBook}
        setAuthors={setAuthors}
        setCategories={setCategories}
        setLanguages={setLanguages}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={isDeleteConfirmOpen && Boolean(bookToDelete)}
        onClose={() => {
          setIsDeleteConfirmOpen(false);
          setBookToDelete(null);
        }}
        title={t('admin.books.deleteTitle')}
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
              {t('admin.common.cancel')}
            </Button>
            <Button
              type="button"
              onClick={() => void handleDeleteBook()}
              disabled={!bookToDelete || bookActionLoadingId === bookToDelete.id}
              className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 font-semibold text-red-300 hover:bg-red-100 disabled:opacity-60"
            >
              {t('admin.common.delete')}
            </Button>
          </div>
        }
      >
        <p className="text-zinc-600">
          {t('admin.books.deleteConfirmPrefix')} &quot;<span className="font-semibold">{bookToDelete?.title}</span>&quot;? {t('admin.books.deleteConfirmSuffix')}
        </p>
      </Modal>
    </article>
  );
}
