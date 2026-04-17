export const orderStatuses = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'] as const;

export type OrderStatus = (typeof orderStatuses)[number];

export const chartPalette = [
  'var(--ds-primary)',
  'var(--ds-primary-hover)',
  'var(--ds-primary-soft)',
  'var(--ds-secondary)',
  'var(--ds-secondary-soft)',
];

export function normalizeCover(url: string | null) {
  if (!url) {
    return null;
  }

  if (url.startsWith('/') || url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  return `/images/${url}`;
}
