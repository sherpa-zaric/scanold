# ScanOld — Vintage Paper Document Studio

**Live at [scanold.com](https://scanold.com)** · **Turn fresh pixels into paper with a past.** ScanOld is a 100% client-side web tool that:

- **Scan Lab** — ages PDFs and images into believable "old scans": 8 one-click style packs (old newspaper, aged archive, kraft paper, 3rd-gen copy, fax roll, mimeograph, red-header doc, phone snap), per-page randomized aging (angle / stains / grain differ on every page), live before/after compare, zoomable inspection.
- **Relic Maker** — conjures retro documents out of plain text: an old newspaper clipping (auto multi-column layout, masthead, seal) you can export as PNG or PDF.

Everything runs **locally in your browser** — files are never uploaded to any server. There is no backend.

## Deployment note

The app is a client-side SPA, so unknown paths (`/scan`, `/zh/relic`, …) must fall back to `index.html`. On Cloudflare Workers this is handled by `not_found_handling: single-page-application` in `wrangler.jsonc` — **do not add a `public/_redirects` file**: Workers parses it as routing config and rejects the deploy with `Invalid _redirects configuration … Infinite loop detected [code: 100324]`. If you switch to Cloudflare Pages instead, add a `_redirects` file containing `/* /index.html 200` and drop `not_found_handling` from `wrangler.jsonc`.

## Privacy by architecture

- PDF rendering happens with PDF.js inside your browser tab.
- Exports are assembled with pdf-lib in memory and downloaded directly.
- No accounts, no tracking scripts, no uploads. Close the tab and your document is gone.

## Searchable text layer

When the input is a text-based PDF, ScanOld extracts the original text runs and re-draws
them invisibly over the aged pages, so the exported "scan" stays **searchable and
copy-pasteable** — something most scanned-look tools don't bother with.
(Scanned/image-only inputs have no text to carry over, and the UI says so honestly.)

## Tech stack

| Piece | Wheel used | License |
|---|---|---|
| PDF rendering | [pdfjs-dist](https://github.com/mozilla/pdf.js) | Apache-2.0 |
| PDF assembly | [pdf-lib](https://github.com/Hopding/pdf-lib) | MIT |
| Snapshot export | [html2canvas](https://github.com/niklasvh/html2canvas) | MIT |
| UI | React + TypeScript + Vite | — |

The aging pipeline (render → per-page randomized FX → grain/stain overlays → raster PDF) was
**inspired by [Look Scanned](https://github.com/lookscanned/lookscanned.io)** (MIT) — a great
project and well worth a look. ScanOld is an independent implementation, not a fork: no code
was copied; the FX layer is original Canvas code chosen deliberately over an ImageMagick-WASM
dependency.

## Development

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # static bundle in dist/ — deploy anywhere
```

The build is a fully static site: host `dist/` on Cloudflare Pages / Vercel / GitHub Pages / nginx, no server needed.

## License

[MIT](./LICENSE)
