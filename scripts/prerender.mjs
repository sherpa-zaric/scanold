// Build-time prerender: emit a static index.html per route + locale.
//
// Why: ScanOld is a client-side SPA, so a crawler that does not execute JS sees a
// single empty page (identical title, no text) on every URL. This script writes real
// <title>, meta description, canonical, hreflang and a static copy shell per route so
// Google, Bing, social unfurlers and AI crawlers all read the correct page. The React
// app hydrates over the shell at runtime, so nothing changes for real users.
//
// Run: node scripts/prerender.mjs  (after `vite build`)

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const seo = JSON.parse(readFileSync(join(root, 'src/seo.json'), 'utf8'))
const shell = readFileSync(join(root, 'dist/index.html'), 'utf8')

const SITE = seo.site
const esc = (s) =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const pathOf = (loc, p) => (loc === 'zh' ? '/zh' : '') + (p === '/' ? '/' : p)

let written = 0

for (const [route, langs] of Object.entries(seo.pages)) {
  for (const loc of ['en', 'zh']) {
    const m = langs[loc]
    if (!m) continue
    const url = SITE + pathOf(loc, route)

    const links = [
      `<link rel="canonical" href="${url}" />`,
      `<link rel="alternate" hreflang="en" href="${SITE + pathOf('en', route)}" />`,
      `<link rel="alternate" hreflang="zh-CN" href="${SITE + pathOf('zh', route)}" />`,
      `<link rel="alternate" hreflang="x-default" href="${SITE + pathOf('en', route)}" />`,
    ].join('\n    ')

    const bullets = (m.points || []).map((p) => `        <li>${esc(p)}</li>`).join('\n')

    const staticShell = `<div id="root"><div class="seo-shell">
      <h1>${esc(m.h1)}</h1>
      <p>${esc(m.intro)}</p>
      <ul>
${bullets}
      </ul>
    </div></div>`

    let html = shell
      .replace(/<html lang="[^"]*"/, `<html lang="${loc === 'zh' ? 'zh-CN' : 'en'}"`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${esc(m.title)}</title>`)
      .replace(
        /(<meta name="description" content=")[^"]*(")/,
        `$1${esc(m.desc)}$2`,
      )
      // og / twitter
      .replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${esc(m.h1 + ' · ScanOld')}$2`)
      .replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${esc(m.desc)}$2`)
      .replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
      .replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${esc(m.h1 + ' · ScanOld')}$2`)
      .replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${esc(m.desc)}$2`)
      // hreflang + canonical, injected right before the closing head tag
      .replace('</head>', `    ${links}\n  </head>`)
      // static, crawlable copy inside #root (replaced by React on hydration)
      .replace(/<div id="root"><\/div>/, staticShell)

    const outFile =
      loc === 'en'
        ? join(root, 'dist', route === '/' ? '' : route, 'index.html')
        : join(root, 'dist', 'zh', route === '/' ? '' : route, 'index.html')

    mkdirSync(dirname(outFile), { recursive: true })
    writeFileSync(outFile, html)
    written++
    console.log('  ✓', url)
  }
}

// minimal styling so the prerendered shell is not a flash of unstyled text
const css = `
.seo-shell { max-width: 820px; margin: 0 auto; padding: 56px 24px 40px; font-family: Georgia, 'Songti SC', serif; color: #2b2318; }
.seo-shell h1 { font-size: 40px; line-height: 1.2; margin: 0 0 18px; }
.seo-shell p { font-size: 17px; line-height: 1.8; margin: 0 0 18px; color: #4a4034; }
.seo-shell ul { margin: 0; padding-left: 22px; }
.seo-shell li { font-size: 15.5px; line-height: 1.75; margin-bottom: 10px; color: #4a4034; }
`
writeFileSync(join(root, 'dist/prerender.css'), css)

// link the shell stylesheet on every emitted page
const walk = (dir) =>
  readdirSync(dir).forEach((n) => {
    const p = join(dir, n)
    if (statSync(p).isDirectory()) return walk(p)
    if (n.endsWith('.html')) {
      const s = readFileSync(p, 'utf8')
      if (!s.includes('prerender.css')) {
        writeFileSync(p, s.replace('</head>', '    <link rel="stylesheet" href="/prerender.css" />\n  </head>'))
      }
    }
  })
walk(join(root, 'dist'))

console.log(`\nPrerendered ${written} pages + prerender.css`)
