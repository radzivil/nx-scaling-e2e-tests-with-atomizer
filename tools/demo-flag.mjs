/**
 * Flips the seeded pricing bug used in the talk.
 *
 *   node tools/demo-flag.mjs break   # two specs start failing
 *   node tools/demo-flag.mjs fix     # back to green
 *   node tools/demo-flag.mjs status
 */
import { readFileSync, writeFileSync } from 'node:fs';

const FILE = new URL('../apps/shop/src/app/lib/demo-flags.ts', import.meta.url);
const PATTERN = /buggyDiscount:\s*(true|false)/;

const source = readFileSync(FILE, 'utf8');
const current = PATTERN.exec(source)?.[1];
if (!current) throw new Error('Could not find the buggyDiscount flag in demo-flags.ts');

const command = process.argv[2] ?? 'status';

if (command === 'status') {
  console.log(`buggyDiscount: ${current}`);
  process.exit(0);
}

const next = { break: 'true', fix: 'false' }[command];
if (!next) {
  console.error(`Unknown command "${command}". Use break, fix or status.`);
  process.exit(1);
}

writeFileSync(FILE, source.replace(PATTERN, `buggyDiscount: ${next}`));
console.log(
  next === 'true'
    ? 'Seeded the pricing bug. cart-totals and checkout-happy-path will now fail.'
    : 'Removed the pricing bug. The suite should be green again.'
);
