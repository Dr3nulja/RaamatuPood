'use client';

import { useEffect, useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import Modal from '@/components/ui/Modal';
import { useTranslation } from '@/hooks/useTranslation';

type MetadataItem = {
  id: number;
  name: string;
};

type MetadataManagerProps = {
  title: string;
  description: string;
  entityLabel: string;
  listEndpoint: string;
  itemLabel: string;
  collectionKey: 'authors' | 'categories';
};

function sortItems(items: MetadataItem[]) {
  return [...items].sort((left, right) => left.name.localeCompare(right.name, undefined, { sensitivity: 'base' }));
}

async function readErrorMessage(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as { error?: string } | null;
  return payload?.error || fallback;
}

export default function MetadataManager({
  title,
  description,
  entityLabel,
  listEndpoint,
  itemLabel,
  collectionKey,
}: MetadataManagerProps) {
  const { t } = useTranslation();
  const [items, setItems] = useState<MetadataItem[]>([]);
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MetadataItem | null>(null);
  const [draftName, setDraftName] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<MetadataItem | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (message: string) => {
    setToast(message);
    window.setTimeout(() => setToast(null), 2200);
  };

  const loadItems = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(listEndpoint, { credentials: 'include', cache: 'no-store' });
      if (!response.ok) {
        throw new Error(await readErrorMessage(response, t('admin.metadata.loadFailed', { entity: entityLabel.toLowerCase() })));
      }

      const payload = (await response.json().catch(() => null)) as Record<string, MetadataItem[]> | null;
      const list = payload?.[collectionKey] || payload?.items || [];
      setItems(sortItems(list));
    } catch (error) {
      console.error(error);
      showToast(t('admin.metadata.loadFailed', { entity: entityLabel.toLowerCase() }));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadItems();
  }, [listEndpoint]);

  const filteredItems = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    if (!normalizedQuery) return items;
    return items.filter((item) => item.name.toLowerCase().includes(normalizedQuery));
  }, [items, query]);

  const openCreateModal = () => {
    setEditingItem(null);
    setDraftName('');
    setIsFormOpen(true);
  };

  const openEditModal = (item: MetadataItem) => {
    setEditingItem(item);
    setDraftName(item.name);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingItem(null);
    setDraftName('');
  };

  const saveItem = async () => {
    const name = draftName.trim();
    if (!name) {
      showToast(t('admin.metadata.nameEmpty'));
      return;
    }

    setIsSaving(true);
    try {
      const method = editingItem ? 'PATCH' : 'POST';
      const url = editingItem ? `${listEndpoint}/${editingItem.id}` : listEndpoint;
      const response = await fetch(url, {
        method,
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, t('admin.metadata.saveFailed', { item: itemLabel.toLowerCase() })));
      }

      const payload = (await response.json().catch(() => null)) as { author?: MetadataItem; category?: MetadataItem; item?: MetadataItem } | null;
      const savedItem = payload?.item || payload?.author || payload?.category;

      if (!savedItem) {
        throw new Error('Server did not return saved item');
      }

      setItems((prev) => {
        const next = editingItem
          ? prev.map((item) => (item.id === savedItem.id ? savedItem : item))
          : [...prev, savedItem];

        return sortItems(next);
      });

      showToast(t('admin.metadata.saved', { item: itemLabel }));
      closeForm();
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : t('admin.metadata.saveFailed', { item: itemLabel.toLowerCase() }));
    } finally {
      setIsSaving(false);
    }
  };

  const deleteItem = async () => {
    if (!deleteTarget) return;

    setIsSaving(true);
    try {
      const response = await fetch(`${listEndpoint}/${deleteTarget.id}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error(await readErrorMessage(response, t('admin.metadata.deleteFailed', { item: itemLabel.toLowerCase() })));
      }

      setItems((prev) => prev.filter((item) => item.id !== deleteTarget.id));
      showToast(t('admin.metadata.deleted', { item: itemLabel }));
      setDeleteTarget(null);
    } catch (error) {
      console.error(error);
      showToast(error instanceof Error ? error.message : t('admin.metadata.deleteFailed', { item: itemLabel.toLowerCase() }));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="rounded-3xl border border-amber-100 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-700">{t('admin.metadata.manage')}</p>
          <h1 className="mt-2 font-serif text-3xl font-bold text-zinc-900">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-500">{description}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('admin.metadata.searchPlaceholder', { item: itemLabel.toLowerCase() })}
            className="min-w-64 rounded-2xl border border-amber-200 bg-white px-4 py-3 text-sm text-zinc-800 shadow-sm outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
          <Button type="button" onClick={openCreateModal} className="rounded-2xl px-5 py-3">
            {t('admin.common.addItem', { item: itemLabel })}
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-amber-100">
        <table className="min-w-full divide-y divide-amber-100">
          <thead className="bg-amber-50/80 text-left text-xs font-semibold uppercase tracking-[0.2em] text-amber-900">
            <tr>
              <th className="px-4 py-3">{t('admin.metadata.id')}</th>
              <th className="px-4 py-3">{t('admin.metadata.name')}</th>
              <th className="px-4 py-3">{t('admin.metadata.actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-50 bg-white text-sm text-zinc-700">
            {isLoading ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  {t('admin.metadata.loading', { item: itemLabel.toLowerCase() })}
                </td>
              </tr>
            ) : filteredItems.length === 0 ? (
              <tr>
                <td colSpan={3} className="px-4 py-8 text-center text-zinc-500">
                  {t('admin.metadata.noneFound', { item: itemLabel.toLowerCase() })}
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/40">
                  <td className="px-4 py-3 font-medium text-zinc-500">{item.id}</td>
                  <td className="px-4 py-3 font-semibold text-zinc-900">{item.name}</td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Button type="button" variant="outline" size="small" onClick={() => openEditModal(item)}>
                        {t('admin.common.edit')}
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        size="small"
                        onClick={() => setDeleteTarget(item)}
                      >
                        {t('admin.common.delete')}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isFormOpen}
        onClose={closeForm}
        title={editingItem ? t('admin.metadata.editTitle', { item: itemLabel }) : t('admin.metadata.addTitle', { item: itemLabel })}
        size="sm"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={closeForm}>
              {t('admin.common.cancel')}
            </Button>
            <Button type="button" loading={isSaving} onClick={() => void saveItem()}>
              {editingItem ? t('admin.common.saveChanges') : t('admin.metadata.create', { item: itemLabel })}
            </Button>
          </div>
        }
      >
        <label className="block text-sm font-semibold text-zinc-800">
          {t('admin.metadata.itemName', { item: itemLabel })}
          <input
            autoFocus
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder={t('admin.metadata.itemNamePlaceholder', { item: itemLabel })}
            className="mt-2 w-full rounded-2xl border border-amber-200 px-4 py-3 text-sm text-zinc-900 outline-none transition focus:border-amber-400 focus:ring-2 focus:ring-amber-200"
          />
        </label>
      </Modal>

      <Modal
        isOpen={Boolean(deleteTarget)}
        onClose={() => setDeleteTarget(null)}
        title={t('admin.metadata.deleteTitle', { item: itemLabel })}
        size="sm"
        footer={
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="outline" onClick={() => setDeleteTarget(null)}>
              {t('admin.common.cancel')}
            </Button>
            <Button type="button" variant="danger" loading={isSaving} onClick={() => void deleteItem()}>
              {t('admin.common.delete')}
            </Button>
          </div>
        }
      >
        <p className="text-sm text-zinc-600">
          {t('admin.metadata.deleteConfirmPrefix')} <span className="font-semibold text-zinc-900">{deleteTarget?.name}</span>? {t('admin.metadata.deleteConfirmSuffix')}
        </p>
      </Modal>

      {toast ? (
        <div className="fixed bottom-6 right-6 z-[60] rounded-2xl bg-zinc-900 px-4 py-3 text-sm font-medium text-white shadow-2xl">
          {toast}
        </div>
      ) : null}
    </section>
  );
}