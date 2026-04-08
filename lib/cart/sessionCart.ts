export const CART_SYNC_COOKIE_NAME = 'raamatupood-cart-sync';

export type SessionCartItem = {
  id: number;
  quantity: number;
};

function toFinitePositiveInt(value: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return null;
  }

  const int = Math.floor(numeric);
  return int > 0 ? int : null;
}

export function normalizeSessionCartItems(input: unknown): SessionCartItem[] {
  if (!Array.isArray(input)) {
    return [];
  }

  const quantityByBookId = new Map<number, number>();

  for (const rawItem of input) {
    const item = rawItem as { id?: unknown; quantity?: unknown };
    const id = toFinitePositiveInt(item?.id);
    const quantity = toFinitePositiveInt(item?.quantity);

    if (!id || !quantity) {
      continue;
    }

    const current = quantityByBookId.get(id) ?? 0;
    quantityByBookId.set(id, Math.min(current + quantity, 999));
  }

  return Array.from(quantityByBookId.entries()).map(([id, quantity]) => ({ id, quantity }));
}

export function parseSessionCartCookie(cookieValue?: string | null): SessionCartItem[] {
  if (!cookieValue) {
    return [];
  }

  try {
    const decoded = decodeURIComponent(cookieValue);
    const parsed = JSON.parse(decoded) as unknown;
    return normalizeSessionCartItems(parsed);
  } catch {
    return [];
  }
}