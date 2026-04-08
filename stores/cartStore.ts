import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
<<<<<<< HEAD
import { CART_SYNC_COOKIE_NAME } from '@/lib/cart/sessionCart';
=======
>>>>>>> origin/main

export interface CartItem {
  id: number;
  title: string;
  author?: string;
  price: number | string;
  cover_image?: string;
  quantity: number;
}

export interface CheckoutCartItem {
  id: number;
  title: string;
  price: number;
  quantity: number;
  image?: string;
}

interface CartState {
  cart: CartItem[];
  setCart: (cart: CartItem[]) => void;
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQuantity: (id: number, quantity: number) => void;
  clearCart: () => void;
}

<<<<<<< HEAD
function persistCartSyncCookie(cart: CartItem[]) {
  if (typeof document === 'undefined') {
    return;
  }

  const payload = cart
    .filter((item) => Number.isInteger(item.id) && item.id > 0 && Number.isInteger(item.quantity) && item.quantity > 0)
    .map((item) => ({ id: item.id, quantity: item.quantity }))
    .slice(0, 50);

  if (payload.length === 0) {
    document.cookie = `${CART_SYNC_COOKIE_NAME}=; Path=/; Max-Age=0; SameSite=Lax`;
    return;
  }

  const encoded = encodeURIComponent(JSON.stringify(payload));
  document.cookie = `${CART_SYNC_COOKIE_NAME}=${encoded}; Path=/; Max-Age=2592000; SameSite=Lax`;
}

=======
>>>>>>> origin/main
export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      return {
        cart: [],

        setCart: (cart: CartItem[]) => {
<<<<<<< HEAD
          persistCartSyncCookie(cart);
=======
>>>>>>> origin/main
          set({ cart });
        },

        addItem: (item: Omit<CartItem, 'quantity'>) => {
          set((state: CartState) => {
            const existingItem = state.cart.find((i: CartItem) => i.id === item.id);
<<<<<<< HEAD
            const nextCart = existingItem
              ? state.cart.map((i: CartItem) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                )
              : [...state.cart, { ...item, quantity: 1 }];

            persistCartSyncCookie(nextCart);

            if (existingItem) {
              return { cart: nextCart };
            }

            return { cart: nextCart };
=======
            if (existingItem) {
              return {
                cart: state.cart.map((i: CartItem) =>
                  i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
                ),
              };
            }
            return {
              cart: [...state.cart, { ...item, quantity: 1 }],
            };
>>>>>>> origin/main
          });
        },

        removeItem: (id: number) => {
<<<<<<< HEAD
          set((state: CartState) => {
            const nextCart = state.cart.filter((i: CartItem) => i.id !== id);
            persistCartSyncCookie(nextCart);
            return { cart: nextCart };
          });
=======
          set((state: CartState) => ({
            cart: state.cart.filter((i: CartItem) => i.id !== id),
          }));
>>>>>>> origin/main
        },

        updateQuantity: (id: number, quantity: number) => {
          if (quantity <= 0) {
            (get() as CartState).removeItem(id);
            return;
          }
<<<<<<< HEAD
          set((state: CartState) => {
            const nextCart = state.cart.map((i: CartItem) =>
              i.id === id ? { ...i, quantity } : i
            );
            persistCartSyncCookie(nextCart);
            return { cart: nextCart };
          });
        },

        clearCart: () => {
          persistCartSyncCookie([]);
=======
          set((state: CartState) => ({
            cart: state.cart.map((i: CartItem) =>
              i.id === id ? { ...i, quantity } : i
            ),
          }));
        },

        clearCart: () => {
>>>>>>> origin/main
          set({ cart: [] });
        },
      };
    },
    {
      name: 'raamatupood-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true, // ← КРИТИЧНО: prevent hydration mismatch
      partialize: (state: CartState) => ({ cart: state.cart }), // сохраняем только cart
    }
  )
);
