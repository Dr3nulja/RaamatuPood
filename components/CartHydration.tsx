'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

type CartHydrationProps = {
  isAuthenticated: boolean;
};

export default function CartHydration({ isAuthenticated }: CartHydrationProps) {
  const setCart = useCartStore((state) => state.setCart);

  useEffect(() => {
    // ИСПРАВЛЕНО: принудительная гидратация persist-store при старте приложения
    void useCartStore.persist.rehydrate();

    if (!isAuthenticated) {
      return;
    }

    const syncServerCart = async () => {
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
        // keep local cart when server sync fails
      }
    };

    void syncServerCart();
  }, [isAuthenticated, setCart]);

  return null;
}
