import { useRef, useState } from 'react'
import { useI18n } from '../i18n'

const TYPES = ['news', 'letter', 'telegram', 'cert', 'intro', 'note'] as const

export default function RelicMaker() {
  const { t } = useI18n()
  const [type, setType] = useState<string>('news')
  const [mast, setMast] = useState('申报')
  const [date, setDate] = useState('民国二十六年五月十日')
  const [issue, setIssue] = useState('第壹万贰仟叁佰肆拾伍号')
  const [title, setTitle] = useState('招商局复员运输全线告捷')
  const [body, setBody] = useState(
    '本报讯，招商局轮船昨自沪启碇，沿海复员运输全线告捷，各埠客货往来渐复旧观。据该局负责人谈，此次复员运输历时数月，赖各方协助，终克于成。\n\n又讯，本埠各轮船公司近日陆续恢复班期，天津、青岛、广州各线客票预定一空。码头工人日夜装卸，货物堆积如山，市面为之振奋。\n\n业内人士称，航运既通，则百货流通、物价可平，实为战后复员之一大好消息云。',
  )
  const [aging, setAging] = useState(70)
  const [busy, setBusy] = useState(false)
  const newsRef = useRef<HTMLDivElement>(null)

  async function renderCanvas() {
    if (!newsRef.current) return null
    const { default: html2canvas } = await import('html2canvas')
    return html2canvas(newsRef.current, { backgroundColor: '#f3e9d3', scale: 2 })
  }

  function download(data: Blob | string, name: string) {
    const a = document.createElement('a')
    a.download = name
    a.href = typeof data === 'string' ? data : URL.createObjectURL(data)
    a.click()
  }

  async function exportPng() {
    if (!newsRef.current || busy) return
    setBusy(true)
    try {
      const canvas = await renderCanvas()
      if (canvas) download(canvas.toDataURL('image/png'), 'makeold-relic.png')
    } finally {
      setBusy(false)
    }
  }

  async function exportPdf() {
    if (!newsRef.current || busy) return
    setBusy(true)
    try {
      const canvas = await renderCanvas()
      if (!canvas) return
      const { PDFDocument } = await import('pdf-lib')
      const pdf = await PDFDocument.create()
      const img = await pdf.embedPng(canvas.toDataURL('image/png'))
      const page = pdf.addPage([canvas.width / 2, canvas.height / 2])
      page.drawImage(img, { x: 0, y: 0, width: canvas.width / 2, height: canvas.height / 2 })
      const bytes = await pdf.save()
      download(new Blob([bytes], { type: 'application/pdf' }), 'makeold-relic.pdf')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="wb wb--wide">
      <div className="wb-top">
        <span style={{ color: 'var(--ink-2)' }}>{t('nav.relic')}</span>
        <span className="tag-gold" style={{ color: 'var(--seal)', borderColor: '#e0a89e' }}>{t('relic.tag')}</span>
        <div className="wb-export">
          <button className="btn-ghost" disabled={busy} onClick={exportPdf}>{busy ? t('lab.loading') : t('relic.exportPdf')}</button>
          <button className="btn-seal" disabled={busy} onClick={exportPng}>{busy ? t('lab.loading') : t('relic.export')}</button>
        </div>
      </div>

      <div className="rel-grid">
        <div className="rel-form">
          <div className="col-title">{t('relic.type')}</div>
          <div className="chips">
            {TYPES.map((x) => (
              <button
                key={x}
                className={`chip ${type === x ? 'on' : 'dim'}`}
                onClick={() => setType(x)}
                title={x === 'news' ? '' : t('relic.coming')}
              >
                {t('relic.' + x)}{x === 'news' ? '' : ' · ' + t('relic.coming')}
              </button>
            ))}
          </div>

          <div className="field">
            <label>{t('relic.mast')}</label>
            <input value={mast} onChange={(e) => setMast(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('relic.date')}</label>
            <input value={date} onChange={(e) => setDate(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('relic.title')}</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="field">
            <label>{t('relic.body')}</label>
            <textarea rows={7} value={body} onChange={(e) => setBody(e.target.value)} />
          </div>
          <div className="slider-row">
            <div className="slider-lab">
              <span>{t('relic.aging')}</span>
              <b>{aging}%</b>
            </div>
            <input type="range" min={0} max={100} value={aging} onChange={(e) => setAging(+e.target.value)} />
          </div>
          <div className="hint">{t('relic.hint')}</div>
        </div>

        <div className="rel-stage">
          <div className="rel-preview-tag">{t('relic.live')}</div>
          <div className="news" ref={newsRef} style={{ filter: `sepia(${(0.15 + aging / 220).toFixed(2)}) contrast(${(1 + aging / 500).toFixed(2)})` }}>
            <div className="news-mast">{mast}</div>
            <div className="news-meta">
              <span>{date}</span>
              <span>{issue}</span>
              <span>零售大洋三分</span>
            </div>
            <h2 className="news-title">{title}</h2>
            <div className="news-sub">——本报特约记者发自上海</div>
            <div className="news-cols">
              {body.split('\n').filter(Boolean).map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>
            <div className="news-seal">
              <span>造旧</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
