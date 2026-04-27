'use client';

import { useMemo, useState } from 'react';
import Button from '@/components/ui/Button';
import { useCartStore } from '@/stores/cartStore';
import { createClickGuard } from '@/lib/security/frontend';
import { useTranslation } from '@/hooks/useTranslation';

type AddToCartButtonProps = {
  book: {
    id: number;
    title: string;
    author?: string;
    price: number;
    cover_image?: string;
    stock?: number | null;
  };
  className?: string;
};

export default function AddToCartButton({ book, className }: AddToCartButtonProps) {
  const addItem = useCartStore((state) => state.addItem);
  const { t } = useTranslation();
  const canClickAddToCart = useMemo(() => createClickGuard(500), []);
  const [isAdding, setIsAdding] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  const inStock = Number(book.stock ?? 0) > 0;

  const handleAddToCart = async () => {
    if (!inStock || isAdding) {
      return;
    }

    if (!canClickAddToCart()) {
      setFeedback(t('catalog.tooFrequent'));
      return;
    }

    setIsAdding(true);
    try {
      const response = await fetch('/api/cart', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          bookId: book.id,
          quantity: 1,
        }),
      });

      if (response.status === 401) {
        setFeedback(t('catalog.loginToAdd'));
        return;
      }

      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      if (!response.ok) {
        setFeedback(payload?.error || t('catalog.addFailed'));
        return;
      }

      addItem({
        id: book.id,
        title: book.title,
        author: book.author,
        price: book.price,
        cover_image: book.cover_image,
      });

      setFeedback(t('catalog.addedToCart'));
    } catch {
      setFeedback(t('catalog.actionFailed'));
    } finally {
      setIsAdding(false);
      window.setTimeout(() => setFeedback(null), 1800);
    }
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="primary"
        size="large"
        disabled={!inStock || isAdding}
        loading={isAdding}
        className={className}
        onClick={() => void handleAddToCart()}
      >
        {isAdding ? t('catalog.adding') : t('catalog.addToCart')}
      </Button>
      {feedback && <p className="text-sm font-medium text-amber-700">{feedback}</p>}
    </div>
  );
}
