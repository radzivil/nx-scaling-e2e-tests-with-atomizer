import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { findProduct } from '../data/products';
import { delay } from '../lib/api';
import type { CartLine } from '../lib/pricing';

export interface Order {
  reference: string;
  placedAt: string;
  email: string;
  lines: CartLine[];
  total: number;
}

interface ShopState {
  lines: CartLine[];
  itemCount: number;
  user: { email: string } | null;
  orders: Order[];
  busy: boolean;
  addToCart(productId: string, qty?: number): Promise<void>;
  setQty(productId: string, qty: number): Promise<void>;
  removeLine(productId: string): Promise<void>;
  clearCart(): void;
  signIn(user: { email: string }): void;
  signOut(): void;
  recordOrder(order: Order): void;
}

const ShopContext = createContext<ShopState | null>(null);

const KEYS = { cart: 'nxshop.cart', user: 'nxshop.user', orders: 'nxshop.orders' };

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage disabled — the demo still works, it just forgets */
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>(() => read(KEYS.cart, []));
  const [user, setUser] = useState<{ email: string } | null>(() => read(KEYS.user, null));
  const [orders, setOrders] = useState<Order[]>(() => read(KEYS.orders, []));
  const [busy, setBusy] = useState(false);

  useEffect(() => write(KEYS.cart, lines), [lines]);
  useEffect(() => write(KEYS.user, user), [user]);
  useEffect(() => write(KEYS.orders, orders), [orders]);

  const mutate = useCallback(async (fn: (current: CartLine[]) => CartLine[]) => {
    setBusy(true);
    await delay();
    setLines(fn);
    setBusy(false);
  }, []);

  const addToCart = useCallback(
    (productId: string, qty = 1) =>
      mutate((current) => {
        const product = findProduct(productId);
        if (!product) return current;
        const existing = current.find((line) => line.id === productId);
        if (existing) {
          return current.map((line) => (line.id === productId ? { ...line, qty: line.qty + qty } : line));
        }
        return [...current, { id: product.id, name: product.name, price: product.price, qty }];
      }),
    [mutate]
  );

  const setQty = useCallback(
    (productId: string, qty: number) =>
      mutate((current) =>
        qty <= 0
          ? current.filter((line) => line.id !== productId)
          : current.map((line) => (line.id === productId ? { ...line, qty } : line))
      ),
    [mutate]
  );

  const removeLine = useCallback(
    (productId: string) => mutate((current) => current.filter((line) => line.id !== productId)),
    [mutate]
  );

  const value = useMemo<ShopState>(
    () => ({
      lines,
      itemCount: lines.reduce((sum, line) => sum + line.qty, 0),
      user,
      orders,
      busy,
      addToCart,
      setQty,
      removeLine,
      clearCart: () => setLines([]),
      signIn: setUser,
      signOut: () => setUser(null),
      recordOrder: (order) => setOrders((current) => [order, ...current]),
    }),
    [lines, user, orders, busy, addToCart, setQty, removeLine]
  );

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}

export function useShop(): ShopState {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used inside <ShopProvider>');
  return context;
}
