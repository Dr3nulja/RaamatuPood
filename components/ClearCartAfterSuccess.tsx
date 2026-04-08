'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

/**
 * Invisible client component mounted by the /success Server Component.
 * Clears the Zustand cart (persisted in localStorage) once the
 * success page loads, so items don't linger after a completed order.
 *
 * The session_id is passed as a prop (already extracted server-side),
 * which keeps this component free of useSearchParams and its Suspense
 * boundary requirement.
 */
export function ClearCartAfterSuccess({ sessionId }: { sessionId: string }) {
  const clearCart = useCartStore((state) => state.clearCart);

  useEffect(() => {
    if (sessionId) {
      clearCart();

      const clearServerCart = async () => {
        try {
          await fetch('/api/cart', {
            method: 'DELETE',
            credentials: 'include',
          });
        } catch {
          // no-op
        }
      };

      void clearServerCart();
    }
  }, [sessionId, clearCart]);

  return null;
}
