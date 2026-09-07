import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { delay } from '../lib/api';
import {
  DEFAULT_SETTINGS,
  SEED_ORDERS,
  SEED_PRODUCTS,
  SEED_USERS,
  type AdminUser,
  type Order,
  type OrderStatus,
  type Product,
  type Settings,
} from '../data/seed';

const KEYS = {
  user: 'nxadmin.user',
  products: 'nxadmin.products',
  orders: 'nxadmin.orders',
  users: 'nxadmin.users',
  settings: 'nxadmin.settings',
};

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

export interface AdminState {
  user: { email: string } | null;
  products: Product[];
  orders: Order[];
  users: AdminUser[];
  settings: Settings;
  saving: boolean;
  signIn(user: { email: string }): void;
  signOut(): void;
  updateProduct(id: string, patch: Partial<Product>): Promise<void>;
  adjustStock(id: string, delta: number): Promise<void>;
  setOrderStatus(id: string, status: OrderStatus): Promise<void>;
  toggleUser(id: string): Promise<void>;
  saveSettings(next: Settings): Promise<void>;
  resetSettings(): Promise<void>;
}

const AdminContext = createContext<AdminState | null>(null);

export function AdminProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<{ email: string } | null>(() => read(KEYS.user, null));
  const [products, setProducts] = useState<Product[]>(() => read(KEYS.products, SEED_PRODUCTS));
  const [orders, setOrders] = useState<Order[]>(() => read(KEYS.orders, SEED_ORDERS));
  const [users, setUsers] = useState<AdminUser[]>(() => read(KEYS.users, SEED_USERS));
  const [settings, setSettings] = useState<Settings>(() => read(KEYS.settings, DEFAULT_SETTINGS));
  const [saving, setSaving] = useState(false);

  useEffect(() => write(KEYS.user, user), [user]);
  useEffect(() => write(KEYS.products, products), [products]);
  useEffect(() => write(KEYS.orders, orders), [orders]);
  useEffect(() => write(KEYS.users, users), [users]);
  useEffect(() => write(KEYS.settings, settings), [settings]);

  /** Every write costs `multiplier` round-trips of fake latency. */
  const commit = useCallback(async (apply: () => void, multiplier = 1) => {
    setSaving(true);
    for (let i = 0; i < multiplier; i++) await delay();
    apply();
    setSaving(false);
  }, []);

  const updateProduct = useCallback(
    (id: string, patch: Partial<Product>) =>
      commit(() => setProducts((current) => current.map((p) => (p.id === id ? { ...p, ...patch } : p))), 2),
    [commit]
  );

  const adjustStock = useCallback(
    (id: string, delta: number) =>
      commit(() =>
        setProducts((current) => current.map((p) => (p.id === id ? { ...p, stock: Math.max(0, p.stock + delta) } : p)))
      ),
    [commit]
  );

  const setOrderStatus = useCallback(
    (id: string, status: OrderStatus) =>
      commit(
        () =>
          setOrders((current) =>
            current.map((o) =>
              o.id === id ? { ...o, status, history: [...o.history, { status, at: new Date().toISOString() }] } : o
            )
          ),
        2
      ),
    [commit]
  );

  const toggleUser = useCallback(
    (id: string) => commit(() => setUsers((current) => current.map((u) => (u.id === id ? { ...u, active: !u.active } : u)))),
    [commit]
  );

  const saveSettings = useCallback((next: Settings) => commit(() => setSettings(next), 2), [commit]);

  const resetSettings = useCallback(() => commit(() => setSettings(DEFAULT_SETTINGS)), [commit]);

  const value = useMemo<AdminState>(
    () => ({
      user,
      products,
      orders,
      users,
      settings,
      saving,
      signIn: setUser,
      signOut: () => setUser(null),
      updateProduct,
      adjustStock,
      setOrderStatus,
      toggleUser,
      saveSettings,
      resetSettings,
    }),
    [user, products, orders, users, settings, saving, updateProduct, adjustStock, setOrderStatus, toggleUser, saveSettings, resetSettings]
  );

  return <AdminContext.Provider value={value}>{children}</AdminContext.Provider>;
}

export function useAdmin(): AdminState {
  const context = useContext(AdminContext);
  if (!context) throw new Error('useAdmin must be used inside <AdminProvider>');
  return context;
}
