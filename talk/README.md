# Slides

`deck.js` generates `Scaling-E2E-Tests-with-Nx.pptx` with
[pptxgenjs](https://gitbrent.github.io/PptxGenJS/). The `.pptx` is committed, so
you only need this if you want to change a slide.

```bash
npm install --no-save pptxgenjs
node deck.js
```

Speaker notes are attached to every slide — open the notes pane in PowerPoint or
Keynote.

Every number on the slides was measured on this repo. If you change the app or
the specs, re-measure before presenting:

```bash
npx nx reset
time npx nx e2e shop-e2e                          # the un-atomized baseline
npx nx reset
time node tools/shard-e2e.mjs --parallel=1        # atomized, serial
npx nx reset
time node tools/shard-e2e.mjs --parallel=5        # atomized, parallel
time node tools/shard-e2e.mjs --parallel=5        # cache replay
```
