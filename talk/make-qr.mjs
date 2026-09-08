/**
 * Renders the QR codes the deck points at.
 *
 *   node talk/make-qr.mjs
 *
 * Reads talk/qr-links.json and writes talk/assets/qr-<name>.png for every entry
 * that has a URL. Entries left empty are skipped, and deck.js draws a visible
 * "QR pending" placeholder in their place rather than shipping a dead square.
 *
 * The PNGs are committed so rebuilding the deck needs no network.
 */
import { mkdirSync, writeFileSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import QRCode from 'qrcode';

const here = dirname(fileURLToPath(import.meta.url));
const links = JSON.parse(readFileSync(join(here, 'qr-links.json'), 'utf8'));
const outDir = join(here, 'assets');
mkdirSync(outDir, { recursive: true });

for (const [name, url] of Object.entries(links)) {
  if (!url) {
    console.log(`${name.padEnd(10)} — skipped, no URL in qr-links.json`);
    continue;
  }
  const png = await QRCode.toBuffer(url, {
    type: 'png',
    errorCorrectionLevel: 'M',
    margin: 1,
    scale: 12,
    color: { dark: '#10131AFF', light: '#FFFFFFFF' },
  });
  const file = join(outDir, `qr-${name}.png`);
  writeFileSync(file, png);
  console.log(`${name.padEnd(10)} — ${(png.length / 1024).toFixed(0)} KB  ${url}`);
}
