'use client';

import { useCartStore } from '@/stores/cartStore';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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

  return (
    <div
      className={`fixed inset-0 z-50 ${isOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}
      aria-hidden={!isOpen}
    >
      <button
        type="button"
        aria-label="Close cart"
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300 ease-in-out ${
          isOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed top-0 right-0
          h-screen
          w-[360px] max-w-[92vw]
          bg-white dark:bg-zinc-950
          z-50
          shadow-xl
          flex flex-col
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <header className="shrink-0 border-b border-amber-100 bg-amber-50 px-4 py-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-amber-900 dark:text-amber-100">Cart ({totalItems})</h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-2 text-zinc-700 transition-colors hover:bg-white hover:text-amber-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-4">
          {cart.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center rounded-xl border border-dashed border-amber-200 bg-amber-50 p-6 text-center dark:border-zinc-700 dark:bg-zinc-900">
              <p className="text-base font-semibold text-zinc-700 dark:text-zinc-200">Your cart is empty</p>
              <p className="mt-1 text-sm text-zinc-500">Add books to start checkout</p>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <article
                  key={item.id}
                  className="rounded-xl border border-amber-100 bg-white p-3 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
                >
                  <div className="flex gap-3">
                    {item.cover_image ? (
                      <div className="h-20 w-14 shrink-0 overflow-hidden rounded-lg bg-amber-100 dark:bg-zinc-800">
                        <img src={item.cover_image} alt={item.title} className="h-full w-full object-cover" />
                      </div>
                    ) : (
                      <div className="h-20 w-14 shrink-0 rounded-lg bg-amber-100 dark:bg-zinc-800" />
                    )}

                    <div className="min-w-0 flex-1">
                      <h3 className="line-clamp-2 text-sm font-semibold text-zinc-900 dark:text-zinc-100">{item.title}</h3>
                      {item.author && <p className="mt-0.5 text-xs text-zinc-500">{item.author}</p>}
                      <div className="mt-1 flex items-center gap-2">
                        <p className="text-sm font-bold text-amber-800 dark:text-amber-400">
                          €{typeof item.price === 'string' ? item.price : item.price.toFixed(2)}
                        </p>
                        <span className="text-xs font-semibold text-zinc-600 dark:text-zinc-300">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-2">
                    <button
                      onClick={() => void handleUpdateQuantity(item.id, item.quantity - 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 text-amber-800 transition hover:bg-amber-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      -
                    </button>
                    <span className="min-w-[72px] text-center text-sm font-semibold text-zinc-700 dark:text-zinc-200">Qty: {item.quantity}</span>
                    <button
                      onClick={() => void handleUpdateQuantity(item.id, item.quantity + 1)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-200 text-amber-800 transition hover:bg-amber-50 dark:border-zinc-700 dark:text-zinc-100 dark:hover:bg-zinc-800"
                    >
                      +
                    </button>
                    <button
                      onClick={() => void handleRemove(item.id)}
                      className="ml-auto rounded-lg border border-red-200 px-2 py-1 text-xs font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      Remove
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <footer className="shrink-0 border-t border-amber-100 bg-amber-50 p-4 dark:border-zinc-800 dark:bg-zinc-900">
          <div className="mb-3 flex items-center justify-between text-sm font-semibold text-zinc-700 dark:text-zinc-200">
            <span>Total</span>
            <span className="text-lg font-bold text-amber-800 dark:text-amber-400">€{totalPrice.toFixed(2)}</span>
          </div>
          <button
            className="w-full rounded-xl bg-amber-700 px-4 py-3 text-sm font-semibold text-white transition hover:bg-amber-800"
            onClick={() => {
              onClose();
              router.push('/checkout');
            }}
          >
            Checkout
          </button>
        </footer>
      </aside>
    </div>
  );
}
