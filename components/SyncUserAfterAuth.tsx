'use client';

import { useEffect, useRef } from 'react';
import { useCartStore } from '@/stores/cartStore';

type SyncUserAfterAuthProps = {
  isAuthenticated: boolean;
};

export default function SyncUserAfterAuth({ isAuthenticated }: SyncUserAfterAuthProps) {
  const hasSyncedRef = useRef(false);
  const setCart = useCartStore((state) => state.setCart);

  useEffect(() => {
    let isMounted = true;

    if (!isAuthenticated) {
      hasSyncedRef.current = false;
      return () => {
        isMounted = false;
      };
    }

    if (hasSyncedRef.current) {
      return;
    }

    const sync = async () => {
      try {
        const localCartSnapshot = useCartStore
          .getState()
          .cart.map((item) => ({ id: item.id, quantity: item.quantity }));
        const response = await fetch('/api/sync-user', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          cache: 'no-store',
          credentials: 'include',
          body: JSON.stringify({ cartItems: localCartSnapshot }),
        });

        if (isMounted && response.ok) {
          const data = (await response.json().catch(() => null)) as {
            cart?: { items?: Parameters<typeof setCart>[0] };
          } | null;

          if (Array.isArray(data?.cart?.items)) {
            setCart(data.cart.items);
          }
          hasSyncedRef.current = true;
        }
      } catch {
        // silent retry on next navigation/reload
      }
    };

    void sync();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, setCart]);

  return null;
}
