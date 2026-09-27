import { useEffect } from 'react'
import { Routes, Route, Outlet, Link, NavLink, useLocation } from 'react-router-dom'
import { I18nProvider, useI18n, pathOf, Loc } from './i18n'
import Home from './pages/Home'
import ScanLab from './pages/ScanLab'
import RelicMaker from './pages/RelicMaker'
import Templates from './pages/Templates'
import About from './pages/About'

const locOf = (p: string): Loc => (p === '/zh' || p.startsWith('/zh/') ? 'zh' : 'en')
const strip = (p: string) => (p.replace(/^\/zh/, '') || '/')

const REPO = 'https://github.com/sherpa-zaric/scanold'

// Official GitHub mark (Octicons "mark-github", 16px grid)
function GitHubMark({ size = 16 }: { size?: number }) {
  return (
    <svg viewBox="0 0 16 16" width={size} height={size} fill="currentColor" aria-hidden="true" style={{ display: 'block' }}>
      <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
    </svg>
  )
}

// Brand wordmark: "Scan" + worn red seal ring as the O + "ld" (concept A)
function Wordmark({ size = 27 }: { size?: number }) {
  const o = Math.round(size * 1.05)
  return (
    <span className="wordmark" style={{ fontSize: size, lineHeight: 1 }}>
      Scan
      <svg viewBox="0 0 44 44" width={o} height={o} style={{ margin: '0 1.5px' }} aria-hidden="true">
        <g transform="rotate(-6 22 22)">
          <circle cx="22" cy="22" r="15" fill="none" stroke="var(--seal)" strokeWidth="7.5" />
          <circle cx="11.5" cy="11" r="2.6" fill="var(--paper)" />
          <circle cx="34" cy="33.5" r="2.3" fill="var(--paper)" />
          <circle cx="21.5" cy="38" r="1.9" fill="var(--paper)" />
        </g>
      </svg>
      ld
    </span>
  )
}

function Nav() {
  const { loc, t } = useI18n()
  const links = [
    { to: '/scan', k: 'nav.scan' },
    { to: '/relic', k: 'nav.relic' },
    { to: '/templates', k: 'nav.templates' },
    { to: '/about', k: 'nav.about' },
  ]
  const other: Loc = loc === 'zh' ? 'en' : 'zh'
  return (
    <header className="nav">
      <div className="nav-inner">
        <Link to={pathOf(loc, '/')} className="brand">
          <Wordmark />
          <span className="brand-sub">{loc === 'zh' ? '复古纸质文档工坊' : 'Vintage paper document studio'}</span>
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={pathOf(loc, l.to)} className={({ isActive }) => (isActive ? 'on' : '')}>
              {t(l.k)}
            </NavLink>
          ))}
          <a className="nav-pill gh-pill" href={REPO} target="_blank" rel="noreferrer">
            <GitHubMark size={15} />
            <span>{t('nav.github')}</span>
          </a>
          <Link className="nav-pill nav-pill--lang" to={pathOf(other, strip(window.location.pathname))}>
            {other === 'zh' ? '中文' : 'EN'}
          </Link>
        </nav>
      </div>
    </header>
  )
}

function Foot() {
  const { loc, t } = useI18n()
  return (
    <footer className="foot2">
      <div className="foot2-inner">
        <div className="foot2-brand">
          <div className="brand">
            <Wordmark size={22} />
          </div>
          <p>{t('foot.tagline')}</p>
        </div>
        <div className="foot2-col">
          <h4>{t('foot.product')}</h4>
          <Link to={pathOf(loc, '/scan')}>{t('nav.scan')}</Link>
          <Link to={pathOf(loc, '/relic')}>{t('nav.relic')}</Link>
          <Link to={pathOf(loc, '/templates')}>{t('nav.templates')}</Link>
        </div>
        <div className="foot2-col">
          <h4>{t('foot.explore')}</h4>
          <Link to={pathOf(loc, '/about')}>{t('nav.about')}</Link>
          <a href={REPO} target="_blank" rel="noreferrer" className="gh-link">
            <GitHubMark size={15} />
            <span>GitHub</span>
          </a>
        </div>
      </div>
      <div className="foot2-base">
        <span>{loc === 'zh'
          ? '仅供创作、设计与娱乐使用，请勿用于伪造材料提交。'
          : 'For creative, design and entertainment use only. Never use it to forge documents for submission.'}</span>
        <span>{t('foot.rights')} · © 2026</span>
      </div>
    </footer>
  )
}

const SITE = 'https://scanold.com'

// per-page meta: title & description per language (SEO)
const PAGE_META: Record<string, { en: [string, string]; zh: [string, string] }> = {
  '/': {
    en: ['ScanOld — Make any PDF look scanned. Free, in your browser.', 'Age any PDF or image into a believable scanned copy, or conjure an old newspaper clipping from plain text. Free, no signup, files never leave your browser.'],
    zh: ['造旧 ScanOld — 把任何 PDF 做成扫描件，免费在线', '把 PDF 或图片做旧成逼真的扫描件，或用文字生成复古旧报纸剪报。免费、免注册，文件全程不离开浏览器。'],
  },
  '/scan': {
    en: ['Scan Lab — Make any PDF look scanned | ScanOld', 'Drop in a PDF or image, pick a scan style, fine-tune aging, tilt, noise and stains, and export a realistic scanned PDF. Searchable text layer included. 100% local.'],
    zh: ['扫描质感工坊 — 把 PDF 做成扫描件 | 造旧', '拖入 PDF 或图片，选扫描风格，微调做旧、歪斜、噪点与污渍，导出逼真的扫描 PDF，支持可搜索文字层。全程本地处理。'],
  },
  '/relic': {
    en: ['Relic Maker — Vintage newspaper generator | ScanOld', 'Type plain text and instantly print an aged vintage newspaper clipping — columns, masthead, seal and all. Export as PNG or PDF.'],
    zh: ['复古生成器 — 旧报纸生成器 | 造旧', '输入文字，实时排出一版做旧的复古报纸剪报——分栏、报头、印章一应俱全。可导出 PNG 或 PDF。'],
  },
  '/templates': {
    en: ['Scan style presets — Old newspaper, photocopy, fax and more | ScanOld', 'Eight hand-tuned aging presets: Old Newspaper, Old Archive, Kraft Paper, Photocopies, Fax, Mimeographed Exam, Red-Header Document and Snapshot.'],
    zh: ['风格模板 — 旧报纸、复印件、传真等 8 种做旧风格 | 造旧', '八种精调做旧风格：旧报纸、旧档案、牛皮纸、复印件、传真件、油印考卷、红头文件、随手拍。'],
  },
  '/about': {
    en: ['About ScanOld — vintage paper document studio', 'ScanOld turns fresh pixels into paper with a past. Free, private (100% local processing), and built for creative, design and entertainment use.'],
    zh: ['关于造旧 — 复古纸质文档工坊', '造旧把崭新的像素做成有年头的纸。免费、隐私（100% 本地处理），仅供创作、设计与娱乐使用。'],
  },
}

function Layout() {
  const { pathname } = useLocation()
  const loc = locOf(pathname)
  const bare = strip(pathname)

  useEffect(() => {
    const set = (rel: string, href: string, hreflang?: string) => {
      let el = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]${hreflang ? `[hreflang="${hreflang}"]` : ''}`)
      if (!el) {
        el = document.createElement('link')
        el.rel = rel
        if (hreflang) el.hreflang = hreflang
        document.head.appendChild(el)
      }
      el.href = href
    }
    // hreflang/canonical always point at the production domain, never localhost
    set('alternate', SITE + (bare === '/' ? '/' : bare), 'en')
    set('alternate', SITE + '/zh' + (bare === '/' ? '/' : bare), 'zh-CN')
    set('alternate', SITE + (bare === '/' ? '/' : bare), 'x-default')
    set('canonical', SITE + pathOf(loc, bare === '/' ? '/' : bare))

    // per-page title + description
    const meta = PAGE_META[bare] || PAGE_META['/']
    const [title, desc] = loc === 'zh' ? meta.zh : meta.en
    document.title = title
    let el = document.head.querySelector<HTMLMetaElement>('meta[name="description"]')
    if (!el) {
      el = document.createElement('meta')
      el.name = 'description'
      document.head.appendChild(el)
    }
    el.content = desc
    let og = document.head.querySelector<HTMLMetaElement>('meta[property="og:url"]')
    if (og) og.content = SITE + pathOf(loc, bare === '/' ? '/' : bare)
  }, [pathname, bare, loc])

  return (
    <I18nProvider loc={loc}>
      <div className="site">
        <Nav />
        <main>
          <Outlet />
        </main>
        <Foot />
      </div>
    </I18nProvider>
  )
}

export default function App() {
  const children = (
    <>
      <Route index element={<Home />} />
      <Route path="scan" element={<ScanLab />} />
      <Route path="relic" element={<RelicMaker />} />
      <Route path="templates" element={<Templates />} />
      <Route path="about" element={<About />} />
    </>
  )
  return (
    <Routes>
      <Route path="/" element={<Layout />}>{children}</Route>
      <Route path="/zh" element={<Layout />}>{children}</Route>
    </Routes>
  )
}
