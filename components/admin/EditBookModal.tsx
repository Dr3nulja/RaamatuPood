'use client';

import { useState, useEffect } from 'react';
import type { AdminBook, AdminAuthorOption, AdminCategoryOption, AdminLanguageOption } from '@/lib/api/adminTypes';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import AddableSelect from '@/components/admin/AddableSelect';
import CoverImageUploader from '@/components/admin/CoverImageUploader';
import { useTranslation } from '@/hooks/useTranslation';

interface EditBookModalProps {
  isOpen: boolean;
  onClose: () => void;
  book: AdminBook | null;
  authors: AdminAuthorOption[];
  categories: AdminCategoryOption[];
  languages: AdminLanguageOption[];
  onSave: (bookId: number, data: FormData) => Promise<void>;
  isLoading?: boolean;
  setAuthors: (authors: AdminAuthorOption[]) => void;
  setCategories: (categories: AdminCategoryOption[]) => void;
  setLanguages: (languages: AdminLanguageOption[]) => void;
}

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

export default function EditBookModal({
  isOpen,
  onClose,
  book,
  authors,
  categories,
  languages,
  onSave,
  isLoading = false,
  setAuthors,
  setCategories,
  setLanguages,
}: EditBookModalProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<BookFormState>(initialBookForm);
  const [isSaving, setIsSaving] = useState(false);

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
        const errorMessage = uploadPayload?.error || t('admin.editBook.uploadFailed');
        console.error(t('admin.editBook.uploadFailed'), errorMessage);
        return '';
      }

      if (!uploadPayload?.url) {
        console.error(t('admin.editBook.uploadNoUrl'));
        return '';
      }

      return uploadPayload.url;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : t('admin.editBook.uploadUnknown');
      console.error(t('admin.editBook.uploadException'), errorMessage);
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
      throw new Error(payload?.error || t('admin.editBook.createAuthorFailed'));
    }

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
      throw new Error(payload?.error || t('admin.editBook.createCategoryFailed'));
    }

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
      throw new Error(payload?.error || t('admin.editBook.createLanguageFailed'));
    }

    const updatedLanguages = await fetch('/api/admin/books', { cache: 'no-store', credentials: 'include' })
      .then((r) => r.json() as Promise<{ languages?: AdminLanguageOption[] }>)
      .then((data) => data.languages || [])
      .catch(() => languages);

    setLanguages(updatedLanguages);
    return payload.language;
  };

  useEffect(() => {
    if (isOpen && book) {
      // Find language ID from book's language name
      const languageId = languages.find(l => l.name === book.language)?.id.toString() || '';
      
      setFormData({
        title: book.title,
        price: String(book.price),
        stock: String(book.stock),
        description: book.description || '',
        language_id: languageId,
        publication_year: String(book.publication_year),
        cover_image: book.cover_image || '',
        uploaded_cover_url: '',
        author_id: book.author_id ? String(book.author_id) : '',
        category_id: book.category_id ? String(book.category_id) : '',
        cover_file: null,
      });
    }
  }, [isOpen, book, languages]);

  const handleSave = async () => {
    if (!book || !formData.title.trim()) {
      return;
    }

    const nextPrice = Number(formData.price);
    const nextStock = Number(formData.stock);
    const nextYear = Number(formData.publication_year);
    if (!Number.isFinite(nextPrice) || !Number.isInteger(nextStock) || nextStock < 0) {
      return;
    }
    if (!Number.isInteger(nextYear) || nextYear < 1000 || nextYear > 9999) {
      return;
    }

    setIsSaving(true);
    try {
      const payload = new FormData();
      payload.set('title', formData.title.trim());
      payload.set('price', String(nextPrice));
      payload.set('stock', String(nextStock));
      payload.set('description', formData.description);
      payload.set('language_id', formData.language_id);
      payload.set('publication_year', String(nextYear));
      payload.set('cover_image', formData.cover_image);
      payload.set('author_id', formData.author_id);
      payload.set('category_id', formData.category_id);

      const uploadedCoverUrl = formData.cover_file ? await uploadCoverFile(formData.cover_file) : '';
      payload.set('uploaded_cover_url', uploadedCoverUrl);

      await onSave(book.id, payload);
      onClose();
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('admin.editBook.modalTitle', { title: book?.title || '' })}
      size="lg"
      footer={
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isSaving}
            className="flex-1"
          >
              {t('admin.common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => void handleSave()}
            loading={isSaving}
            disabled={isSaving}
            className="flex-1"
          >
            {t('admin.common.saveChanges')}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Cover Image Uploader */}
        <CoverImageUploader
          coverUrl={formData.cover_image}
          coverFile={formData.cover_file}
          onUrlChange={(url) => setFormData((prev) => ({ ...prev, cover_image: url }))}
          onFileChange={(file) => setFormData((prev) => ({ ...prev, cover_file: file }))}
        />

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700">{t('admin.editBook.title')}</label>
          <input
            type="text"
            value={formData.title}
            onChange={(event) => setFormData((prev) => ({ ...prev, title: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
            required
          />
        </div>

        {/* Price & Stock */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-zinc-700">{t('admin.editBook.price')}</label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(event) => setFormData((prev) => ({ ...prev, price: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700">{t('admin.editBook.stock')}</label>
            <input
              type="number"
              min="0"
              value={formData.stock}
              onChange={(event) => setFormData((prev) => ({ ...prev, stock: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        {/* Language & Publication Year */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-zinc-700">{t('admin.editBook.language')}</label>
            <div className="mt-2">
              <AddableSelect
                items={languages}
                value={formData.language_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, language_id: value }))}
                onCreateNew={createLanguage}
                placeholder={t('admin.editBook.selectLanguage')}
                label={t('admin.editBook.language')}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700">{t('admin.editBook.publicationYear')}</label>
            <input
              type="number"
              min="1000"
              max="9999"
              value={formData.publication_year}
              onChange={(event) => setFormData((prev) => ({ ...prev, publication_year: event.target.value }))}
              className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
              required
            />
          </div>
        </div>

        {/* Author & Category */}
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-semibold text-zinc-700">{t('admin.editBook.author')}</label>
            <div className="mt-2">
              <AddableSelect
                items={authors}
                value={formData.author_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, author_id: value }))}
                onCreateNew={createAuthor}
                placeholder={t('admin.editBook.selectAuthor')}
                label={t('admin.editBook.author')}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-zinc-700">{t('admin.editBook.category')}</label>
            <div className="mt-2">
              <AddableSelect
                items={categories}
                value={formData.category_id}
                onChange={(value) => setFormData((prev) => ({ ...prev, category_id: value }))}
                onCreateNew={createCategory}
                placeholder={t('admin.editBook.selectCategory')}
                label={t('admin.editBook.category')}
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-zinc-700">{t('admin.editBook.description')}</label>
          <textarea
            value={formData.description}
            onChange={(event) => setFormData((prev) => ({ ...prev, description: event.target.value }))}
            className="mt-2 w-full rounded-lg border border-amber-200 px-3 py-2 text-sm"
            rows={4}
          />
        </div>
      </div>
    </Modal>
  );
}
