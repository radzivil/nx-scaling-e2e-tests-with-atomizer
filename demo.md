# Demo run sheet

Every command the talk runs, in slide order, so you can copy rather than retype.
Keep this open on a second screen next to a terminal in the repo root.

Slide numbers match `talk/Scaling-E2E-Tests-with-Nx.pptx`. Timings are from a
10-core M1 Pro — re-measure with `npm run e2e:benchmark` before you present.

---

## Before you start

```bash
cd ~/IdeaProjects/nx-scaling-e2e-tests-with-atomizer
```

```bash
npm ci && npx cypress install
```

Confirm the seeded bug is **off** — expect `buggyDiscount: false`:

```bash
npm run demo:status
```

Cold cache, so the first number is honest:

```bash
npx nx reset
```

---

## Slide 8 — The example repo

Opens a browser. Click `shop`, then `ui`, to show what depends on what. `Ctrl+C`
when done.

```bash
npx nx graph
```

If the projector hates the browser, there is a terminal-only version:

```bash
npx nx graph --print
```

---

## Slide 9 — The baseline

**~1m 33s for one app.** Start it, keep talking, come back to it.

```bash
npx nx e2e shop-e2e
```

> All three apps serially is 4m 20s. Quote that number, do not run it.

---

## Slide 11 — The atomizer

30 targets across 3 projects. Point out the names are file paths, not
`spec1`/`spec2`.

```bash
npm run e2e:targets
```

---

## Slide 12 — Turning it on

```bash
npx nx show project shop-e2e --json
```

Wide output — use `npm run e2e:targets` instead if the JSON does not fit the
screen. Then show the nine lines of config that generate all thirty targets:

```bash
grep -A8 "cypress/plugin" nx.json
```

---

## Slide 13 — The catch

Fails, listing all three `e2e-ci` tasks. Read the error out loud.

```bash
npx nx run-many -t e2e-ci --parallel=5
```

Same plugin, one leaf target, green. **~25s from cold** because it builds the
app and starts preview first; a couple of seconds once those are cached.

```bash
npx nx run "shop-e2e:e2e-ci--src/e2e/catalog.cy.ts"
```

---

## Slide 14 — Parallel locally

```bash
npx nx reset
```

**~40–46s**, against the 1m 33s baseline from slide 9.

```bash
node tools/run-e2e.mjs --project=shop-e2e --parallel=5
```

The whole workspace, if you have time (**~2m 06s**):

```bash
node tools/run-e2e.mjs --parallel=5
```

> Omit `--parallel` entirely and it defaults to half your cores, printing
> `(half of 10 cores)` so the room can see what it picked.

---

## Slide 15 — Parallel on CI

```bash
gh run list --limit 5
```

```bash
gh run view --web
```

One job per app, and the matrix is generated from the graph:

```bash
sed -n "1,40p" .github/workflows/e2e.yml
```

---

## Slide 17 — The cache

Up-arrow, enter. Back in **~0.2s** with 11/12 cache hits.

```bash
node tools/run-e2e.mjs --project=shop-e2e --parallel=5
```

---

## Slide 18 — Rerun only the failures

The money moment.

```bash
npm run demo:break
```

**~40s, 2 specs fail:**

```bash
node tools/run-e2e.mjs --project=shop-e2e --parallel=5
```

**~28s, 9/10 cached** — nothing changed between these two runs, only the
failures re-executed:

```bash
node tools/run-e2e.mjs --project=shop-e2e --parallel=5
```

---

## Slide 19 — Content-addressed

```bash
npm run demo:fix
```

**~0.2s.** Reverting restored the old input hash, so the old results came back.

```bash
node tools/run-e2e.mjs --project=shop-e2e --parallel=5
```

---

## Slide 20 — The ladder

**Do not run this live — it takes ~15 minutes**, because it runs every rung from
a cold cache. Run it the morning of the talk and read the numbers off the slide.

```bash
npm run e2e:benchmark
```

---

## Slide 21 — Affected

Clean tree: exits green instantly.

```bash
npm run e2e:affected
```

Now touch a shared lib:

```bash
echo "/* demo */" >> libs/ui/src/styles.css
```

Discovery is instant — expect `["admin-e2e","docs-e2e"]`:

```bash
node tools/e2e-targets.mjs --affected --projects-json
```

Put it back:

```bash
git checkout -- libs/ui/src/styles.css
```

> Only run the full affected suite (~1m 22s) if you have time.

---

## If something goes wrong

Cache behaving oddly, or you want a guaranteed cold run:

```bash
npx nx reset
```

Left the seeded bug in by accident:

```bash
npm run demo:fix
```

Check which state the demo flag is in:

```bash
npm run demo:status
```

Verify the repo is green before you walk on stage (~2m 20s):

```bash
node tools/run-e2e.mjs
```
