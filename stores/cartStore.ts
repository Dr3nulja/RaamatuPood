import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

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

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => {
      return {
        cart: [],

        setCart: (cart: CartItem[]) => {
          set({ cart });
        },

        addItem: (item: Omit<CartItem, 'quantity'>) => {
          set((state: CartState) => {
            const existingItem = state.cart.find((i: CartItem) => i.id === item.id);
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
          });
        },

        removeItem: (id: number) => {
          set((state: CartState) => ({
            cart: state.cart.filter((i: CartItem) => i.id !== id),
          }));
        },

        updateQuantity: (id: number, quantity: number) => {
          if (quantity <= 0) {
            (get() as CartState).removeItem(id);
            return;
          }
          set((state: CartState) => ({
            cart: state.cart.map((i: CartItem) =>
              i.id === id ? { ...i, quantity } : i
            ),
          }));
        },

        clearCart: () => {
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
