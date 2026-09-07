export interface Product {
  id: string;
  name: string;
  category: 'Audio' | 'Wearables' | 'Desk';
  price: number;
  blurb: string;
  stock: number;
}

export const PRODUCTS: Product[] = [
  { id: 'studio-headphones', name: 'Studio Headphones', category: 'Audio', price: 249.0, blurb: 'Closed-back reference cans for long sessions.', stock: 8 },
  { id: 'wireless-earbuds', name: 'Wireless Earbuds', category: 'Audio', price: 129.5, blurb: 'Six hours per charge, three more in the case.', stock: 24 },
  { id: 'desk-speaker', name: 'Desk Speaker', category: 'Audio', price: 89.0, blurb: 'Near-field monitor that fits behind a laptop.', stock: 12 },
  { id: 'noise-meter', name: 'Noise Meter', category: 'Audio', price: 25.0, blurb: 'Tells you the open-plan office is too loud.', stock: 40 },
  { id: 'smart-watch', name: 'Smart Watch', category: 'Wearables', price: 199.0, blurb: 'Notifications, heart rate, two-day battery.', stock: 6 },
  { id: 'fitness-band', name: 'Fitness Band', category: 'Wearables', price: 59.0, blurb: 'Step counting without the screen tax.', stock: 30 },
  { id: 'sleep-ring', name: 'Sleep Ring', category: 'Wearables', price: 179.0, blurb: 'Sleep staging in something you forget you wear.', stock: 9 },
  { id: 'mechanical-keyboard', name: 'Mechanical Keyboard', category: 'Desk', price: 149.0, blurb: 'Hot-swap switches, 75% layout, no RGB.', stock: 15 },
  { id: 'ergo-mouse', name: 'Ergo Mouse', category: 'Desk', price: 69.0, blurb: 'Vertical grip that fixes the wrist ache.', stock: 22 },
  { id: 'monitor-arm', name: 'Monitor Arm', category: 'Desk', price: 119.0, blurb: 'Gas spring, clamps to anything under 40mm.', stock: 11 },
  { id: 'usb-c-hub', name: 'USB-C Hub', category: 'Desk', price: 45.0, blurb: 'Two displays, ethernet, and 100W passthrough.', stock: 35 },
  { id: 'laptop-stand', name: 'Laptop Stand', category: 'Desk', price: 39.0, blurb: 'Folds flat, raises the screen to eye level.', stock: 50 },
];

export const CATEGORIES = ['All', 'Audio', 'Wearables', 'Desk'] as const;

export const findProduct = (id: string) => PRODUCTS.find((p) => p.id === id);
