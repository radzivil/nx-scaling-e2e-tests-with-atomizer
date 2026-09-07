/**
 * A fake network layer. The latency is what makes the e2e suite take
 * realistic wall-clock time, which is the whole point of the demo.
 * Override with `VITE_API_LATENCY=0` to run the app snappily by hand.
 */
const LATENCY = Number(import.meta.env.VITE_API_LATENCY ?? 250);

export const delay = (ms: number = LATENCY) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const DEMO_USER = { email: 'demo@nxshop.test', password: 'nx-atomizer' };

export async function authenticate(email: string, password: string): Promise<{ email: string }> {
  await delay(LATENCY * 2);
  if (email !== DEMO_USER.email || password !== DEMO_USER.password) {
    throw new Error('Invalid email or password');
  }
  return { email };
}

export async function submitOrder<T>(payload: T): Promise<{ reference: string; payload: T }> {
  await delay(LATENCY * 3);
  const reference = `NX-${Math.random().toString(36).slice(2, 8).toUpperCase()}`;
  return { reference, payload };
}
