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

const fs = require('node:fs');
const path = require('node:path');

/**
 * Filled in from LinkedIn. The matching QR target lives in talk/qr-links.json;
 * run `node talk/make-qr.mjs` after changing it.
 */
const SPEAKER = {
  name: 'Vladimir Radzivil',
  title: 'Principal Consultant & Partner, Zühlke',
  handle: 'linkedin.com/in/vladimirradzivil',
};

/**
 * The speaker photo, cropped to a circle. Looks for assets/avatar.{png,jpg,jpeg}
 * and falls back to a dashed placeholder so a missing file is obvious on the
 * projector rather than a silent gap.
 */
function avatar(s, { x, y, size }) {
  const found = ['png', 'jpg', 'jpeg']
    .map((ext) => path.join(__dirname, `assets/avatar.${ext}`))
    .find((f) => fs.existsSync(f));

  if (found) {
    s.addImage({ path: found, x, y, w: size, h: size, rounding: true });
    return;
  }
  s.addShape(pres.ShapeType.ellipse, {
    x, y, w: size, h: size,
    fill: { color: '1B2029' },
    line: { color: 'FB7185', width: 1.5, dashType: 'dash' },
  });
  s.addText('PHOTO', {
    x, y, w: size, h: size, isTextBox: true, margin: 0,
    align: 'center', valign: 'middle',
    fontFace: F.body, fontSize: 11, color: 'FB7185',
  });
}

/**
 * A QR code on a white plate so it stays scannable on a dark slide. When the
 * PNG has not been generated yet, draws a loud placeholder instead of a dead
 * square — a QR that silently points nowhere is worse than an obvious gap.
 */
function qrPanel(s, { file, x, y, size, caption, pending, dark = true }) {
  const abs = path.join(__dirname, file);
  if (fs.existsSync(abs)) {
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: size, h: size, rectRadius: 0.06,
      fill: { color: 'FFFFFF' }, line: { width: 0 },
    });
    s.addImage({ path: abs, x: x + 0.13, y: y + 0.13, w: size - 0.26, h: size - 0.26 });
  } else {
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: size, h: size, rectRadius: 0.06,
      fill: { color: dark ? '1B2029' : 'EEF1F5' },
      line: { color: 'FB7185', width: 1.5, dashType: 'dash' },
    });
    s.addText(`${pending ?? 'QR'}\nnot generated`, {
      x, y, w: size, h: size, isTextBox: true, margin: 0,
      align: 'center', valign: 'middle',
      fontFace: F.body, fontSize: 13, color: 'FB7185',
    });
  }
  if (caption) {
    s.addText(caption, {
      x, y: y + size + 0.14, w: size, h: 0.35, isTextBox: true, margin: 0,
      align: 'center',
      fontFace: F.body, fontSize: 12, color: dark ? C.muted : '5C6675',
    });
  }
}

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

/**
 * Exact commands to run while a given slide is up. Kept here rather than in a
 * separate runbook so the deck and the demo cannot drift apart. Appended to the
 * speaker notes, so they are on the presenter screen, not on the projector.
 */
const DEMO = {
  prep:
    '\n\nBEFORE YOU PRESENT\n' +
    '  $ cd ~/IdeaProjects/nx-scaling-e2e-tests-with-atomizer\n' +
    '  $ npm ci && npx cypress install\n' +
    '  $ npm run demo:status      → expect buggyDiscount: false\n' +
    '  $ npx nx reset             → cold cache, so the first number is honest\n' +
    '  Keep a terminal in the repo root on a second screen or a split.',

  graph:
    '\n\nDEMO — show the real graph\n' +
    '  $ npx nx graph\n' +
    '  Opens a browser. Click shop, then ui, to show what depends on what.\n' +
    '  Ctrl+C when done. `npx nx graph --print` if the projector hates the browser.',

  baseline:
    '\n\nDEMO — the un-atomized baseline\n' +
    '  $ npx nx e2e shop-e2e\n' +
    '  ~1m 33s for ONE app. Start it, keep talking, come back to it.\n' +
    '  All three serially is 4m 20s — quote that, do not run it.',

  targets:
    '\n\nDEMO — what the atomizer generated\n' +
    '  $ npm run e2e:targets\n' +
    '  30 targets across 3 projects. Point out the names are file paths.',

  inspect:
    '\n\nDEMO — where the targets come from\n' +
    '  $ npx nx show project shop-e2e --json\n' +
    '  (wide — use `npm run e2e:targets` if the JSON does not fit the screen)\n' +
    '  $ grep -A8 "cypress/plugin" nx.json\n' +
    '  Nine lines of config generate all thirty targets.',

  gate:
    '\n\nDEMO — hit the gate, then walk around it\n' +
    '  $ npx nx run-many -t e2e-ci --parallel=5\n' +
    '  Fails, listing all three e2e-ci tasks. Read it out loud.\n' +
    '  $ npx nx run "shop-e2e:e2e-ci--src/e2e/catalog.cy.ts"\n' +
    '  Same plugin, one leaf target, green. ~25s from cold because it builds the\n' +
    '  app and starts preview first; a couple of seconds once those are cached.',

  parallelLocal:
    '\n\nDEMO — parallel on one machine\n' +
    '  $ npx nx reset\n' +
    '  $ node tools/run-e2e.mjs --project=shop-e2e --parallel=5\n' +
    '  ~40-46s across runs, against the 1m 33s baseline from earlier.\n' +
    '  Whole workspace if you have time: node tools/run-e2e.mjs --parallel=5  (~2m 06s)',

  ci:
    '\n\nDEMO — the same thing on CI\n' +
    '  $ gh run list --limit 5\n' +
    '  $ gh run view --web\n' +
    '  One job per app, and the matrix is generated from the graph:\n' +
    '  $ sed -n "1,40p" .github/workflows/e2e.yml',

  replay:
    '\n\nDEMO — run it again\n' +
    '  $ node tools/run-e2e.mjs --project=shop-e2e --parallel=5\n' +
    '  Up-arrow, enter. Back in ~0.2s with 11/12 cache hits.',

  rerunFailures:
    '\n\nDEMO — the money moment\n' +
    '  $ npm run demo:break\n' +
    '  $ node tools/run-e2e.mjs --project=shop-e2e --parallel=5   → ~40s, 2 fail\n' +
    '  $ node tools/run-e2e.mjs --project=shop-e2e --parallel=5   → ~28s, 9/10 cached\n' +
    '  Nothing changed between those two. Only the failures re-executed.',

  revert:
    '\n\nDEMO — undo it\n' +
    '  $ npm run demo:fix\n' +
    '  $ node tools/run-e2e.mjs --project=shop-e2e --parallel=5\n' +
    '  ~0.2s. Reverting restored the old input hash, so the old results came back.',

  benchmark:
    '\n\nDO NOT RUN THIS LIVE\n' +
    '  $ npm run e2e:benchmark\n' +
    '  ~15 minutes — it runs every rung from a cold cache.\n' +
    '  Run it the morning of the talk and read the numbers off this slide.',

  affected:
    '\n\nDEMO — let the graph choose\n' +
    '  $ npm run e2e:affected                                    → nothing affected, instant\n' +
    '  $ echo "/* demo */" >> libs/ui/src/styles.css\n' +
    '  $ node tools/e2e-targets.mjs --affected --projects-json   → ["admin-e2e","docs-e2e"]\n' +
    '  $ git checkout -- libs/ui/src/styles.css\n' +
    '  Discovery is instant. Only run the full affected suite (~1m 22s) if you have time.',
};

/* ── 01 introduction ─────────────────────────────────────────────────── */
{
  const s = darkSlide();
  s.addText('Scaling E2E Tests', {
    x: M, y: 1.55, w: 8.6, h: 0.95, isTextBox: true, margin: 0,
    fontFace: F.head, fontSize: 50, bold: true, color: C.text,
  });
  s.addText('the Smart Way with Nx', {
    x: M, y: 2.42, w: 8.6, h: 0.95, isTextBox: true, margin: 0,
    fontFace: F.head, fontSize: 50, bold: true, color: C.accent,
  });
  // Explicit break — left to wrap on its own this orphans "request" on line two
  s.addText(
    [
      { text: 'Making your slowest quality gate fast enough', options: { breakLine: true } },
      { text: 'to actually use and trust on every pull request', options: {} },
    ],
    {
      x: M, y: 3.5, w: 8.6, h: 0.85, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 17, color: C.body, lineSpacingMultiple: 1.15,
    }
  );

  s.addShape(pres.ShapeType.rect, { x: M, y: 4.62, w: 1.1, h: 0.035, fill: { color: C.accent }, line: { width: 0 } });

  avatar(s, { x: M, y: 4.9, size: 1.35 });

  s.addText(SPEAKER.name, {
    x: M + 1.65, y: 5.11, w: 6.9, h: 0.45, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 22, bold: true, color: C.text,
  });
  s.addText(SPEAKER.title, {
    x: M + 1.65, y: 5.56, w: 6.9, h: 0.4, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 15, color: C.body,
  });

  qrPanel(s, {
    file: 'assets/qr-linkedin.png',
    x: 9.7, y: 2.2, size: 2.5,
    caption: 'Connect on LinkedIn',
    pending: 'LinkedIn QR',
  });

  notes(
    s,
    'Thirty seconds on who you are, then move. The QR stays useful all talk — people scan it while you set up the demo. Everything in this deck was measured on the repo linked at the end; nothing needs an Nx Cloud account.' + DEMO.prep
  );
}

/* ── 02 why this topic ───────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Why this topic', '0B7A44');
  title(s, 'This one is not about AI', '10131A');

  const points = [
    ['It is engineering', 'Configuration and a task graph. No model, no prompt, no vendor.', '0B7A44'],
    ['It is from a real project', 'Fifteen applications, a suite that had grown past what one machine could run.', '0B7A44'],
    ['It applies to most teams', 'If you have e2e tests and a monorepo, you already have the preconditions.', '0B7A44'],
    ['You can use it today', 'Everything here is in the open-source plugin you probably already depend on.', '0B7A44'],
  ];
  points.forEach(([h, b], i) => {
    const y = 2.15 + i * 1.12;
    s.addShape(pres.ShapeType.rect, { x: M, y: y + 0.05, w: 0.05, h: 0.82, fill: { color: '0B7A44' }, line: { width: 0 } });
    s.addText(h, {
      x: M + 0.3, y, w: 11.6, h: 0.42, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 19, bold: true, color: '10131A',
    });
    s.addText(b, {
      x: M + 0.3, y: y + 0.44, w: 11.6, h: 0.42, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 14, color: '5C6675',
    });
  });

  s.addText('Change got cheap this year. Confidence did not.', {
    x: M, y: 6.75, w: W - 2 * M, h: 0.45, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 16, italic: true, color: '0B7A44',
  });
  notes(
    s,
    'Say the quiet part: every other talk today has AI in the title. This one earns attention by being the unglamorous thing that makes the glamorous thing safe. The last line sets up the next slide, so land it and pause.'
  );
}

/* ── 03 agenda ───────────────────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Agenda');
  title(s, 'Where this goes');

  const rows = [
    ['01', 'The problem', 'E2E is the slowest signal you have'],
    ['02', 'The atomizer', 'One target per spec file, generated for you'],
    ['03', 'The catch', 'Nx 23 gates the wrapper task behind Nx Cloud'],
    ['04', 'Parallel, no cloud', 'The same command locally and on CI'],
    ['05', 'The cache', 'Why a re-run only executes the failures'],
    ['06', 'Scale', 'Three apps, 30 targets, and what it did on a real project'],
  ];
  rows.forEach(([n, head, sub], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * 6.15;
    const y = 2.0 + row * 1.35;
    s.addText(n, {
      x, y, w: 0.7, h: 0.5, isTextBox: true, margin: 0,
      fontFace: F.mono, fontSize: 20, bold: true, color: C.accent,
    });
    s.addText(head, {
      x: x + 0.75, y, w: 4.9, h: 0.38, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 18, bold: true, color: C.text,
    });
    s.addText(sub, {
      x: x + 0.75, y: y + 0.38, w: 4.9, h: 0.5, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 13, color: C.muted,
    });
  });
  notes(s, 'Twenty seconds. Point at 05 and 06 as the parts worth staying for.');
}

/* ── 04-06 the problem · one question at a time ─────────────────────── */
{
  const qs = [
    'Who is using E2E tests?',
    'Whose suite is green right now?',
    'Who blocks a PR on it?',
  ];
  const asides = [
    'Ask it, then actually wait for the hands. Expect nearly everyone — that is the point, this is not a niche problem.',
    'Second question, same room. Expect far fewer hands and some laughter. Do not rush past that laugh — it is the whole talk in one reaction.',
    'Third question kills it. Expect almost no hands — nobody gates a merge on a suite they cannot trust. Reveal the line at the bottom and move; you have earned the next ten minutes.',
  ];

  // One slide per question so the room answers them one at a time. The cards
  // that are not yet asked stay as dim outlines, so nothing shifts position
  // between builds and people can see how many are still coming.
  for (let shown = 1; shown <= qs.length; shown++) {
    const s = lightSlide();
    kicker(s, 'Section 01 · The problem', 'B45309');
    title(s, 'A few questions for the room', '10131A');

    qs.forEach((q, i) => {
      const x = M + i * 4.05;
      const revealed = i < shown;
      const isLast = i === qs.length - 1;

      s.addShape(pres.ShapeType.roundRect, {
        x, y: 2.2, w: 3.75, h: 1.9, rectRadius: 0.09,
        fill: { color: revealed ? 'FFFFFF' : 'F2F4F7' },
        line: revealed
          ? { color: 'E2E6ED', width: 1 }
          : { color: 'DDE3EA', width: 1, dashType: 'dash' },
      });

      if (!revealed) {
        s.addText(String(i + 1), {
          x, y: 2.2, w: 3.75, h: 1.9, isTextBox: true, margin: 0,
          align: 'center', valign: 'middle',
          fontFace: F.head, fontSize: 40, bold: true, color: 'D8DEE7',
        });
        return;
      }

      s.addShape(pres.ShapeType.ellipse, {
        x: x + 0.25, y: 2.45, w: 0.62, h: 0.62,
        fill: { color: isLast ? 'FBE0E2' : 'DCF5E7' }, line: { width: 0 },
      });
      s.addText(String(i + 1), {
        x: x + 0.25, y: 2.45, w: 0.62, h: 0.62, isTextBox: true, margin: 0,
        align: 'center', valign: 'middle',
        fontFace: F.body, fontSize: 20, bold: true, color: isLast ? '8D1B22' : '14603C',
      });
      s.addText(q, {
        x: x + 0.25, y: 3.22, w: 3.25, h: 0.8, isTextBox: true, margin: 0,
        valign: 'top',
        fontFace: F.body, fontSize: 19, bold: true, color: '10131A',
      });
    });

    // the punchline only lands once all three have been asked
    if (shown === qs.length) {
      s.addShape(pres.ShapeType.roundRect, {
        x: M, y: 4.75, w: W - 2 * M, h: 1.15, rectRadius: 0.07,
        fill: { color: 'FFF7E6' }, line: { color: 'F5A524', width: 1 },
      });
      s.addText(
        'The distance between the first hand and the last one is this talk. Nobody blocks a merge on a suite that takes an hour and fails for reasons nobody trusts.',
        {
          x: M + 0.3, y: 4.95, w: W - 2 * M - 0.6, h: 0.8, isTextBox: true, margin: 0,
          fontFace: F.body, fontSize: 15, color: '5B4308',
        }
      );
    }

    notes(s, asides[shown - 1]);
  }
}

/* ── 07 why it matters now ───────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 01 · Why now', C.warn);
  title(s, 'Change got cheap. Confidence did not.');

  const cols = [
    ['Writing the change', 'MINUTES', 'AI writes it, reviews it, refactors it. That cost collapsed this year.', C.accent],
    ['Trusting the change', 'AN HOUR', 'Same suite, same nightly run, same shrug. That cost did not move.', C.hot],
  ];
  cols.forEach(([h, badge, body, color], i) => {
    const x = M + i * 6.15;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 1.95, w: 5.75, h: 2.05, rectRadius: 0.09,
      fill: { color: C.panel }, line: { color, width: 1.5 },
    });
    s.addText(h, {
      x: x + 0.3, y: 2.15, w: 5.15, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 18, bold: true, color: C.text,
    });
    s.addText(badge, {
      x: x + 0.3, y: 2.58, w: 5.15, h: 0.45, isTextBox: true, margin: 0,
      fontFace: F.mono, fontSize: 24, bold: true, charSpacing: 1, color,
    });
    s.addText(body, {
      x: x + 0.3, y: 3.12, w: 5.15, h: 0.75, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 13, color: C.body,
    });
  });

  s.addText('What it should cost instead', {
    x: M, y: 4.3, w: 11.9, h: 0.4, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 16, bold: true, color: C.warn,
  });

  const bars = [
    { label: 'Today — every change runs everything', mins: 60, color: C.warn },
    { label: 'Target — an isolated change', mins: 10, color: C.accent },
  ];
  const maxW = 5.4;
  bars.forEach((b, i) => {
    const y = 4.85 + i * 0.72;
    s.addText(b.label, {
      x: M, y, w: 4.3, h: 0.42, isTextBox: true, margin: 0, valign: 'middle',
      fontFace: F.body, fontSize: 14, color: C.body,
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 4.5, y: y + 0.07, w: (b.mins / 60) * maxW, h: 0.3, rectRadius: 0.04,
      fill: { color: b.color }, line: { width: 0 },
    });
    s.addText(`${b.mins} min`, {
      x: M + 4.65 + (b.mins / 60) * maxW, y, w: 1.6, h: 0.42, isTextBox: true, margin: 0, valign: 'middle',
      fontFace: F.body, fontSize: 15, bold: true, color: b.color,
    });
  });

  s.addText(
    'Ten minutes is a coffee. An hour is a context switch — so the suite moves to nightly, and nightly means nobody is gating on it.',
    {
      x: M, y: 6.35, w: W - 2 * M, h: 0.6, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 15, color: C.muted,
    }
  );
  notes(
    s,
    'The argument for caring, in one comparison. Do not oversell AI — the only claim is that the ratio moved: generation got cheap, verification did not, so verification is where the leverage is now. Ten minutes is not arbitrary; it is roughly what an isolated change costs once affected plus caching plus per-app runners are all doing their job, and it is what the real project landed on.'
  );
}

/* ── 08 the example repo ─────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 01 · The example', '0B7A44');
  title(s, 'One repo, three apps, one graph', '10131A');

  // Nx in its own words, so nobody has to take my paraphrase for it.
  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 1.72, w: W - 2 * M, h: 0.92, rectRadius: 0.08,
    fill: { color: 'FFFFFF' }, line: { color: 'E2E6ED', width: 1 },
  });
  s.addText(
    [
      { text: '“A build system with smart caching and task orchestration.”', options: { bold: true, color: '10131A' } },
      { text: '   nx.dev', options: { color: '8A94A6', fontSize: 12 } },
    ],
    {
      x: M + 0.3, y: 1.85, w: W - 2 * M - 0.6, h: 0.35, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 15,
    }
  );
  s.addText('It knows what depends on what, so it can skip work. It does not run your tests — Cypress still does that.', {
    x: M + 0.3, y: 2.2, w: W - 2 * M - 0.6, h: 0.35, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 13, color: '5C6675',
  });

  const apps = [
    { name: 'shop', x: 0.9 },
    { name: 'admin', x: 5.2 },
    { name: 'docs', x: 9.5 },
  ];
  const libs = [
    { name: 'formatting', x: 3.05 },
    { name: 'ui', x: 7.35 },
  ];

  // edges first so the boxes cover the line ends
  [
    { x: 2.35, w: 2.15, flipH: false }, // shop  -> formatting
    { x: 4.50, w: 2.15, flipH: true },  // admin -> formatting
    { x: 6.65, w: 2.15, flipH: false }, // admin -> ui
    { x: 8.80, w: 2.15, flipH: true },  // docs  -> ui
  ].forEach((e) => {
    s.addShape(pres.ShapeType.line, {
      x: e.x, y: 3.68, w: e.w, h: 0.8, flipH: e.flipH,
      line: { color: 'B8C0CC', width: 1.5 },
    });
  });

  apps.forEach((a) => {
    s.addText('10 specs', {
      x: a.x, y: 2.62, w: 2.9, h: 0.28, isTextBox: true, margin: 0,
      align: 'center', fontFace: F.body, fontSize: 12, color: '8A94A6',
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: a.x, y: 2.93, w: 2.9, h: 0.75, rectRadius: 0.08,
      fill: { color: '10131A' }, line: { color: '10131A', width: 1 },
    });
    s.addText(a.name, {
      x: a.x, y: 2.93, w: 2.9, h: 0.75, isTextBox: true, margin: 0,
      align: 'center', valign: 'middle',
      fontFace: F.mono, fontSize: 17, bold: true, color: 'FFFFFF',
    });
  });

  libs.forEach((l) => {
    s.addShape(pres.ShapeType.roundRect, {
      x: l.x, y: 4.48, w: 2.9, h: 0.7, rectRadius: 0.08,
      fill: { color: 'FFFFFF' }, line: { color: '0B7A44', width: 1.5 },
    });
    s.addText(l.name, {
      x: l.x, y: 4.48, w: 2.9, h: 0.7, isTextBox: true, margin: 0,
      align: 'center', valign: 'middle',
      fontFace: F.mono, fontSize: 15, color: '0B7A44',
    });
  });

  s.addText('shared libs', {
    x: 0.9, y: 4.48, w: 1.95, h: 0.7, isTextBox: true, margin: 0,
    align: 'right', valign: 'middle',
    fontFace: F.body, fontSize: 12, italic: true, color: '8A94A6',
  });

  [
    ['30', 'spec files', '0B7A44'],
    ['202', 'tests', '10131A'],
    ['3', 'tasks that can run them', 'B45309'],
  ].forEach(([v, l, c], i) => {
    const x = M + i * 4.05;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 5.45, w: 3.75, h: 1.15, rectRadius: 0.09,
      fill: { color: 'FFFFFF' }, line: { color: 'E2E6ED', width: 1 },
    });
    s.addText(v, {
      x: x + 0.25, y: 5.6, w: 3.25, h: 0.6, isTextBox: true, margin: 0,
      fontFace: F.head, fontSize: 30, bold: true, color: c,
    });
    s.addText(l, {
      x: x + 0.25, y: 6.18, w: 3.25, h: 0.33, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 13, color: '5C6675',
    });
  });

  s.addText(
    'Thirty files, but only three things you can actually run — one e2e task per app. Closing that gap is the rest of the talk.',
    {
      x: M, y: 6.72, w: W - 2 * M, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 14, italic: true, color: '5C6675',
    }
  );

  notes(
    s,
    'Orientation, not content — keep it under a minute. Two things to point at. One: the libs are shared unevenly, formatting by shop and admin, ui by admin and docs, which is what makes the affected demo land later. Two: thirty spec files but only three runnable tasks, because nx e2e is one Cypress process per app. That three is the number the atomizer turns into thirty. Have `nx graph` open in a tab if you would rather show the real thing.' + DEMO.graph
  );
}

/* ── 09 how fast is feedback ─────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 01 · The baseline', C.warn);
  title(s, 'So how fast is the feedback?');

  code(
    s,
    [
      { text: '$ nx run-many -t e2e --parallel=1', color: C.text },
      { text: '', color: C.text },
      { text: '  shop-e2e    10 specs ....... 1m 33s', color: C.muted },
      { text: '  admin-e2e   10 specs ....... 1m 20s', color: C.muted },
      { text: '  docs-e2e    10 specs ....... 1m 27s', color: C.muted },
      { text: '  ─────────────────────────────────────', color: C.line },
      { text: '  Run duration:              4m 20s', color: C.warn, bold: true },
    ],
    { y: 1.95, w: 7.3, fontSize: 14 }
  );

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.4, y: 1.95, w: 4.2, h: 2.9, rectRadius: 0.09,
    fill: { color: C.panel }, line: { color: C.warn, width: 1.5 },
  });
  s.addText('4m 20s', {
    x: 8.65, y: 2.35, w: 3.7, h: 0.9, isTextBox: true, margin: 0,
    fontFace: F.head, fontSize: 48, bold: true, color: C.warn,
  });
  s.addText('for one opinion on whether your change is safe', {
    x: 8.65, y: 3.25, w: 3.7, h: 0.7, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 14, color: C.body,
  });
  s.addText('Three apps. One process each. Nothing overlaps.', {
    x: 8.65, y: 4.0, w: 3.7, h: 0.6, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 12, italic: true, color: C.muted,
  });

  s.addText(
    'And this is the small version. Fifteen apps and 1,500 tests is the project this came from — the shape is the same, the number is not.',
    {
      x: M, y: 5.35, w: W - 2 * M, h: 0.6, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 15, color: C.body,
    }
  );
  notes(
    s,
    'Run this live if the timing works, otherwise show the recording. The number to sit with is 4m20s on a toy repo with 30 specs — the audience can extrapolate to their own suite faster than you can do it for them.' + DEMO.baseline
  );
}

/* ── 10 how do we accelerate ─────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 01 · The wish list', '0B7A44');
  title(s, 'Imagine you could run only…', '10131A');

  const wishes = [
    ['…what the change touched', 'Not the whole suite. The apps the diff can actually break.'],
    ['…several specs at once', 'On the cores you already paid for.'],
    ['…the same way everywhere', 'One command, identical locally and on CI.'],
    ['…only what failed last time', 'A retry that skips the 28 specs that already passed.'],
  ];
  wishes.forEach(([h, b], i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = M + col * 6.15;
    const y = 2.2 + row * 2.15;
    s.addShape(pres.ShapeType.roundRect, {
      x, y, w: 5.75, h: 1.85, rectRadius: 0.09,
      fill: { color: 'FFFFFF' }, line: { color: 'E2E6ED', width: 1 },
    });
    s.addShape(pres.ShapeType.rect, { x, y: y + 0.22, w: 0.05, h: 1.4, fill: { color: '0B7A44' }, line: { width: 0 } });
    s.addText(h, {
      x: x + 0.35, y: y + 0.3, w: 5.1, h: 0.5, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 20, bold: true, color: '10131A',
    });
    s.addText(b, {
      x: x + 0.35, y: y + 0.85, w: 5.1, h: 0.8, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 14, color: '5C6675',
    });
  });

  s.addText('All four are configuration. None of them need a subscription.', {
    x: M, y: 6.6, w: W - 2 * M, h: 0.5, isTextBox: true, margin: 0,
    align: 'center',
    fontFace: F.body, fontSize: 17, bold: true, color: '0B7A44',
  });
  notes(
    s,
    'This is the promise slide — everything after it is delivery. Read the four out loud; they map one-to-one onto the rest of the talk, in order. The closing line is the hook: people expect this to be a paid feature.'
  );
}

/* ── 11 the atomizer ─────────────────────────────────────────────────── */
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
  notes(s, 'Stress "generated". Nobody maintains this list — that is the difference from hand-rolled spec sharding.' + DEMO.targets);
}

/* ── 12 turning it on ────────────────────────────────────────────────── */
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
  notes(s, 'Do this live. Piping through `npm run e2e:targets` gives a cleaner list if the JSON is too wide for the screen.' + DEMO.inspect);
}

/* ── 13 the catch ────────────────────────────────────────────────────── */
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
    h: 1.95,
    rectRadius: 0.07,
    fill: { color: '2A1116' },
    line: { color: C.hot, width: 1.5 },
  });
  s.addText(
    [
      { text: 'NX   The following tasks should only be run with Nx Cloud:', options: { breakLine: true, color: C.hot, bold: true } },
      { text: '       - admin-e2e:e2e-ci', options: { breakLine: true, color: 'F5B7C0' } },
      { text: '       - docs-e2e:e2e-ci', options: { breakLine: true, color: 'F5B7C0' } },
      { text: '       - shop-e2e:e2e-ci', options: { breakLine: true, color: 'F5B7C0' } },
      { text: 'Please enable Nx Cloud or use the slower "e2e" task.', options: { color: 'F5B7C0' } },
    ],
    {
      x: M + 0.3,
      y: 3.15,
      w: W - 2 * M - 0.6,
      h: 1.6,
      isTextBox: true,
      margin: 0,
      fontFace: F.mono,
      fontSize: 14,
      lineSpacingMultiple: 1.3,
    }
  );

  s.addText('So now it is a procurement question.', {
    x: M,
    y: 5.1,
    w: 11.9,
    h: 0.45,
    isTextBox: true,
    margin: 0,
    fontFace: F.head,
    fontSize: 24,
    bold: true,
    color: C.warn,
  });

  bullets(
    s,
    [
      { text: 'Nx Cloud is a premium service from Nx', color: C.body },
      { text: 'Is it approved in your organisation?', color: C.body },
      { text: 'If not approved — you are blocked', color: C.hot, bold: true },
    ],
    { y: 5.65, w: 11.9, h: 1.5, fontSize: 15 }
  );
  notes(
    s,
    'This is the slide that did not exist last time — Nx 23 added the guard. Do not rush to the workaround: sit on the third bullet. For a lot of the room this is not a technical problem at all, it is a purchase order they are not going to win this quarter. The good news lands on the next slide.' + DEMO.gate
  );
}

/* ── 14 parallel locally ─────────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Section 04 · Parallel, no cloud');
  title(s, 'Ask for the list yourself');

  code(
    s,
    [
      { text: '# the wrapper is gated — the leaves are not', color: C.muted },
      { text: 'nx show project shop-e2e --json', color: C.text },
      { text: '  → e2e-ci--src/e2e/catalog.cy.ts', color: C.cool },
      { text: '  → e2e-ci--src/e2e/search.cy.ts   …', color: C.cool },
      { text: '', color: C.text },
      { text: 'nx run-many --targets=<that list> --parallel=5', color: C.accent, bold: true },
    ],
    { y: 1.95, w: 7.3, fontSize: 13 }
  );

  s.addShape(pres.ShapeType.roundRect, {
    x: 8.4, y: 1.95, w: 4.2, h: 2.5, rectRadius: 0.09,
    fill: { color: C.panel }, line: { color: C.accent, width: 1.5 },
  });
  s.addText('4m 20s', {
    x: 8.65, y: 2.15, w: 3.7, h: 0.55, isTextBox: true, margin: 0,
    fontFace: F.head, fontSize: 24, bold: true, color: C.muted,
  });
  s.addText('↓', {
    x: 8.65, y: 2.62, w: 3.7, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 15, color: C.muted,
  });
  s.addText('2m 20s', {
    x: 8.65, y: 2.92, w: 3.7, h: 0.8, isTextBox: true, margin: 0,
    fontFace: F.head, fontSize: 42, bold: true, color: C.accent,
  });
  s.addText('same laptop, one flag', {
    x: 8.65, y: 3.75, w: 3.7, h: 0.5, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 13, color: C.body,
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 4.95, w: W - 2 * M, h: 1.5, rectRadius: 0.07,
    fill: { color: '2A1F0A' }, line: { color: C.warn, width: 1 },
  });
  s.addText('The part people skip', {
    x: M + 0.3, y: 5.12, w: W - 2 * M - 0.6, h: 0.35, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 14, bold: true, color: C.warn,
  });
  s.addText(
    'Atomize and run them serially and you get 5m 40s — 31% SLOWER than not splitting at all, because every spec now boots its own Cypress. Splitting is not a speedup. It is the precondition for one.',
    {
      x: M + 0.3, y: 5.5, w: W - 2 * M - 0.6, h: 0.85, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 14, color: 'F3D9A4',
    }
  );
  notes(
    s,
    'The script is twenty lines and does two things: ask Nx for the target list, hand it to run-many. Do not hand-roll a process pool — you lose the cache and the usual first attempt swallows exit codes. The amber box buys you credibility for the cache claims coming next, so do not rush it.' + DEMO.parallelLocal
  );
}

/* ── 15 parallel on CI ───────────────────────────────────────────────── */
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
    { x: 8.8, y: 1.95, w: 3.6, fontSize: 12, h: 2.6 }
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
    'Sharding by index is the answer people expect, so say why it is the wrong default here and keep it for the case it is good at: one app big enough to dominate. The cross-product point is real — this repo has two login.cy.ts files and the runner refuses the selection rather than quietly running both.' + DEMO.ci
  );
}

/* ── 16 the cache ────────────────────────────────────────────────────── */
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
  notes(s, 'Hit up-arrow and enter. The whole point is that it returns before you finish the sentence.' + DEMO.replay);
}

/* ── 17 rerun only failures ──────────────────────────────────────────── */
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
    'Be honest about 37→28: the two seeded failures are the two slowest specs and each still boots Cypress. The saving scales with how many specs pass — on 200 specs with 3 failures it is enormous.' +
      DEMO.rerunFailures
  );
}

/* ── 18 content addressed ────────────────────────────────────────────── */
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
  notes(s, 'If you want the "everything re-runs" version instead, run nx reset before this step. Best real example from this repo: a commit that touched only the slide deck restored the previous commit\'s cache and reported 33/36 hits and a 119ms run — the single-machine CI job went from 3m44s to 35s without anyone planning it. Inputs, not commits.' + DEMO.revert);
}

/* ── 19 the ladder ───────────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 06 · The numbers', '0B7A44');
  title(s, 'Climb only as far as you need', '10131A');

  // Bars are the machine the live demo runs on, so what the room sees matches
  // what they just watched. The M5 column is there for contrast — and because
  // rung 4 inverts on it.
  const bars = [
    { rung: '1', label: 'Un-atomized, one process per app', v: 260, m5: 196, color: 'F5A524' },
    { rung: '2', label: 'Atomized, but still serial', v: 340, m5: 240, color: 'C2410C' },
    { rung: '3', label: 'Atomized, half your cores at once', v: 140, m5: 48, color: '0B7A44' },
    { rung: '4', label: 'One runner per app, 5 at a time each', v: 55, m5: 55, color: '0B7A44' },
    { rung: '—', label: 'Re-run, nothing changed', v: 5, m5: 5, color: '15803D' },
  ];
  const maxW = 4.5;
  const barX = M + 4.35;
  const m5X = 11.05;

  const clock = (v) =>
    Math.floor(v / 60) ? `${Math.floor(v / 60)}m ${String(v % 60).padStart(2, '0')}s` : `${v}s`;

  s.addText('M1 PRO · 10 CORES · LIVE DEMO', {
    x: barX, y: 1.78, w: 5.0, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 11, bold: true, charSpacing: 1, color: '0B7A44',
  });
  s.addText('M5 · 18 CORES', {
    x: m5X, y: 1.78, w: 1.8, h: 0.3, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 11, bold: true, charSpacing: 1, color: '8A94A6',
  });
  s.addShape(pres.ShapeType.rect, {
    x: m5X - 0.3, y: 1.72, w: 0.012, h: 4.25,
    fill: { color: 'E2E6ED' }, line: { width: 0 },
  });

  bars.forEach((b, i) => {
    const y = 2.2 + i * 0.78;
    s.addText(b.rung, {
      x: M, y, w: 0.4, h: 0.4, isTextBox: true, margin: 0, valign: 'middle',
      fontFace: F.mono, fontSize: 15, bold: true, color: '8A94A6',
    });
    s.addText(b.label, {
      x: M + 0.45, y, w: 3.85, h: 0.4, isTextBox: true, margin: 0, valign: 'middle',
      fontFace: F.body, fontSize: 13, color: '10131A',
    });
    const w = Math.max(0.08, (b.v / 340) * maxW);
    s.addShape(pres.ShapeType.roundRect, {
      x: barX, y: y + 0.07, w, h: 0.32, rectRadius: 0.04,
      fill: { color: b.color }, line: { color: b.color, width: 0 },
    });
    s.addText(clock(b.v), {
      x: barX + 0.1 + w, y, w: 1.4, h: 0.4, isTextBox: true, margin: 0, valign: 'middle',
      fontFace: F.body, fontSize: 14, bold: true, color: '10131A',
    });
    s.addText(clock(b.m5), {
      x: m5X, y, w: 1.5, h: 0.4, isTextBox: true, margin: 0, valign: 'middle',
      fontFace: F.body, fontSize: 14, color: i === 2 ? '0B7A44' : '5C6675',
      bold: i === 2,
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 6.15, w: W - 2 * M, h: 1.0, rectRadius: 0.07,
    fill: { color: 'FFF7E6' }, line: { color: 'F5A524', width: 1 },
  });
  s.addText(
    [
      { text: 'Rung 2 is the honest one — ', options: { bold: true, color: '5B4308' } },
      { text: 'atomizing without parallelism is slower than not atomizing at all. On both machines.', options: { breakLine: true, color: '5B4308' } },
      { text: 'Rung 4 is not always a rung — ', options: { bold: true, color: '5B4308' } },
      { text: 'on 18 cores, nine local processes beat three runners. Distribution pays once one machine runs out of cores.', options: { color: '5B4308' } },
    ],
    {
      x: M + 0.3, y: 6.3, w: W - 2 * M - 0.6, h: 0.75, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 13, lineSpacingMultiple: 1.15,
    }
  );
  notes(
    s,
    'The bars are this laptop — the same machine they just watched the demo on — so the numbers match what they saw. The right column is an 18-core M5 for contrast. Two things to land. One: rung 2 is slower than not splitting on both machines, 31% here and 22% there, so the startup tax is real and not a quirk of old hardware. Two: on the M5 rung 3 beats rung 4, 48s against 55s. More cores beat more machines until you run out of cores — which is why CI still needs rung 4, because a CI runner is small.' + DEMO.benchmark
  );
}

/* ── 20 affected ─────────────────────────────────────────────────────── */
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
    'Run this live: npm run e2e:affected on a clean tree exits green instantly, then touch libs/ui and watch two apps light up. The last row is the one that lands — most CI runs on most days are documentation and config.' + DEMO.affected
  );
}

/* ── 21 real project ─────────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Section 06 · From a real project', '0B7A44');
  title(s, 'Fifteen apps, and what changed', '10131A');

  const tiles = [
    { v: '15', l: 'applications', s: 'every E2E suite reviewed', c: '10131A' },
    { v: '1K → 1.5K', l: 'tests', s: 'deleted a lot, added more', c: '0B7A44' },
    { v: '85%', l: 'code coverage', s: 'and stable, not "mostly"', c: '0B7A44' },
  ];
  tiles.forEach((t, i) => {
    const x = M + i * 4.05;
    s.addShape(pres.ShapeType.roundRect, {
      x, y: 2.1, w: 3.75, h: 1.85, rectRadius: 0.09,
      fill: { color: 'FFFFFF' }, line: { color: 'E2E6ED', width: 1 },
    });
    s.addText(t.v, {
      x: x + 0.25, y: 2.3, w: 3.25, h: 0.72, isTextBox: true, margin: 0,
      fontFace: F.head, fontSize: 34, bold: true, color: t.c,
    });
    s.addText(t.l, {
      x: x + 0.25, y: 3.05, w: 3.25, h: 0.35, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 15, color: '10131A',
    });
    s.addText(t.s, {
      x: x + 0.25, y: 3.4, w: 3.25, h: 0.4, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 12, italic: true, color: '8A94A6',
    });
  });

  // CI time bar comparison
  s.addText('CI build time', {
    x: M, y: 4.25, w: 5, h: 0.35, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 15, bold: true, color: '10131A',
  });
  const ciBars = [
    { label: 'Before — whole repo', v: 48, color: 'F5A524' },
    { label: 'After — whole repo', v: 25, color: '0B7A44' },
    { label: 'After — one app changed', v: 10, color: '15803D' },
  ];
  ciBars.forEach((b, i) => {
    const y = 4.7 + i * 0.62;
    s.addText(b.label, {
      x: M, y, w: 3.3, h: 0.4, isTextBox: true, margin: 0, valign: 'middle',
      fontFace: F.body, fontSize: 13, color: '10131A',
    });
    s.addShape(pres.ShapeType.roundRect, {
      x: M + 3.4, y: y + 0.08, w: (b.v / 48) * 4.2, h: 0.28, rectRadius: 0.04,
      fill: { color: b.color }, line: { width: 0 },
    });
    s.addText(`${b.v}m`, {
      x: M + 3.5 + (b.v / 48) * 4.2, y, w: 1.0, h: 0.4, isTextBox: true, margin: 0, valign: 'middle',
      fontFace: F.body, fontSize: 13, bold: true, color: '10131A',
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: 9.6, y: 4.6, w: 3.0, h: 1.85, rectRadius: 0.09,
    fill: { color: 'DCF5E7' }, line: { color: '0B7A44', width: 1 },
  });
  s.addText('Half the Actions bill', {
    x: 9.85, y: 4.85, w: 2.5, h: 0.7, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 17, bold: true, color: '14603C',
  });
  s.addText('Minutes are billed. Cache hits are not.', {
    x: 9.85, y: 5.55, w: 2.5, h: 0.75, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 13, color: '14603C',
  });

  notes(
    s,
    'The honest story: the suite was already stable-ish, about a thousand tests. We read all of them, deleted a lot that tested nothing, and added more that tested something — ending near 1,500 with 85% coverage. The 48 to 25 minutes is a full rebuild; the number people actually feel day to day is under ten minutes for a change in one app. That is the affected graph doing the work, and it shows up on the invoice.'
  );
}

/* ── 22 call to action ───────────────────────────────────────────────── */
{
  const s = darkSlide();
  kicker(s, 'Your turn');
  title(s, 'Same problem? Start here.');

  const steps = [
    ['01', 'Clone the repo', 'Everything in this talk, measured and reproducible.'],
    ['02', 'Point your agent at it', '"Apply this Nx atomizer + cache setup to my repo."'],
    ['03', 'Measure before you believe it', 'npm run e2e:benchmark, on your machine, on your suite.'],
  ];
  steps.forEach(([n, h, b], i) => {
    const y = 2.05 + i * 1.25;
    s.addText(n, {
      x: M, y, w: 0.85, h: 0.45, isTextBox: true, margin: 0,
      fontFace: F.mono, fontSize: 22, bold: true, color: C.accent,
    });
    s.addText(h, {
      x: M + 0.95, y, w: 7.4, h: 0.42, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 20, bold: true, color: C.text,
    });
    s.addText(b, {
      x: M + 0.95, y: y + 0.45, w: 7.4, h: 0.5, isTextBox: true, margin: 0,
      fontFace: F.body, fontSize: 14, color: C.muted,
    });
  });

  s.addShape(pres.ShapeType.roundRect, {
    x: M, y: 5.9, w: 8.4, h: 0.75, rectRadius: 0.07,
    fill: { color: '0A0D13' }, line: { color: C.line, width: 1 },
  });
  s.addText('github.com/radzivil/nx-scaling-e2e-tests-with-atomizer', {
    x: M + 0.3, y: 5.9, w: 7.8, h: 0.75, isTextBox: true, margin: 0, valign: 'middle',
    fontFace: F.mono, fontSize: 14, color: C.accent,
  });

  qrPanel(s, { file: 'assets/qr-repo.png', x: 9.6, y: 2.05, size: 2.9, caption: 'Clone the demo repo' });

  notes(
    s,
    'The realistic ask is not "rebuild your CI this week". It is "clone it, let your agent read it, and run the benchmark". Step three matters most — the numbers in this deck are from my laptop and my suite, and the only ones that will convince their team are their own.'
  );
}

/* ── 23 feedback & q&a ───────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Thank you', '0B7A44');
  title(s, 'Feedback & Q&A', '10131A');

  s.addText('Take a minute to give your feedback — it makes the next session better.', {
    x: M, y: 2.05, w: 7.9, h: 0.5, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 19, color: '10131A',
  });

  s.addText('What to take back', {
    x: M, y: 2.9, w: 7.9, h: 0.35, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 14, bold: true, charSpacing: 1, color: '8A94A6',
  });
  bullets(
    s,
    [
      'Splitting is generated, not maintained',
      'Splitting alone is not a speedup — concurrency is',
      'The cache is the retry story: failures are never cached',
      'Distribute by app before you distribute by index',
      'None of it needs Nx Cloud',
    ].map((t) => ({ text: t, color: '10131A' })),
    { x: M, y: 3.35, w: 7.9, fontSize: 14, h: 2.6 }
  );

  qrPanel(s, {
    file: 'assets/qr-feedback.png',
    x: 9.2, y: 2.05, size: 3.1,
    caption: 'Session feedback',
    dark: false,
  });

  s.addText('github.com/radzivil/nx-scaling-e2e-tests-with-atomizer', {
    x: M, y: 6.35, w: 7.9, h: 0.35, isTextBox: true, margin: 0,
    fontFace: F.mono, fontSize: 13, color: '5C6675',
  });
  s.addText(SPEAKER.name + ' · ' + SPEAKER.handle, {
    x: M, y: 6.72, w: 7.9, h: 0.35, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 13, color: '8A94A6',
  });

  notes(
    s,
    'One slide for the whole close. Put it up before the first question so the QR is on screen for the entire Q&A — that is when people actually scan it. The recap is there for the room to read, not for you to read out. If nobody opens, the honest prompts are the Nx Cloud gate, Playwright instead of Cypress, and what the cache does and does not do for flaky tests.'
  );
}

/* ── 24 appendix ─────────────────────────────────────────────────────── */
{
  const s = darkSlide();
  s.addText('Appendix', {
    x: M, y: 3.0, w: 11.9, h: 0.9, isTextBox: true, margin: 0,
    fontFace: F.head, fontSize: 44, bold: true, color: C.text,
  });
  s.addText('Kept back for questions.', {
    x: M, y: 3.9, w: 11.9, h: 0.5, isTextBox: true, margin: 0,
    fontFace: F.body, fontSize: 17, color: C.muted,
  });
  notes(s, 'Skip past this unless someone asks. The gotchas slide behind it is the one people photograph.');
}

/* ── 25 gotchas ──────────────────────────────────────────────────────── */
{
  const s = lightSlide();
  kicker(s, 'Before you try this at work', 'B45309');
  title(s, 'Seven things that will bite you', '10131A');

  const items = [
    ['Per-task startup tax', 'Each atomized target boots Cypress. Parallelism has to beat it.'],
    ['More parallel is not more faster', 'On a 10-core laptop --parallel=8 was no quicker than 5, and went red 2 runs in 5. Each target is a browser too.'],
    ['e2e-ci is gated on Nx 23', 'The wrapper needs Nx Cloud. The leaf targets do not.'],
    ['The cache is not in .nx/cache', 'Nx 23 puts it in ~/.nx/<hash>/cache. Every CI recipe online caches the wrong path.'],
    ['Parallel Cypress fights over :99', 'Each process spawns its own Xvfb. Start one and export DISPLAY.'],
    ['Cache the Cypress binary', 'Otherwise every CI shard re-downloads ~200 MB.'],
    ['App changes invalidate everything', 'Correct, but it limits when failure-only retries help.'],
  ];
  items.forEach(([h, b], i) => {
    const y = 1.95 + i * 0.74;
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
  notes(s, 'Good slide to leave up during questions. Items 3, 4 and 5 all bit this repo for real — worth telling as war stories rather than reading out. On item 2: five and eight came out at the same 141s mean, but eight failed two runs in five, and the spec that failed passes on its own in 13s. That is contention, not a bug — each atomized target is a Cypress process plus a browser, so the ceiling is well under your core count.');
}

pres.writeFile({ fileName: process.argv[2] || 'Scaling-E2E-Tests-with-Nx.pptx' }).then((f) => console.log('wrote', f));
