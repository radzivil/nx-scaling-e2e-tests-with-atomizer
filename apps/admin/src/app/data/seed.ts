/**
 * Seed data for the back-office demo.
 *
 * Everything the admin app shows is derived from these three arrays plus the
 * settings defaults, so the e2e assertions can hard-code the numbers.
 */

export type Category = 'Audio' | 'Desk' | 'Video' | 'Wearables';

export const CATEGORIES: Category[] = ['Audio', 'Desk', 'Video', 'Wearables'];

export interface Product {
  id: string;
  name: string;
  sku: string;
  category: Category;
  price: number;
  stock: number;
}

export type OrderStatus = 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled';

export const ORDER_STATUSES: OrderStatus[] = ['pending', 'paid', 'shipped', 'delivered', 'cancelled'];

export interface OrderLine {
  productId: string;
  name: string;
  qty: number;
  price: number;
}

export interface Order {
  id: string;
  customer: string;
  placedAt: string;
  status: OrderStatus;
  lines: OrderLine[];
  history: { status: OrderStatus; at: string }[];
}

export type Role = 'admin' | 'editor' | 'viewer';

export const ROLES: Role[] = ['admin', 'editor', 'viewer'];

export interface AdminUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  active: boolean;
}

export interface Settings {
  storeName: string;
  supportEmail: string;
  taxRate: number;
  lowStockThreshold: number;
}

export const DEFAULT_SETTINGS: Settings = {
  storeName: 'Nx Shop',
  supportEmail: 'support@nxshop.test',
  taxRate: 8,
  lowStockThreshold: 10,
};

export const SEED_PRODUCTS: Product[] = [
  { id: 'p-01', name: 'Aurora Headphones', sku: 'AUD-001', category: 'Audio', price: 199, stock: 24 },
  { id: 'p-02', name: 'Basalt Desk Lamp', sku: 'DSK-002', category: 'Desk', price: 59, stock: 8 },
  { id: 'p-03', name: 'Cobalt Keyboard', sku: 'DSK-003', category: 'Desk', price: 129, stock: 15 },
  { id: 'p-04', name: 'Dune Mousepad', sku: 'DSK-004', category: 'Desk', price: 25, stock: 120 },
  { id: 'p-05', name: 'Ember Speaker', sku: 'AUD-005', category: 'Audio', price: 89, stock: 4 },
  { id: 'p-06', name: 'Flint Webcam', sku: 'VID-006', category: 'Video', price: 149, stock: 31 },
  { id: 'p-07', name: 'Granite Monitor Arm', sku: 'DSK-007', category: 'Desk', price: 109, stock: 6 },
  { id: 'p-08', name: 'Harbor Microphone', sku: 'AUD-008', category: 'Audio', price: 179, stock: 12 },
  { id: 'p-09', name: 'Indigo Laptop Stand', sku: 'DSK-009', category: 'Desk', price: 45, stock: 52 },
  { id: 'p-10', name: 'Juniper Smart Ring', sku: 'WEA-010', category: 'Wearables', price: 249, stock: 3 },
  { id: 'p-11', name: 'Kestrel Fitness Band', sku: 'WEA-011', category: 'Wearables', price: 79, stock: 44 },
  { id: 'p-12', name: 'Lumen Ring Light', sku: 'VID-012', category: 'Video', price: 65, stock: 9 },
  { id: 'p-13', name: 'Marble Cable Kit', sku: 'DSK-013', category: 'Desk', price: 19, stock: 200 },
  { id: 'p-14', name: 'Nimbus Noise Meter', sku: 'AUD-014', category: 'Audio', price: 39, stock: 17 },
];

const line = (productId: string, qty: number): OrderLine => {
  const product = SEED_PRODUCTS.find((p) => p.id === productId);
  if (!product) throw new Error(`Unknown seed product ${productId}`);
  return { productId, name: product.name, qty, price: product.price };
};

const seeded = (id: string, customer: string, placedAt: string, status: OrderStatus, lines: OrderLine[]): Order => ({
  id,
  customer,
  placedAt,
  status,
  lines,
  history: [{ status: 'pending', at: placedAt }],
});

export const SEED_ORDERS: Order[] = [
  seeded('NX-1001', 'Ada Lovelace', '2026-01-05T12:00:00.000Z', 'pending', [line('p-01', 1), line('p-13', 2)]),
  seeded('NX-1002', 'Grace Hopper', '2026-01-06T12:00:00.000Z', 'paid', [line('p-03', 1)]),
  seeded('NX-1003', 'Alan Turing', '2026-01-07T12:00:00.000Z', 'shipped', [line('p-05', 2), line('p-14', 1)]),
  seeded('NX-1004', 'Katherine Johnson', '2026-01-08T12:00:00.000Z', 'delivered', [line('p-10', 1)]),
  seeded('NX-1005', 'Linus Torvalds', '2026-01-09T12:00:00.000Z', 'pending', [line('p-04', 4)]),
  seeded('NX-1006', 'Barbara Liskov', '2026-01-10T12:00:00.000Z', 'cancelled', [line('p-06', 1)]),
  seeded('NX-1007', 'Donald Knuth', '2026-01-11T12:00:00.000Z', 'paid', [line('p-09', 2), line('p-12', 1)]),
  seeded('NX-1008', 'Margaret Hamilton', '2026-01-12T12:00:00.000Z', 'shipped', [line('p-08', 1), line('p-11', 1)]),
  seeded('NX-1009', 'Edsger Dijkstra', '2026-01-13T12:00:00.000Z', 'delivered', [line('p-02', 3)]),
  seeded('NX-1010', 'Radia Perlman', '2026-01-14T12:00:00.000Z', 'pending', [line('p-07', 1), line('p-13', 5)]),
  seeded('NX-1011', 'Tim Berners-Lee', '2026-01-15T12:00:00.000Z', 'paid', [line('p-01', 2)]),
  seeded('NX-1012', 'Anita Borg', '2026-01-16T12:00:00.000Z', 'shipped', [line('p-14', 3), line('p-04', 2)]),
];

export const SEED_USERS: AdminUser[] = [
  { id: 'u-1', name: 'Ada Admin', email: 'ada@nxshop.test', role: 'admin', active: true },
  { id: 'u-2', name: 'Bo Buyer', email: 'bo@nxshop.test', role: 'viewer', active: true },
  { id: 'u-3', name: 'Cleo Clerk', email: 'cleo@nxshop.test', role: 'editor', active: true },
  { id: 'u-4', name: 'Dev Doe', email: 'dev@nxshop.test', role: 'editor', active: false },
  { id: 'u-5', name: 'Eli Editor', email: 'eli@nxshop.test', role: 'editor', active: true },
  { id: 'u-6', name: 'Fay Finance', email: 'fay@nxshop.test', role: 'viewer', active: false },
  { id: 'u-7', name: 'Gus Guest', email: 'gus@nxshop.test', role: 'viewer', active: true },
  { id: 'u-8', name: 'Hana Head', email: 'hana@nxshop.test', role: 'admin', active: true },
];

export const orderTotal = (order: Order): number => order.lines.reduce((sum, l) => sum + l.price * l.qty, 0);

export const orderItemCount = (order: Order): number => order.lines.reduce((sum, l) => sum + l.qty, 0);

/** Forward-only status flow. `null` means the order has reached a terminal state. */
export function nextStatus(status: OrderStatus): OrderStatus | null {
  if (status === 'pending') return 'paid';
  if (status === 'paid') return 'shipped';
  if (status === 'shipped') return 'delivered';
  return null;
}

export const statusTone = (status: OrderStatus): 'neutral' | 'good' | 'warn' | 'bad' => {
  if (status === 'delivered') return 'good';
  if (status === 'cancelled') return 'bad';
  if (status === 'pending') return 'warn';
  return 'neutral';
};
