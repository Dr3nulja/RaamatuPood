'use client';

import { useCartStore } from '@/stores/cartStore';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  isAuthenticated: boolean;
};

export default function CartDrawer({ isOpen, onClose, isAuthenticated }: CartDrawerProps) {
  const cart = useCartStore((state) => state.cart);
  const setCart = useCartStore((state) => state.setCart);
  const removeItem = useCartStore((state) => state.removeItem);
  const updateQuantity = useCartStore((state) => state.updateQuantity);
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setMounted(true);
    });

    return () => {
      window.cancelAnimationFrame(frame);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isAuthenticated) {
      return;
    }

    const loadServerCart = async () => {
      try {
        const response = await fetch('/api/cart', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { items?: Parameters<typeof setCart>[0] };
        if (Array.isArray(data.items)) {
          setCart(data.items);
        }
      } catch {
        // keep local store value
      }
    };

    void loadServerCart();
  }, [isAuthenticated, setCart]);

  const handleRemove = async (bookId: number) => {
    removeItem(bookId);

    if (!isAuthenticated) {
      return;
    }

    try {
      await fetch(`/api/cart/${bookId}`, {
        method: 'DELETE',
        credentials: 'include',
      });
    } catch {
      // no-op
    }
  };

  const handleUpdateQuantity = async (bookId: number, quantity: number) => {
    updateQuantity(bookId, quantity);

    if (!isAuthenticated) {
      return;
    }

    try {
      await fetch(`/api/cart/${bookId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ quantity }),
      });
    } catch {
      // no-op
    }
  };

  const totalPrice = cart.reduce((sum, item) => {
    const price = typeof item.price === 'string' ? parseFloat(item.price) : item.price;
    return sum + price * item.quantity;
  }, 0);
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const safeCart = mounted ? cart : [];
  const safeTotalPrice = mounted ? totalPrice : 0;
  const safeTotalItems = mounted ? totalItems : 0;

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <Button
        type="button"
        aria-label="Close cart"
        variant="ghost"
        size="small"
        className={`fixed inset-0 z-40 !p-0 bg-black/40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed top-0 right-0
          h-screen
          w-[360px] max-w-[92vw]
          bg-surface
          z-50
          shadow-xl
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <header className="shrink-0 border-b border-border bg-surface-muted px-4 py-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-secondary">Cart ({safeTotalItems})</h2>
            <Button
              type="button"
              onClick={onClose}
              variant="ghost"
              size="small"
              className="rounded-lg !p-2 text-text-secondary transition-colors hover:bg-background hover:text-secondary"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {safeCart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface-muted p-6 text-center">
              <p className="text-base font-semibold text-text-primary">Your cart is empty</p>
              <p className="mt-1 text-sm text-text-secondary">Add books to start checkout</p>
            </div>
          ) : (
            <div className="space-y-3">
              {safeCart.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-border bg-surface p-3 shadow-sm"
                >
                  <div className="flex gap-3">
                    {item.cover_image ? (
                      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-background-muted">
                        <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 w-14 shrink-0 rounded-lg bg-background-muted" />
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold text-text-primary">{item.title}</h3>
                      {item.author && <p className="mt-0.5 text-xs text-text-secondary">{item.author}</p>}
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm font-bold text-primary">
                          €{typeof item.price === 'string' ? item.price : item.price.toFixed(2)}
                        </p>
                        <span className="text-xs font-semibold text-text-secondary">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      onClick={() => void handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center !px-0 !py-0 text-secondary transition hover:bg-primary-soft"
                    >
                      -
                    </Button>
                    <span className="min-w-[72px] text-center text-sm font-semibold text-text-secondary">Qty: {item.quantity}</span>
                    <Button
                      type="button"
                      variant="outline"
                      size="small"
                      onClick={() => void handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center !px-0 !py-0 text-secondary transition hover:bg-primary-soft"
                    >
                      +
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      size="small"
                      onClick={() => void handleRemove(item.id)}
                      className="ml-auto px-2 py-1 text-xs font-semibold"
                    >
                      Remove
                    </Button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-border bg-surface-muted p-4">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-text-secondary">
            <span>Total</span>
            <span className="text-lg font-bold text-primary">€{safeTotalPrice.toFixed(2)}</span>
          </div>
          <Button
            type="button"
            variant="primary"
            fullWidth
            className="rounded-xl text-sm"
            onClick={() => {
              onClose();
              router.push('/checkout');
            }}
          >
            Checkout
          </Button>
        </footer>
      </aside>
    </div>
  );
}
