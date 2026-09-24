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

function Seal({ size = 38 }: { size?: number }) {
  return (
    <span className="seal" style={{ width: size, height: size, fontSize: size * 0.36 }}>
      造旧
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
          <Seal />
          <span className="brand-word">MakeOld</span>
          <span className="brand-sub">{loc === 'zh' ? '复古纸质文档工坊' : 'Vintage paper document studio'}</span>
        </Link>
        <nav className="nav-links">
          {links.map((l) => (
            <NavLink key={l.to} to={pathOf(loc, l.to)} className={({ isActive }) => (isActive ? 'on' : '')}>
              {t(l.k)}
            </NavLink>
          ))}
          <a className="nav-pill" href="https://github.com/" target="_blank" rel="noreferrer">{t('nav.github')}</a>
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
            <Seal size={34} />
            <span className="brand-word">MakeOld</span>
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
          <a href="https://github.com/" target="_blank" rel="noreferrer">GitHub</a>
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
    en: ['MakeOld — Make any PDF look scanned. Free, in your browser.', 'Age any PDF or image into a believable scanned copy, or conjure an old newspaper clipping from plain text. Free, no signup, files never leave your browser.'],
    zh: ['造旧 MakeOld — 把任何 PDF 做成扫描件，免费在线', '把 PDF 或图片做旧成逼真的扫描件，或用文字生成复古旧报纸剪报。免费、免注册，文件全程不离开浏览器。'],
  },
  '/scan': {
    en: ['Scan Lab — Make any PDF look scanned | MakeOld', 'Drop in a PDF or image, pick a scan style, fine-tune aging, tilt, noise and stains, and export a realistic scanned PDF. Searchable text layer included. 100% local.'],
    zh: ['扫描质感工坊 — 把 PDF 做成扫描件 | 造旧', '拖入 PDF 或图片，选扫描风格，微调做旧、歪斜、噪点与污渍，导出逼真的扫描 PDF，支持可搜索文字层。全程本地处理。'],
  },
  '/relic': {
    en: ['Relic Maker — Vintage newspaper generator | MakeOld', 'Type plain text and instantly print an aged vintage newspaper clipping — columns, masthead, seal and all. Export as PNG or PDF.'],
    zh: ['复古生成器 — 旧报纸生成器 | 造旧', '输入文字，实时排出一版做旧的复古报纸剪报——分栏、报头、印章一应俱全。可导出 PNG 或 PDF。'],
  },
  '/templates': {
    en: ['Scan style presets — Old newspaper, photocopy, fax and more | MakeOld', 'Eight hand-tuned aging presets: Old Newspaper, Old Archive, Kraft Paper, Photocopies, Fax, Mimeographed Exam, Red-Header Document and Snapshot.'],
    zh: ['风格模板 — 旧报纸、复印件、传真等 8 种做旧风格 | 造旧', '八种精调做旧风格：旧报纸、旧档案、牛皮纸、复印件、传真件、油印考卷、红头文件、随手拍。'],
  },
  '/about': {
    en: ['About MakeOld — vintage paper document studio', 'MakeOld turns fresh pixels into paper with a past. Free, private (100% local processing), and built for creative, design and entertainment use.'],
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
