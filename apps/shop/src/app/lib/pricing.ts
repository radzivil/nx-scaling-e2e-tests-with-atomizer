import { DEMO_FLAGS } from './demo-flags';

export interface CartLine {
  id: string;
  name: string;
  price: number;
  qty: number;
}

export const BULK_DISCOUNT_THRESHOLD = 200;
export const BULK_DISCOUNT_RATE = 0.1;
export const FREE_SHIPPING_THRESHOLD = 100;
export const SHIPPING_FLAT = 9.99;

const round = (n: number) => Math.round(n * 100) / 100;

export function subtotalOf(lines: CartLine[]): number {
  return round(lines.reduce((sum, line) => sum + line.price * line.qty, 0));
}

export function discountOf(subtotal: number): number {
  if (subtotal < BULK_DISCOUNT_THRESHOLD) return 0;
  // When the demo flag is on this becomes a flat $10 instead of 10%,
  // so only carts above the bulk threshold end up wrong.
  if (DEMO_FLAGS.buggyDiscount) return 10;
  return round(subtotal * BULK_DISCOUNT_RATE);
}

export function shippingOf(subtotal: number): number {
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : SHIPPING_FLAT;
}

export interface Totals {
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
}

export function totalsOf(lines: CartLine[]): Totals {
  const subtotal = subtotalOf(lines);
  const discount = discountOf(subtotal);
  const shipping = shippingOf(subtotal);
  return { subtotal, discount, shipping, total: round(subtotal - discount + shipping) };
}

export const money = (n: number) => `$${n.toFixed(2)}`;
