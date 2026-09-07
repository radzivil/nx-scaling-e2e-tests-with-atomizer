/**
 * A fake network layer, deliberately slow.
 *
 * Same trick as `apps/shop/src/app/lib/api.ts`: the latency is what gives the
 * e2e suite realistic wall-clock time, which is the whole point of the talk.
 * Override with `VITE_API_LATENCY=0` to click through the app by hand.
 */
import { useEffect, useState } from 'react';

export const LATENCY = Number(import.meta.env.VITE_API_LATENCY ?? 250);

export const delay = (ms: number = LATENCY) => new Promise<void>((resolve) => setTimeout(resolve, ms));

export const ADMIN_USER = { email: 'admin@nxshop.test', password: 'nx-atomizer' };

export async function authenticate(email: string, password: string): Promise<{ email: string }> {
  await delay(LATENCY * 2);
  if (email.trim().toLowerCase() !== ADMIN_USER.email || password !== ADMIN_USER.password) {
    throw new Error('Invalid email or password');
  }
  return { email: ADMIN_USER.email };
}

/**
 * Simulates a page-level fetch. Every screen pays for its data, so navigating
 * around the back office costs real milliseconds.
 */
export function useLoaded(key: string, ms: number = LATENCY): boolean {
  const [loadedKey, setLoadedKey] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    const timer = setTimeout(() => {
      if (alive) setLoadedKey(key);
    }, ms);
    return () => {
      alive = false;
      clearTimeout(timer);
    };
  }, [key, ms]);

  return loadedKey === key;
}
