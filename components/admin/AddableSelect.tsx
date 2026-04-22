'use client';

import { useEffect, useRef, useState } from 'react';
import Button from '@/components/ui/Button';

type Item = { id: number; name: string };

interface AddableSelectProps {
  items: Item[];
  value: string;
  onChange: (value: string) => void;
  onCreateNew: (name: string) => Promise<{ id: number; name: string }>;
  placeholder?: string;
  label?: string;
  creatingMessage?: string;
  errorMessage?: string;
}

export default function AddableSelect({
  items,
  value,
  onChange,
  onCreateNew,
  placeholder = 'Select...',
  label = 'Item',
  creatingMessage = 'Creating...',
  errorMessage = 'Failed to create',
}: AddableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedItem = items.find((item) => String(item.id) === value);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setIsCreating(false);
        setNewName('');
        setError(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (itemValue: string) => {
    if (itemValue === '__add_new__') {
      setNewName('');
      setIsCreating(true);
      setError(null);
    } else {
      onChange(itemValue);
      setIsOpen(false);
    }
  };

  const handleCreateNew = async () => {
    const trimmedName = newName.trim();
    if (!trimmedName) {
      setError('Name cannot be empty');
      return;
    }

    try {
      setError(null);
      const created = await onCreateNew(trimmedName);
      onChange(String(created.id));
      setIsCreating(false);
      setNewName('');
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : errorMessage);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      void handleCreateNew();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewName('');
      setError(null);
    }
  };

  return (
    <div ref={containerRef} className="relative">
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full justify-between rounded-xl border-amber-200 bg-white px-3 py-2 text-left text-sm text-zinc-800 hover:border-amber-300"
      >
        <span className="truncate">{selectedItem ? selectedItem.name : placeholder}</span>
        <span className="text-zinc-400">▼</span>
      </Button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 rounded-xl border border-amber-200 bg-white shadow-lg">
          {isCreating ? (
            <div className="p-3">
              <input
                autoFocus
                type="text"
                className="mb-2 w-full rounded-lg border border-amber-200 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400"
                placeholder={`New ${label.toLowerCase()}...`}
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              {error && (
                <div className="mb-2 text-xs text-red-600">{error}</div>
              )}
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="small"
                  onClick={() => void handleCreateNew()}
                  disabled={!newName.trim()}
                  className="flex-1 rounded-lg bg-emerald-600 px-2 py-1 text-xs hover:bg-emerald-700"
                >
                  Create
                </Button>
                <Button
                  type="button"
                  size="small"
                  variant="outline"
                  onClick={() => {
                    setIsCreating(false);
                    setNewName('');
                    setError(null);
                  }}
                  className="flex-1 rounded-lg border-zinc-200 bg-zinc-100 px-2 py-1 text-xs text-zinc-700 hover:bg-zinc-200"
                >
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <ul className="max-h-48 overflow-y-auto">
              <li>
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={() => onChange('')}
                  className="w-full justify-start rounded-none px-3 py-2 text-left text-sm text-zinc-600 hover:bg-amber-50"
                >
                  — (None)
                </Button>
              </li>
              {items.map((item) => (
                <li key={item.id}>
                  <Button
                    type="button"
                    variant="ghost"
                    size="small"
                    onClick={() => handleSelect(String(item.id))}
                    className={`w-full justify-start rounded-none px-3 py-2 text-left text-sm ${
                      String(item.id) === value
                        ? 'bg-amber-100 font-semibold text-amber-900'
                        : 'text-zinc-700 hover:bg-amber-50'
                    }`}
                  >
                    {item.name}
                  </Button>
                </li>
              ))}
              <li className="border-t border-amber-100">
                <Button
                  type="button"
                  variant="ghost"
                  size="small"
                  onClick={() => handleSelect('__add_new__')}
                  className="w-full justify-start rounded-none px-3 py-2 text-left text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                >
                  ➕ Add new {label.toLowerCase()}
                </Button>
              </li>
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
