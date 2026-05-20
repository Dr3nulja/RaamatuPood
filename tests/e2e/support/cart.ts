import type { Page } from '@playwright/test';

type CartSeedItem = {
  id: number;
  title: string;
  author?: string;
  price: number;
  cover_image?: string;
  quantity: number;
};

export async function seedCart(page: Page, items: CartSeedItem[]) {
  await page.addInitScript(({ cartItems }) => {
    localStorage.setItem(
      'raamatupood-cart',
      JSON.stringify({ state: { cart: cartItems }, version: 0 })
    );
  }, { cartItems: items });
}