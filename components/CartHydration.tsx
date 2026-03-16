'use client';

import { useEffect } from 'react';
import { useCartStore } from '@/stores/cartStore';

export default function CartHydration() {
  useEffect(() => {
    // ИСПРАВЛЕНО: принудительная гидратация persist-store при старте приложения
    void useCartStore.persist.rehydrate();
  }, []);

  return null;
}
