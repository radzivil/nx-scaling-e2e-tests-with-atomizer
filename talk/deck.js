const pptxgen = require('pptxgenjs');

const pres = new pptxgen();
pres.layout = 'LAYOUT_WIDE'; // 13.3 x 7.5
pres.author = 'Vladimir Radzivil';
pres.title = 'Scaling E2E Tests the Smart Way with Nx';

const W = 13.3;
const H = 7.5;
const M = 0.7;

// Palette: deep slate + signal green for "cached/fast", amber for "slow/before".
const C = {
  ink: '10131A',
  panel: '1B2029',
  line: '2C3340',
  text: 'FFFFFF',
  body: 'C3CAD6',
  muted: '8A94A6',
  accent: '4ADE80', // fast / cached
  warn: 'F5A524', // slow / before
  hot: 'FB7185', // failing
  cool: '60A5FA', // neutral highlight
};

const F = { head: 'Cambria', body: 'Calibri', mono: 'Courier New' };

const notes = (s, t) => s.addNotes(t);

function darkSlide() {
  const s = pres.addSlide();
  s.background = { color: C.ink };
  return s;
}

function lightSlide() {
  const s = pres.addSlide();
  s.background = { color: 'F7F8FA' };
  return s;
}

function kicker(s, text, color = C.accent) {
  s.addText(text.toUpperCase(), {
    x: M,
    y: 0.45,
    w: W - 2 * M,
    h: 0.3,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 12,
    bold: true,
    charSpacing: 2.5,
    color,
  });
}

function title(s, text, color) {
  s.addText(text, {
    x: M,
    y: 0.82,
    w: W - 2 * M,
    h: 0.8,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 38,
    bold: true,
    color: color ?? C.text,
  });
}

function code(s, lines, opts = {}) {
  const x = opts.x ?? M;
  const y = opts.y ?? 2.0;
  const w = opts.w ?? W - 2 * M;
  const fontSize = opts.fontSize ?? 15;
  const h = opts.h ?? 0.34 * lines.length + 0.5;
  s.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.06,
    fill: { color: opts.fill ?? '0A0D13' },
    line: { color: opts.stroke ?? C.line, width: 1 },
  });
  s.addText(
    lines.map((l, i) => ({
      text: l.text ?? l,
      options: { color: l.color ?? C.accent, breakLine: i < lines.length - 1, bold: l.bold ?? false },
    })),
    {
      x: x + 0.25,
      y: y + 0.22,
      w: w - 0.5,
      h: h - 0.44,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize,
      lineSpacingMultiple: 1.25,
      valign: 'top',
    }
  );
  return y + h;
}

function statCard(s, { x, y, w, value, label, color, sub }) {
  const h = sub ? 1.9 : 1.6;
  s.addShape(pres.ShapeType.roundRect, {
    x,
    y,
    w,
    h,
    rectRadius: 0.07,
    fill: { color: C.panel },
    line: { color: C.line, width: 1 },
  });
  s.addText(value, {
    x: x + 0.22,
    y: y + 0.2,
    w: w - 0.44,
    h: 0.75,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 40,
    bold: true,
    color,
  });
  s.addText(label, {
    x: x + 0.22,
    y: y + 0.98,
    w: w - 0.44,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 13,
    color: C.body,
  });
  if (sub) {
    s.addText(sub, {
      x: x + 0.22,
      y: y + 1.34,
      w: w - 0.44,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 11,
      italic: true,
      color: C.muted,
    });
  }
}

function bullets(s, items, opts = {}) {
  s.addText(
    items.map((it, i) => ({
      text: typeof it === 'string' ? it : it.text,
      options: {
        bullet: true,
        breakLine: i < items.length - 1,
        color: (typeof it === 'object' && it.color) || opts.color || C.body,
        bold: (typeof it === 'object' && it.bold) || false,
        paraSpaceAfter: 10,
      },
    })),
    {
      x: opts.x ?? M,
      y: opts.y ?? 2.1,
      w: opts.w ?? 5.6,
      h: opts.h ?? 3.4,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: opts.fontSize ?? 16,
      valign: 'top',
    }
  );
}

/* ── 01 title ─────────────────────────────────────────────────────── */
{
  const s = darkSlide();
  s.addText('Scaling E2E Tests', {
    x: M,
    y: 2.1,
    w: 10.5,
    h: 0.95,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 54,
    bold: true,
    color: C.text,
  });
  s.addText('the Smart Way with Nx', {
    x: M,
    y: 3.0,
    w: 10.5,
    h: 0.95,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 54,
    bold: true,
    color: C.accent,
  });
  s.addText('Atomizing, parallelising and caching a Cypress suite — without Nx Cloud', {
    x: M,
    y: 4.1,
    w: 10.5,
    h: 0.45,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 18,
    color: C.body,
  });
  s.addText('Vladimir Radzivil', {
    x: M,
    y: 5.6,
    w: 6,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 15,
    bold: true,
    color: C.text,
  });
  s.addText('Live demo: github.com/radzivil/nx-scaling-e2e-tests-with-atomizer', {
    x: M,
    y: 5.98,
    w: 8,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.mono,
    fontSize: 12,
    color: C.muted,
  });
  notes(
    s,
    'Framing: everything in this talk is measured on the repo linked below, and every command runs with no Nx Cloud account. Promise the audience three numbers: ~1m33s, ~40s, and 0.15s. Re-measure on your own machine the morning of the talk.'
  );
}

/* ── 02 agenda ────────────────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Agenda');
  title(s, 'Where this goes');

  const rows = [
    ['01', 'The problem', 'E2E is the slowest signal you have'],
    ['02', 'The atomizer', 'One target per spec file, generated for you'],
    ['03', 'The catch', 'Nx 23 gates the wrapper task behind Nx Cloud'],
    ['04', 'Parallel, no cloud', 'Two small scripts get the split back'],
    ['05', 'The cache', 'Why a re-run only executes the failures'],
    ['06', 'Scale', 'Three apps, 30 targets, one runner each'],
  ];

  rows.forEach(([n, head, sub], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * 6.15;
    const y = 2.0 + row * 1.35;
    s.addText(n, {
      x,
      y,
      w: 0.7,
      h: 0.5,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 20,
      bold: true,
      color: C.accent,
    });
    s.addText(head, {
      x: x + 0.75,
      y,
      w: 4.9,
      h: 0.38,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 18,
      bold: true,
      color: C.text,
    });
    s.addText(sub, {
      x: x + 0.75,
      y: y + 0.38,
      w: 4.9,
      h: 0.5,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 13,
      color: C.muted,
    });
  });
  notes(s, 'Sections 03, 05 and 06 are the new material versus the last time I gave this talk. Six rows, six sections — the scale section is where the monorepo argument lives.');
}

/* ── 03 the problem ───────────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 01 · The problem', C.warn);
  title(s, 'The suite is slow, so nobody runs it');

  bullets(
    s,
    [
      'One task, one process, every spec in sequence',
      'Ten to thirty minutes on a real suite',
      'So it moves to a nightly job',
      'So a failure is found the morning after it was written',
      'So the author has already moved on',
    ],
    { y: 2.1, w: 6.0, fontSize: 17 }
  );

  s.addShape(pres.ShapeType.roundRect, {
    x: 7.2,
    y: 2.0,
    w: 5.4,
    h: 2.9,
    rectRadius: 0.08,
    fill: { color: C.panel },
    line: { color: C.line, width: 1 },
  });
  s.addText('This repo, before any of it', {
    x: 7.45,
    y: 2.2,
    w: 4.9,
    h: 0.3,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 13,
    color: C.muted,
  });
  s.addText('1m 33s', {
    x: 7.45,
    y: 2.55,
    w: 4.9,
    h: 0.9,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 52,
    bold: true,
    color: C.warn,
  });
  s.addText('10 spec files · 56 tests · one Cypress process', {
    x: 7.45,
    y: 3.5,
    w: 4.9,
    h: 0.3,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 13,
    color: C.body,
  });
  s.addText('Scale that to 200 specs and you have the nightly job.', {
    x: 7.45,
    y: 3.95,
    w: 4.9,
    h: 0.7,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 13,
    italic: true,
    color: C.muted,
  });

  s.addText('Speed of feedback is speed of delivery.', {
    x: M,
    y: 5.5,
    w: 11.9,
    h: 0.5,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 22,
    italic: true,
    color: C.text,
  });
  notes(s, 'Run `npx nx e2e shop-e2e` before the talk so the number on screen is one they just watched.');
}

/* ── 04 nx context ────────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 02 · Context', '0B7A44');
  title(s, 'Nx is a task graph, not a test runner', '10131A');

  const cards = [
    ['Knows your graph', 'Which projects exist, what depends on what, which files feed which task.'],
    ['Schedules tasks', 'Runs independent tasks concurrently and orders the dependent ones.'],
    ['Hashes every task', 'Inputs in, hash out. Same hash means the answer is already known.'],
  ];
  cards.forEach(([h, b], i) => {
    const x = M + i * 4.05;
    s.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.15,
      w: 3.75,
      h: 2.2,
      rectRadius: 0.07,
      fill: { color: 'FFFFFF' },
      line: { color: 'DFE4EC', width: 1 },
    });
    s.addShape(pres.ShapeType.ellipse, { x: x + 0.25, y: 2.4, w: 0.42, h: 0.42, fill: { color: '0B7A44' } });
    s.addText(String(i + 1), {
      x: x + 0.25,
      y: 2.4,
      w: 0.42,
      h: 0.42,
      isTextBox: true,
      margin: 0,
      align: 'center',
      valign: 'middle',
      fontFace: F.body,
      fontSize: 15,
      bold: true,
      color: 'FFFFFF',
    });
    s.addText(h, {
      x: x + 0.8,
      y: 2.42,
      w: 2.75,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 16,
      bold: true,
      color: '10131A',
    });
    s.addText(b, {
      x: x + 0.25,
      y: 3.0,
      w: 3.25,
      h: 1.1,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 13,
      color: '55607A',
    });
  });

  code(
    s,
    [{ text: 'nx run-many -t test --parallel=5', color: '3DDC84' }],
    { y: 4.75, h: 0.85, fill: '10131A', stroke: '10131A', fontSize: 17 }
  );
  s.addText('That much most teams already have. The interesting part is what Nx can generate for you.', {
    x: M,
    y: 5.75,
    w: 11.9,
    h: 0.4,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 14,
    italic: true,
    color: '55607A',
  });
  notes(s, 'Keep this short — 60 seconds. The hashing bullet is the one that pays off in section 05.');
}

/* ── 05 atomizer concept ──────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 02 · The atomizer');
  title(s, 'One task becomes one task per file');

  // before
  s.addText('BEFORE', {
    x: M,
    y: 2.05,
    w: 2.6,
    h: 0.3,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 12,
    bold: true,
    charSpacing: 2,
    color: C.warn,
  });
  s.addShape(pres.ShapeType.roundRect, {
    x: M,
    y: 2.45,
    w: 2.6,
    h: 2.6,
    rectRadius: 0.07,
    fill: { color: C.panel },
    line: { color: C.warn, width: 1.5 },
  });
  s.addText('e2e', {
    x: M,
    y: 3.35,
    w: 2.6,
    h: 0.5,
    isTextBox: true,
    margin: 0,
    align: 'center',
    fontFace: F.mono,
    fontSize: 22,
    bold: true,
    color: C.text,
  });
  s.addText('56 tests, in a row', {
    x: M,
    y: 3.85,
    w: 2.6,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    align: 'center',
    fontFace: F.body,
    fontSize: 12,
    color: C.muted,
  });

  s.addShape(pres.ShapeType.rightArrow, {
    x: 3.55,
    y: 3.5,
    w: 0.85,
    h: 0.45,
    fill: { color: C.accent },
    line: { color: C.accent, width: 0 },
  });

  // after
  s.addText('AFTER', {
    x: 4.65,
    y: 2.05,
    w: 3.6,
    h: 0.3,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 12,
    bold: true,
    charSpacing: 2,
    color: C.accent,
  });
  const specs = ['catalog.cy.ts', 'search.cy.ts', 'cart-totals.cy.ts', 'login.cy.ts', 'checkout-*.cy.ts', '…10 in total'];
  specs.forEach((name, i) => {
    const y = 2.45 + i * 0.44;
    s.addShape(pres.ShapeType.roundRect, {
      x: 4.65,
      y,
      w: 3.6,
      h: 0.36,
      rectRadius: 0.05,
      fill: { color: i === 5 ? C.ink : C.panel },
      line: { color: i === 5 ? C.line : C.accent, width: 1 },
    });
    s.addText(name, {
      x: 4.8,
      y,
      w: 3.3,
      h: 0.36,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.mono,
      fontSize: 11,
      color: i === 5 ? C.muted : C.text,
    });
  });

  bullets(
    s,
    [
      { text: 'Generated, not written by hand', bold: true, color: C.text },
      'Add a spec file, get a target',
      'Each one is independently runnable',
      'Each one is independently cacheable',
      'Each one fails on its own',
    ],
    { x: 8.7, y: 2.45, w: 3.9, fontSize: 15 }
  );
  notes(s, 'Stress "generated". Nobody maintains this list — that is the difference from hand-rolled spec sharding.');
}

/* ── 06 how to turn it on ─────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 02 · Setup', '0B7A44');
  title(s, 'Turning it on', '10131A');

  s.addText('1 · Add the plugin', {
    x: M,
    y: 2.0,
    w: 5.6,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 16,
    bold: true,
    color: '10131A',
  });
  code(s, [{ text: 'nx add @nx/cypress', color: '3DDC84' }], {
    x: M,
    y: 2.4,
    w: 5.6,
    h: 0.84,
    fill: '10131A',
    stroke: '10131A',
    fontSize: 15,
  });

  s.addText('2 · It registers this in nx.json', {
    x: M,
    y: 3.3,
    w: 5.6,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 16,
    bold: true,
    color: '10131A',
  });
  code(
    s,
    [
      { text: '{', color: 'C3CAD6' },
      { text: '  "plugin": "@nx/cypress/plugin",', color: '7DD3FC' },
      { text: '  "options": {', color: 'C3CAD6' },
      { text: '    "targetName": "e2e",', color: '3DDC84' },
      { text: '    "ciTargetName": "e2e-ci"', color: '3DDC84' },
      { text: '  }', color: 'C3CAD6' },
      { text: '}', color: 'C3CAD6' },
    ],
    { x: M, y: 3.7, w: 5.6, fill: '10131A', stroke: '10131A', fontSize: 13 }
  );

  s.addText('3 · Ask what you got', {
    x: 6.9,
    y: 2.0,
    w: 5.7,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 16,
    bold: true,
    color: '10131A',
  });
  code(
    s,
    [
      { text: 'nx show project shop-e2e --json', color: '3DDC84' },
      { text: '', color: 'C3CAD6' },
      { text: 'e2e', color: '8A94A6' },
      { text: 'e2e-ci', color: 'F5A524' },
      { text: 'e2e-ci--src/e2e/catalog.cy.ts', color: '7DD3FC' },
      { text: 'e2e-ci--src/e2e/search.cy.ts', color: '7DD3FC' },
      { text: 'e2e-ci--src/e2e/login.cy.ts', color: '7DD3FC' },
      { text: '…', color: '8A94A6' },
    ],
    { x: 6.9, y: 2.4, w: 5.7, fill: '10131A', stroke: '10131A', fontSize: 13 }
  );

  s.addText('Note the real names: one target per file path — not spec1, spec2, spec3.', {
    x: 6.9,
    y: 5.85,
    w: 5.7,
    h: 0.5,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 13,
    italic: true,
    color: '55607A',
  });
  notes(s, 'Do this live. Piping through `npm run e2e:targets` gives a cleaner list if the JSON is too wide for the screen.');
}

/* ── 07 the catch ─────────────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 03 · The catch', C.hot);
  title(s, 'Then Nx 23 tells you no');

  code(
    s,
    [{ text: 'nx run-many -t e2e-ci --parallel=5', color: 'FFFFFF' }],
    { y: 1.95, h: 0.8, fill: '0A0D13', stroke: C.line, fontSize: 17 }
  );

  s.addShape(pres.ShapeType.roundRect, {
    x: M,
    y: 2.95,
    w: W - 2 * M,
    h: 1.35,
    rectRadius: 0.07,
    fill: { color: '2A1116' },
    line: { color: C.hot, width: 1.5 },
  });
  s.addText(
    [
      { text: 'NX   The shop-e2e:e2e-ci task should only be run with Nx Cloud.', options: { breakLine: true, color: C.hot, bold: true } },
      { text: 'Please enable Nx Cloud or use the slower "e2e" task.', options: { color: 'F5B7C0' } },
    ],
    {
      x: M + 0.3,
      y: 3.2,
      w: W - 2 * M - 0.6,
      h: 0.9,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 14,
      lineSpacingMultiple: 1.3,
    }
  );

  s.addText('The gate is on the wrapper, not on the work.', {
    x: M,
    y: 4.55,
    w: 11.9,
    h: 0.45,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 24,
    bold: true,
    color: C.accent,
  });

  bullets(
    s,
    [
      { text: 'e2e-ci is a no-op coordinator that just depends on the ten real tasks', color: C.body },
      { text: 'The ten atomized targets are ordinary nx:run-commands tasks', color: C.body },
      { text: 'Run one directly and it works, cache and all', color: C.body },
    ],
    { y: 5.1, w: 11.9, h: 1.7, fontSize: 15 }
  );
  notes(
    s,
    'This is the slide that did not exist last time. Nx 23 added the guard. Show the error live, then immediately run one atomized target directly to prove the split itself is free.'
  );
}

/* ── 08 proof it still runs ───────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 04 · Parallel, no cloud');
  title(s, 'Ask for the list yourself');

  code(
    s,
    [
      { text: '# the gate does not apply to the leaf tasks', color: C.muted },
      { text: 'nx run "shop-e2e:e2e-ci--src/e2e/catalog.cy.ts"   ✓', color: C.accent },
      { text: '', color: C.muted },
      { text: '# so discover them, then hand them to run-many', color: C.muted },
      { text: 'node tools/shard-e2e.mjs --parallel=5', color: C.text, bold: true },
    ],
    { y: 1.95, fontSize: 15 }
  );

  statCard(s, { x: M, y: 4.25, w: 3.75, value: '1m 33s', label: 'One task, all specs', color: C.warn });
  statCard(s, { x: M + 4.05, y: 4.25, w: 3.75, value: '40s', label: 'Atomized, 5 at a time', color: C.accent });
  statCard(s, {
    x: M + 8.1,
    y: 4.25,
    w: 3.75,
    value: '2.3×',
    label: 'On one laptop, no cloud',
    color: C.cool,
  });
  notes(s, 'Run it live. Forty seconds is short enough to actually watch the specs stream past. Timings vary run to run — say "about forty seconds", not a precise figure.');
}

/* ── 09 the honest slide ──────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 04 · The part people skip', 'B45309');
  title(s, 'Splitting alone makes it slower', '10131A');

  const bars = [
    { label: 'One task, all specs', v: 93, color: 'F5A524' },
    { label: 'Atomized, one at a time', v: 115, color: 'FB7185' },
    { label: 'Atomized, five at a time', v: 40, color: '0B7A44' },
  ];
  const maxW = 7.6;
  bars.forEach((b, i) => {
    const y = 2.3 + i * 1.0;
    s.addText(b.label, {
      x: M,
      y,
      w: 3.4,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.body,
      fontSize: 14,
      color: '10131A',
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 3.5,
      y: y + 0.06,
      w: Math.max(0.5, (b.v / 115) * maxW),
      h: 0.34,
      rectRadius: 0.04,
      fill: { color: b.color },
      line: { color: b.color, width: 0 },
    });
    s.addText(`${Math.floor(b.v / 60) ? `${Math.floor(b.v / 60)}m ` : ''}${b.v % 60}s`, {
      x: M + 3.6 + Math.max(0.5, (b.v / 115) * maxW),
      y,
      w: 1.4,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.body,
      fontSize: 14,
      bold: true,
      color: '10131A',
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M,
    y: 5.45,
    w: W - 2 * M,
    h: 1.15,
    rectRadius: 0.07,
    fill: { color: 'FFF7E6' },
    line: { color: 'F5A524', width: 1 },
  });
  s.addText(
    'Every atomized target boots its own Cypress. Ten specs through the atomizer, run serially, cost 22 seconds more than not splitting at all. Atomization is not a speedup — it is what makes a speedup possible.',
    {
      x: M + 0.3,
      y: 5.62,
      w: W - 2 * M - 0.6,
      h: 0.85,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 14,
      color: '5B4308',
    }
  );
  notes(s, 'Being upfront about the overhead buys credibility for the cache claims coming next.');
}

/* ── 10 the cache ─────────────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 05 · The cache');
  title(s, 'Run it again. Nothing runs.');

  code(
    s,
    [
      { text: 'node tools/shard-e2e.mjs --parallel=5    # again, unchanged', color: C.muted },
      { text: '', color: C.muted },
      { text: 'Run duration:  160ms', color: C.accent, bold: true },
      { text: 'Cache:         11/12 hit (92%)', color: C.accent, bold: true },
    ],
    { y: 1.95, fontSize: 16 }
  );

  s.addText('40s → 0.16s', {
    x: M,
    y: 4.05,
    w: 5.6,
    h: 0.9,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 44,
    bold: true,
    color: C.accent,
  });

  bullets(
    s,
    [
      'Nx hashed each task: the spec file, the app source it depends on, the Cypress version',
      'Same hash, so the stored result is replayed instead of recomputed',
      'This is per-machine and on disk in .nx/cache — no account, no network',
    ],
    { x: 6.5, y: 4.15, w: 6.1, h: 2.9, fontSize: 15 }
  );
  notes(s, 'Hit up-arrow and enter. The whole point is that it returns before you finish the sentence.');
}

/* ── 11 rerun only failures ───────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 05 · The payoff', C.hot);
  title(s, 'A retry only runs what failed');

  s.addText('Nx never caches a failed task.', {
    x: M,
    y: 1.85,
    w: 11.9,
    h: 0.45,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 24,
    bold: true,
    color: C.hot,
  });

  const specs = [
    ['catalog', true],
    ['search', true],
    ['filters', true],
    ['product-detail', true],
    ['cart-add', true],
    ['cart-totals', false],
    ['login', true],
    ['checkout-validation', true],
    ['checkout-happy-path', false],
    ['orders', true],
  ];
  specs.forEach(([name, ok], i) => {
    const col = i % 5;
    const row = Math.floor(i / 5);
    const x = M + col * 2.42;
    const y = 2.45 + row * 0.85;
    s.addShape(pres.ShapeType.roundRect, {
      x,
      y,
      w: 2.25,
      h: 0.68,
      rectRadius: 0.06,
      fill: { color: ok ? '10251A' : '2A1116' },
      line: { color: ok ? C.accent : C.hot, width: 1.2 },
    });
    s.addText(ok ? 'CACHED' : 'RE-RAN', {
      x: x + 0.15,
      y: y + 0.06,
      w: 1.95,
      h: 0.26,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 9,
      bold: true,
      charSpacing: 1.5,
      color: ok ? C.accent : C.hot,
    });
    s.addText(name, {
      x: x + 0.15,
      y: y + 0.32,
      w: 1.95,
      h: 0.3,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 10,
      color: C.text,
    });
  });

  s.addText(
    'No test-name bookkeeping. No --only-failures flag. No plugin. A cache that stores successes gives you failure-only retries for free — locally and on CI.',
    {
      x: M,
      y: 4.35,
      w: 11.9,
      h: 0.6,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 15,
      color: C.body,
    }
  );

  statCard(s, { x: M, y: 5.15, w: 3.75, value: '37s', label: 'First run, 2 specs fail', color: C.warn });
  statCard(s, { x: M + 4.05, y: 5.15, w: 3.75, value: '28s', label: 'Retry: 9 of 10 replayed', color: C.accent });
  statCard(s, { x: M + 8.1, y: 5.15, w: 3.75, value: '2', label: 'Specs that actually ran', color: C.hot });
  notes(
    s,
    'Be honest about 37→28: the two seeded failures are the two slowest specs and each still boots Cypress. The saving scales with how many specs pass — on 200 specs with 3 failures it is enormous.'
  );
}

/* ── 12 content addressed ─────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 05 · The bit that surprises people', '0B7A44');
  title(s, 'The cache is content-addressed', '10131A');

  const steps = [
    ['Green suite', 'hash A', 'cached', '0B7A44'],
    ['Seed the bug', 'hash B', '2 fail, 8 cached at B', 'FB7185'],
    ['Revert the bug', 'hash A again', 'all 10 replay — 226ms', '0B7A44'],
  ];
  steps.forEach(([h, hash, res, color], i) => {
    const x = M + i * 4.05;
    s.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.2,
      w: 3.75,
      h: 2.35,
      rectRadius: 0.07,
      fill: { color: 'FFFFFF' },
      line: { color: 'DFE4EC', width: 1 },
    });
    s.addText(String(i + 1), {
      x: x + 0.25,
      y: 2.4,
      w: 0.5,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 18,
      bold: true,
      color,
    });
    s.addText(h, {
      x: x + 0.25,
      y: 2.85,
      w: 3.25,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 17,
      bold: true,
      color: '10131A',
    });
    s.addText(hash, {
      x: x + 0.25,
      y: 3.3,
      w: 3.25,
      h: 0.35,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 13,
      color: '55607A',
    });
    s.addText(res, {
      x: x + 0.25,
      y: 3.72,
      w: 3.25,
      h: 0.6,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 13,
      bold: true,
      color,
    });
  });

  s.addText('Undoing a change gives you your old results back. Nothing re-runs, because Nx already knows the answer for that exact input.', {
    x: M,
    y: 4.85,
    w: 11.9,
    h: 0.6,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 15,
    color: '55607A',
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M,
    y: 5.55,
    w: W - 2 * M,
    h: 1.0,
    rectRadius: 0.07,
    fill: { color: 'F0F5FF' },
    line: { color: '9CC0F5', width: 1 },
  });
  s.addText(
    'The flip side: touch libs/ui and both admin and docs invalidate — correctly. But the key is built from inputs, not from the commit, so a change outside the graph costs nothing.',
    {
      x: M + 0.3,
      y: 5.75,
      w: W - 2 * M - 0.6,
      h: 0.65,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 14,
      color: '1D3F73',
    }
  );
  notes(s, 'If you want the "everything re-runs" version instead, run nx reset before this step. Best real example from this repo: a commit that touched only the slide deck restored the previous commit\'s cache and reported 33/36 hits and a 119ms run — the single-machine CI job went from 3m44s to 35s without anyone planning it. Inputs, not commits.');
}

/* ── 13 scale: the workspace ──────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 06 · Scale');
  title(s, 'Now do it for a whole monorepo');

  const apps = [
    { name: 'shop', desc: 'storefront', deps: 'formatting', color: C.accent },
    { name: 'admin', desc: 'back-office', deps: 'ui + formatting', color: C.cool },
    { name: 'docs', desc: 'documentation', deps: 'ui', color: 'C084FC' },
  ];
  apps.forEach((a, i) => {
    const x = M + i * 4.05;
    s.addShape(pres.ShapeType.roundRect, {
      x,
      y: 2.0,
      w: 3.75,
      h: 1.75,
      rectRadius: 0.08,
      fill: { color: C.panel },
      line: { color: a.color, width: 1.5 },
    });
    s.addText(a.name, {
      x: x + 0.25,
      y: 2.2,
      w: 3.2,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 20,
      bold: true,
      color: a.color,
    });
    s.addText(a.desc, {
      x: x + 0.25,
      y: 2.62,
      w: 3.2,
      h: 0.3,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 13,
      color: C.body,
    });
    s.addText('10 specs → 10 targets', {
      x: x + 0.25,
      y: 2.94,
      w: 3.2,
      h: 0.3,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 12,
      color: C.muted,
    });
    s.addText(`uses ${a.deps}`, {
      x: x + 0.25,
      y: 3.24,
      w: 3.2,
      h: 0.3,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 11,
      color: C.muted,
    });
  });

  statCard(s, { x: M, y: 4.15, w: 3.75, value: '30', label: 'atomized targets', color: C.accent });
  statCard(s, { x: M + 4.05, y: 4.15, w: 3.75, value: '202', label: 'tests across three apps', color: C.text });
  statCard(s, { x: M + 8.1, y: 4.15, w: 3.75, value: '2', label: 'shared libs, on purpose', color: C.cool });

  s.addText(
    'The libs are shared unevenly — that is the point. No single change invalidates all three apps.',
    {
      x: M,
      y: 6.0,
      w: W - 2 * M,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 14,
      italic: true,
      color: C.muted,
    }
  );
  notes(
    s,
    'Everything up to here was one app. This is where it becomes a monorepo talk. 202 tests is the honest count: 56 shop, 78 admin, 68 docs. The uneven lib sharing is deliberate set-up for the affected slide two along.'
  );
}

/* ── 14 the ladder ────────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 06 · The numbers', '0B7A44');
  title(s, 'Climb only as far as you need', '10131A');

  const bars = [
    { rung: '1', label: 'Un-atomized, one process per app', v: 260, color: 'F5A524' },
    { rung: '2', label: 'Atomized, but still serial', v: 342, color: 'C2410C' },
    { rung: '3', label: 'Atomized, 5 at a time, one machine', v: 152, color: '0B7A44' },
    { rung: '4', label: 'One runner per app, 5 at a time each', v: 55, color: '0B7A44' },
    { rung: '—', label: 'Re-run, nothing changed', v: 5, color: '15803D' },
  ];
  const maxW = 6.9;
  bars.forEach((b, i) => {
    const y = 2.1 + i * 0.82;
    s.addText(b.rung, {
      x: M,
      y,
      w: 0.4,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.mono,
      fontSize: 15,
      bold: true,
      color: '8A94A6',
    });
    s.addText(b.label, {
      x: M + 0.45,
      y,
      w: 4.0,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.body,
      fontSize: 13,
      color: '10131A',
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 4.5,
      y: y + 0.07,
      w: Math.max(0.08, (b.v / 342) * maxW),
      h: 0.32,
      rectRadius: 0.04,
      fill: { color: b.color },
      line: { color: b.color, width: 0 },
    });
    const mins = Math.floor(b.v / 60);
    s.addText(`${mins ? `${mins}m ` : ''}${b.v % 60}s`, {
      x: M + 4.6 + Math.max(0.08, (b.v / 342) * maxW),
      y,
      w: 1.5,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.body,
      fontSize: 14,
      bold: true,
      color: '10131A',
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M,
    y: 6.3,
    w: W - 2 * M,
    h: 0.75,
    rectRadius: 0.07,
    fill: { color: 'FFF7E6' },
    line: { color: 'F5A524', width: 1 },
  });
  s.addText(
    'Rung 2 is still the honest one: at 30 specs, atomizing without parallelism is 31% slower than not atomizing at all.',
    {
      x: M + 0.3,
      y: 6.47,
      w: W - 2 * M - 0.6,
      h: 0.45,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 14,
      color: '5B4308',
    }
  );
  notes(
    s,
    'The headline is 4m20s to 55s, but do not skip rung 2. Rung 3 is one flag and gets most of the win; rung 4 needs CI to have a matrix. Tell them to climb only as far as their pain justifies. Re-measure with npm run e2e:benchmark before the talk — rung 3 varied between 2m11s and 2m32s on repeats.'
  );
}

/* ── 15 one runner per app ────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 06 · Distribution');
  title(s, 'One runner per app, not per shard');

  code(
    s,
    [
      { text: '- id: list', color: '7DD3FC' },
      { text: '  run: echo "projects=$(node tools/e2e-targets.mjs --projects-json)"', color: C.accent },
      { text: '', color: C.text },
      { text: 'strategy:', color: '7DD3FC' },
      { text: '  matrix: { project: "${{ fromJson(needs.discover.outputs.projects) }}" }', color: C.text },
    ],
    { y: 1.95, w: 7.9, fontSize: 11 }
  );

  bullets(
    s,
    [
      { text: 'The matrix comes from the graph — a 4th app adds a runner by itself', color: C.body },
      { text: 'One preview server per runner, nothing to balance', color: C.body },
      { text: 'Costs ~40s up front: discovery needs npm ci before anything starts', color: C.warn },
      { text: 'Measured: 3m 44s on one machine → 1m 53s across three', color: C.accent, bold: true },
    ],
    { x: 8.8, y: 1.95, w: 3.8, fontSize: 12, h: 2.6 }
  );

  s.addText('Why not shard by index?', {
    x: M,
    y: 4.35,
    w: 11.9,
    h: 0.4,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 16,
    bold: true,
    color: C.warn,
  });
  const why = [
    ['Three servers, not one', 'A shard spanning apps makes Nx build and boot every app on that runner.'],
    ['Nothing to rebalance', 'Similar-sized apps are already even. Slicing them evenly again buys nothing.'],
    ['run-many is a cross product', 'shop and admin both have login.cy.ts. A cross-app shard runs the wrong one.'],
  ];
  why.forEach(([h, b], i) => {
    const x = M + i * 4.05;
    s.addShape(pres.ShapeType.roundRect, {
      x,
      y: 4.85,
      w: 3.75,
      h: 1.55,
      rectRadius: 0.07,
      fill: { color: C.panel },
      line: { color: C.line, width: 1 },
    });
    s.addText(h, {
      x: x + 0.22,
      y: 5.03,
      w: 3.3,
      h: 0.35,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 14,
      bold: true,
      color: C.text,
    });
    s.addText(b, {
      x: x + 0.22,
      y: 5.41,
      w: 3.3,
      h: 0.9,
      isTextBox: true,
      margin: 0,
      valign: 'top',
      fontFace: F.body,
      fontSize: 12,
      color: C.muted,
    });
  });
  notes(
    s,
    'Sharding by index is the answer people expect, so say why it is the wrong default here and keep it for the case it is good at: one app big enough to dominate. The cross-product point is real — this repo has two login.cy.ts files and the runner refuses the selection rather than quietly running both.'
  );
}

/* ── 16 affected ──────────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 06 · The graph earns its keep', '0B7A44');
  title(s, 'Let the graph pick the work', '10131A');

  const rows = [
    ['libs/formatting', 'shop + admin', '20 targets', 'F5A524'],
    ['libs/ui', 'admin + docs', '20 targets', 'F5A524'],
    ['apps/docs/**', 'docs', '10 targets', '0B7A44'],
    ['a README typo', 'nothing at all', '0 targets', '15803D'],
  ];
  s.addText('You touch', {
    x: M,
    y: 2.15,
    w: 3.6,
    h: 0.3,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 12,
    bold: true,
    charSpacing: 1.5,
    color: '8A94A6',
  });
  s.addText('Nx runs', {
    x: M + 4.2,
    y: 2.15,
    w: 3.6,
    h: 0.3,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 12,
    bold: true,
    charSpacing: 1.5,
    color: '8A94A6',
  });
  rows.forEach(([touch, runs, count, color], i) => {
    const y = 2.6 + i * 0.78;
    s.addText(touch, {
      x: M,
      y,
      w: 4.0,
      h: 0.45,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.mono,
      fontSize: 15,
      color: '10131A',
    });
    s.addText(runs, {
      x: M + 4.2,
      y,
      w: 4.0,
      h: 0.45,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.body,
      fontSize: 15,
      color: '10131A',
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 8.6,
      y: y + 0.04,
      w: 1.9,
      h: 0.38,
      rectRadius: 0.19,
      fill: { color: color === '15803D' ? 'DCF5E7' : color === '0B7A44' ? 'DCF5E7' : 'FDF0D5' },
      line: { width: 0 },
    });
    s.addText(count, {
      x: M + 8.6,
      y: y + 0.04,
      w: 1.9,
      h: 0.38,
      isTextBox: true,
      margin: 0,
      align: 'center',
      valign: 'middle',
      fontFace: F.body,
      fontSize: 12,
      bold: true,
      color: color === 'F5A524' ? '7A5200' : '14603C',
    });
  });

  s.addText(
    'This is the argument for keeping e2e in the monorepo: the graph already knows which apps a shared component can break.',
    {
      x: M,
      y: 6.05,
      w: W - 2 * M,
      h: 0.5,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 15,
      italic: true,
      color: '5C6675',
    }
  );
  notes(
    s,
    'Run this live: npm run e2e:affected on a clean tree exits green instantly, then touch libs/ui and watch two apps light up. The last row is the one that lands — most CI runs on most days are documentation and config.'
  );
}

/* ── 17 gotchas ───────────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Before you try this at work', 'B45309');
  title(s, 'Six things that will bite you', '10131A');

  const items = [
    ['Per-task startup tax', 'Each atomized target boots Cypress. Parallelism has to beat it.'],
    ['e2e-ci is gated on Nx 23', 'The wrapper needs Nx Cloud. The leaf targets do not.'],
    ['The cache is not in .nx/cache', 'Nx 23 puts it in ~/.nx/<hash>/cache. Every CI recipe online caches the wrong path.'],
    ['Parallel Cypress fights over :99', 'Each process spawns its own Xvfb. Start one and export DISPLAY.'],
    ['Cache the Cypress binary', 'Otherwise every CI shard re-downloads ~200 MB.'],
    ['App changes invalidate everything', 'Correct, but it limits when failure-only retries help.'],
  ];
  items.forEach(([h, b], i) => {
    const y = 2.05 + i * 0.85;
    s.addShape(pres.ShapeType.ellipse, { x: M, y: y + 0.06, w: 0.4, h: 0.4, fill: { color: 'B45309' } });
    s.addText(String(i + 1), {
      x: M,
      y: y + 0.06,
      w: 0.4,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      align: 'center',
      valign: 'middle',
      fontFace: F.body,
      fontSize: 14,
      bold: true,
      color: 'FFFFFF',
    });
    s.addText(h, {
      x: M + 0.6,
      y,
      w: 4.4,
      h: 0.4,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.body,
      fontSize: 16,
      bold: true,
      color: '10131A',
    });
    s.addText(b, {
      x: M + 5.1,
      y,
      w: 6.8,
      h: 0.5,
      isTextBox: true,
      margin: 0,
      valign: 'middle',
      fontFace: F.body,
      fontSize: 14,
      color: '55607A',
    });
  });
  notes(s, 'Good slide to leave up during questions. Items 3 and 4 both bit this repo on its first CI run — worth telling as war stories rather than reading out.');
}

/* ── 18 takeaways ─────────────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Takeaways');
  title(s, 'Five things to take back');

  const points = [
    ['Splitting is generated, not maintained', 'One target per spec file, from one plugin entry in nx.json.'],
    ['Splitting alone is not a speedup', 'It is the precondition for one. Concurrency has to beat the startup tax.'],
    ['The cache is the retry story', 'Failed tasks are never cached, so a retry runs only the failures.'],
    ['Distribute by app before by index', 'One server per runner, nothing to balance, and no cross-product traps.'],
    ['None of this needs Nx Cloud', 'The gate is on one convenience target. Discovery plus run-many gets around it.'],
  ];
  points.forEach(([h, b], i) => {
    const y = 1.95 + i * 1.02;
    s.addText(`0${i + 1}`, {
      x: M,
      y,
      w: 0.85,
      h: 0.45,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 22,
      bold: true,
      color: C.accent,
    });
    s.addText(h, {
      x: M + 0.95,
      y,
      w: 11,
      h: 0.42,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 19,
      bold: true,
      color: C.text,
    });
    s.addText(b, {
      x: M + 0.95,
      y: y + 0.44,
      w: 11,
      h: 0.42,
      isTextBox: true,
      margin: 0,
      fontFace: F.body,
      fontSize: 14,
      color: C.muted,
    });
  });
  notes(s, 'Land on number five. Most teams pay the slow-suite tax without ever having tried the free half of this.');
}

/* ── 19 q&a ───────────────────────────────────────────────────────── */
{
  const s = darkSlide();
  s.addText('Questions', {
    x: M,
    y: 2.5,
    w: 11.9,
    h: 1.0,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 56,
    bold: true,
    color: C.text,
  });
  s.addText('Clone it and run the demo yourself:', {
    x: M,
    y: 3.7,
    w: 11.9,
    h: 0.4,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 17,
    color: C.body,
  });
  code(
    s,
    [
      { text: 'git clone github.com/radzivil/nx-scaling-e2e-tests-with-atomizer', color: C.accent },
      { text: 'npm ci && npx cypress install', color: C.accent },
      { text: 'node tools/shard-e2e.mjs --parallel=5', color: C.text, bold: true },
    ],
    { y: 4.25, w: 9.0, fontSize: 15 }
  );
  s.addText('Vladimir Radzivil', {
    x: M,
    y: 6.3,
    w: 6,
    h: 0.35,
    isTextBox: true,
    margin: 0,
    fontFace: F.body,
    fontSize: 15,
    bold: true,
    color: C.muted,
  });
  notes(s, 'Leave the clone command up for the whole Q&A.');
}

pres.writeFile({ fileName: process.argv[2] || 'Scaling-E2E-Tests-with-Nx.pptx' }).then((f) => console.log('wrote', f));
