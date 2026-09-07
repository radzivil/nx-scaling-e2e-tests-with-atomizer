/**
 * Shared formatting helpers.
 *
 * Used by `shop` and `admin` but deliberately NOT by `docs`, so the dependency
 * graph is asymmetric. That is what makes `nx affected` worth demonstrating:
 * touching this file invalidates two apps' e2e targets, not all three.
 */

/** Dollars in, display string out. Matches the convention the shop was built on. */
export const money = (n: number) => `$${n.toFixed(2)}`;

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(iso));
}

export function formatQuantity(n: number, noun: string): string {
  return `${n} ${noun}${n === 1 ? '' : 's'}`;
}

export function percent(part: number, whole: number): string {
  if (whole === 0) return '0%';
  return `${Math.round((part / whole) * 100)}%`;
}
