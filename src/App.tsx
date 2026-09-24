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

function Layout() {
  const { pathname } = useLocation()
  const loc = locOf(pathname)
  const bare = strip(pathname)

  useEffect(() => {
    const origin = window.location.origin
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
    set('alternate', origin + (bare === '/' ? '/' : bare), 'en')
    set('alternate', origin + '/zh' + (bare === '/' ? '/' : bare), 'zh-CN')
    set('alternate', origin + (bare === '/' ? '/' : bare), 'x-default')
    set('canonical', origin + pathOf(loc, bare === '/' ? '/' : bare))
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
