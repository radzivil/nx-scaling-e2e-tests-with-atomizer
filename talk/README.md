# Slides

`deck.js` generates `Scaling-E2E-Tests-with-Nx.pptx` with
[pptxgenjs](https://gitbrent.github.io/PptxGenJS/). The `.pptx` is committed, so
you only need this if you want to change a slide.

```bash
node talk/deck.js talk/Scaling-E2E-Tests-with-Nx.pptx
```

`pptxgenjs` and `qrcode` are devDependencies of the repo, so `npm ci` is enough.
Speaker notes are attached to every slide — open the notes pane in PowerPoint or
Keynote.

## Before you present

Two placeholders are deliberately loud on slide 1 and will embarrass you on a
projector if you skip this:

1. **Your photo.** Save it as `talk/assets/avatar.png` (or `.jpg`). It is
   cropped to a circle, so a square headshot works best — anything from about
   400x400 up is plenty. Without it slide 1 shows a dashed "PHOTO" circle.
2. **Your title and LinkedIn handle.** Edit `SPEAKER` at the top of `deck.js`.
3. **The LinkedIn QR.** Put your profile URL in `qr-links.json`, then:

   ```bash
   node talk/make-qr.mjs
   ```

   That writes `talk/assets/qr-<name>.png` for every entry with a URL. Entries
   left empty render a pink dashed "not generated" box rather than a QR that
   silently points nowhere.

## Re-measure before you quote

Every number on the slides was measured on this repo, on an M-series laptop.
E2E timings are noisy and machine-specific — take your own:

```bash
npm run e2e:benchmark
```

That prints the four rungs plus the cache replay. The slides currently say
4m 20s / 5m 40s / 2m 20s / 55s / 5s; if yours differ, edit the `bars` array on
the ladder slide and the stat panels on slides 7 and 12.

The CI figures on slides 13 and 19 come from GitHub Actions runs on this repo
and from the real project the talk is based on — those you cannot reproduce
locally, so leave them or replace them with your own.

## Rendering to images

Useful for checking layout without opening PowerPoint:

```bash
soffice --headless --convert-to pdf talk/Scaling-E2E-Tests-with-Nx.pptx
pdftoppm -jpeg -r 110 Scaling-E2E-Tests-with-Nx.pdf slide
```

LibreOffice substitutes fonts, so spacing shifts slightly against PowerPoint.
Trust it for overflow and collisions, not for kerning.
