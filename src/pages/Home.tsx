import { useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useI18n, pathOf } from '../i18n'
import { PACKS, TplThumb, PackId } from '../components'
import { pending } from '../pending'

export default function Home() {
  const { loc, t } = useI18n()
  const nav = useNavigate()
  const fileRef = useRef<HTMLInputElement>(null)
  const [over, setOver] = useState(false)

  function goScan(f?: File | null, pack?: PackId) {
    if (f) pending.file = f
    if (pack) pending.pack = pack
    nav(pathOf(loc, '/scan'))
  }

  const feats = [
    { g: '◳', k: 'home.feat1' },
    { g: '❖', k: 'home.feat2' },
    { g: '⌕', k: 'home.feat3' },
    { g: '▤', k: 'home.feat4' },
  ]

  return (
    <div>
      <section className="hero">
        <div className="hero-badge">{t('home.badge')}</div>
        <h1>
          {t('home.h1a')}
          <br />
          <em>{t('home.h1b')}</em>
        </h1>
        <p className="hero-sub">{t('home.sub')}</p>

        <div
          className={`hero-tool ${over ? 'over' : ''}`}
          onClick={() => fileRef.current?.click()}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); goScan(e.dataTransfer.files?.[0]) }}
        >
          <div className="ht-icon">⇩</div>
          <div className="ht-title">{t('home.dropTitle')}</div>
          <div className="ht-or">{t('home.dropOr')}</div>
          <div className="ht-formats">{t('home.dropFormats')}</div>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/pdf,image/*"
          style={{ display: 'none' }}
          onChange={(e) => goScan(e.target.files?.[0])}
        />

        <div className="hero-quick">
          <span className="hq-lab">{t('home.quickStyle')}</span>
          {PACKS.map((id) => (
            <button key={id} className="chip" onClick={() => goScan(null, id)}>
              {t('tpl.' + id)}
            </button>
          ))}
        </div>

        <div className="hero-note">
          <Link to={pathOf(loc, '/relic')}>{t('home.relicLink')}</Link>
        </div>
      </section>

      <section className="showcase">
        <div className="sec-tag">{t('home.showcaseTag')}</div>
        <h2>{t('home.showcaseHead')}</h2>
        <p className="sec-sub2">{t('home.showcaseSub')}</p>
        <div className="showcase-stage">
          <div className="sc-panel">
            <div className="sc-tag">{t('home.cleanTag')}</div>
            <div className="sc-doc"><i /><i /><i /><i /><i /><i /></div>
          </div>
          <div className="sc-arrow">→</div>
          <div className="sc-panel">
            <div className="sc-tag sc-tag--seal">{t('home.agedTag')}</div>
            <div className="sc-doc sc-doc--aged"><i /><i /><i /><i /><i /><i /></div>
          </div>
        </div>
      </section>

      <section className="mods">
        <div className="mods-grid">
          <Link to={pathOf(loc, '/scan')} className="mod-card">
            <div className="mod-body">
              <div className="mod-tag">{t('home.mod1tag')}</div>
              <div className="mod-title">{t('home.mod1title')}</div>
              <div className="mod-desc">{t('home.mod1desc')}</div>
              <span className="mod-cta">{t('home.mod1cta')}</span>
            </div>
            <div className="mod-vis"><TplThumb id="copy" /></div>
          </Link>
          <Link to={pathOf(loc, '/relic')} className="mod-card mod-card--new">
            <div className="mod-body">
              <div className="mod-tag">{t('home.mod2tag')}</div>
              <div className="mod-title">{t('home.mod2title')}</div>
              <div className="mod-desc">{t('home.mod2desc')}</div>
              <span className="mod-cta">{t('home.mod2cta')}</span>
            </div>
            <div className="mod-vis">
              <span className="mod-badge">NEW</span>
              <TplThumb id="news" />
            </div>
          </Link>
        </div>
      </section>

      <section className="tpl-strip">
        <div className="sec-head">
          <h2>{t('home.tplHead')}</h2>
          <span className="sec-sub">{t('home.tplSub')}</span>
          <Link className="sec-more" to={pathOf(loc, '/templates')}>{t('home.tplAll')}</Link>
        </div>
        <div className="tpl-row">
          {PACKS.map((id) => (
            <Link key={id} to={pathOf(loc, '/scan')} className="tpl-item" onClick={() => { pending.pack = id }}>
              <TplThumb id={id} />
              <div className="tpl-name">{t('tpl.' + id)}</div>
            </Link>
          ))}
        </div>
      </section>

      <section className="feat-band">
        <h2>{t('home.featHead')}</h2>
        <div className="feat-grid">
          {feats.map((f) => (
            <div className="feat-cell" key={f.k}>
              <div className="feat-glyph">{f.g}</div>
              <div className="feat-txt">{t(f.k)}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="cta-band">
        <h2>{t('home.ctaHead')}</h2>
        <Link to={pathOf(loc, '/scan')} className="btn-big btn-big--seal">{t('home.ctaBtn')}</Link>
      </section>
    </div>
  )
}
