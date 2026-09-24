// Scan engine — built on open source wheels:
//  - pdfjs-dist (Mozilla PDF.js, Apache-2.0): renders PDF pages to canvas
//  - pdf-lib (MIT): assembles the output scanned PDF
// Aging pipeline approach inspired by lookscanned.io community edition (MIT):
//  render -> per-page randomized fx -> grain/stain/tint overlays -> raster PDF.
// The fx layer itself is plain Canvas filters (a "simple wheel" — no need for
// ImageMagick-WASM); fxCss() is the single source of truth for preview AND export.
import * as pdfjsLib from 'pdfjs-dist'
import { PDFDocument, StandardFonts } from 'pdf-lib'

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url,
).toString()

const RENDER_SCALE = 2
const JPEG_QUALITY = 0.92

export type Fx = { age: number; tilt: number; grain: number; yellow: number; blur: number }

/** One run of original text, positioned in page units (top-left origin). */
export type TextPiece = { str: string; x: number; y: number; w: number; h: number }

export const jitter = (v: number, amt: number) =>
  Math.max(0, Math.min(100, v + (Math.random() * 2 - 1) * amt))

export const tiltDeg = (tilt: number) => (tilt / 100) * 4 - 2

/** CSS filter for the aging effect. strength 0-100 blends toward the original. */
export function fxCss(fx: Fx, strength = 100): string {
  const k = strength / 100
  return (
    `sepia(${((fx.age / 100) * 0.85 * k).toFixed(3)}) ` +
    `saturate(${(1 - (fx.age / 300) * k).toFixed(3)}) ` +
    `contrast(${(1 + (fx.age / 100) * 0.25 * k).toFixed(3)}) ` +
    `brightness(${(1 - (fx.yellow / 900) * k).toFixed(4)}) ` +
    `blur(${((fx.blur / 70) * k).toFixed(3)}px)`
  )
}

/** Load a PDF (all pages) or an image into render canvases. Never touches a network. */
export async function loadDoc(file: File): Promise<{ pages: HTMLCanvasElement[]; texts: TextPiece[][] }> {
  const isPdf = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')
  if (!isPdf) {
    const bmp = await createImageBitmap(file)
    const c = document.createElement('canvas')
    c.width = bmp.width
    c.height = bmp.height
    c.getContext('2d')!.drawImage(bmp, 0, 0)
    return { pages: [c], texts: [[]] }
  }
  const pdf = await pdfjsLib.getDocument({ data: await file.arrayBuffer() }).promise
  const pages: HTMLCanvasElement[] = []
  const texts: TextPiece[][] = []
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i)
    const vp = page.getViewport({ scale: RENDER_SCALE })
    const c = document.createElement('canvas')
    c.width = vp.width
    c.height = vp.height
    await page.render({ canvasContext: c.getContext('2d')!, viewport: vp }).promise
    pages.push(c)
    // keep the original text layer so the export stays searchable
    const tc = await page.getTextContent()
    texts.push(
      tc.items
        .filter((it): it is { str: string; transform: number[]; width: number; height: number } =>
          'str' in it && !!it.str.trim())
        .map((it) => ({ str: it.str, x: it.transform[4], y: it.transform[5], w: it.width, h: it.height })),
    )
  }
  return { pages, texts }
}

let noiseTile: HTMLCanvasElement | null = null
function getNoiseTile(): HTMLCanvasElement {
  if (noiseTile) return noiseTile
  const n = document.createElement('canvas')
  n.width = n.height = 128
  const ctx = n.getContext('2d')!
  const img = ctx.createImageData(128, 128)
  for (let i = 0; i < img.data.length; i += 4) {
    const v = 90 + Math.random() * 140
    img.data[i] = img.data[i + 1] = img.data[i + 2] = v
    img.data[i + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  noiseTile = n
  return n
}

/** Apply one aging recipe to a rendered page. strength 0-100 blends toward the original. */
export function applyFx(src: HTMLCanvasElement, fx: Fx, gray = false, strength = 100): HTMLCanvasElement {
  const k = strength / 100
  const pad = Math.round(Math.max(src.width, src.height) * 0.02)
  const out = document.createElement('canvas')
  out.width = src.width + pad * 2
  out.height = src.height + pad * 2
  const ctx = out.getContext('2d')!

  ctx.fillStyle = '#efe7d2'
  ctx.fillRect(0, 0, out.width, out.height)

  ctx.save()
  ctx.translate(out.width / 2, out.height / 2)
  ctx.rotate((tiltDeg(fx.tilt) * k * Math.PI) / 180)
  ctx.filter = fxCss(fx, strength)
  ctx.drawImage(src, -src.width / 2, -src.height / 2)
  ctx.restore()

  if (k > 0) {
    ctx.globalCompositeOperation = 'multiply'
    ctx.fillStyle = `rgba(214, 182, 120, ${((fx.yellow / 240) * k).toFixed(3)})`
    ctx.fillRect(0, 0, out.width, out.height)

    const g = ctx.createRadialGradient(out.width * 0.82, out.height * 0.12, 10, out.width * 0.82, out.height * 0.12, out.width * 0.55)
    g.addColorStop(0, `rgba(150,110,50,${((fx.age / 320) * k).toFixed(3)})`)
    g.addColorStop(1, 'rgba(150,110,50,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, out.width, out.height)

    ctx.globalAlpha = (fx.grain / 230) * k
    const pat = ctx.createPattern(getNoiseTile(), 'repeat')
    if (pat) {
      ctx.fillStyle = pat
      ctx.fillRect(0, 0, out.width, out.height)
    }
    ctx.globalAlpha = 1
    ctx.globalCompositeOperation = 'source-over'
  }

  if (gray) {
    const gcv = document.createElement('canvas')
    gcv.width = out.width
    gcv.height = out.height
    const gctx = gcv.getContext('2d')!
    gctx.filter = 'grayscale(1)'
    gctx.drawImage(out, 0, 0)
    return gcv
  }
  return out
}

/** Age every page (with per-page randomization) and export as a raster PDF.
 *  When `texts` is provided (from a PDF input), the original text is re-drawn
 *  invisibly on top so the exported file stays searchable/selectable. */
export async function exportScan(
  pages: HTMLCanvasElement[],
  fx: Fx,
  random: boolean,
  gray: boolean,
  baseName: string,
  strength = 100,
  texts?: TextPiece[][],
): Promise<boolean> {
  const pdf = await PDFDocument.create()
  const font = await pdf.embedFont(StandardFonts.Helvetica)
  let pieces = 0
  for (let idx = 0; idx < pages.length; idx++) {
    const p = pages[idx]
    const f: Fx = random
      ? {
          age: jitter(fx.age, 8),
          tilt: jitter(fx.tilt, 12),
          grain: jitter(fx.grain, 10),
          yellow: jitter(fx.yellow, 8),
          blur: jitter(fx.blur, 6),
        }
      : fx
    const cv = applyFx(p, f, gray, strength)
    const img = await pdf.embedJpg(cv.toDataURL('image/jpeg', JPEG_QUALITY))
    const pw = cv.width / RENDER_SCALE
    const ph = cv.height / RENDER_SCALE
    const page = pdf.addPage([pw, ph])
    page.drawImage(img, { x: 0, y: 0, width: pw, height: ph })

    const t = texts?.[idx]
    if (t) {
      for (const piece of t) {
        try {
          // invisible overlay: keeps Ctrl+F / copy working without changing pixels
          page.drawText(piece.str, {
            x: piece.x,
            y: ph - piece.y - piece.h,
            size: Math.max(piece.h, 1),
            font,
            opacity: 0,
          })
          pieces += piece.str.trim().length
        } catch {
          // glyphs the standard font can't encode (e.g. CJK) are skipped
        }
      }
    }
  }
  const bytes = await pdf.save()
  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/pdf' }))
  const a = document.createElement('a')
  a.href = url
  a.download = baseName.replace(/\.[^.]+$/, '') + '-scan.pdf'
  a.click()
  URL.revokeObjectURL(url)
  return pieces > 0
}
