import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useI18n } from '../i18n'
import { PACKS, PackId } from '../components'
import { Fx, TextPiece, exportScan, fxCss, loadDoc, tiltDeg } from '../engine'
import { pending } from '../pending'

const PRESETS: Record<PackId, Fx> = {
  news: { age: 75, tilt: 45, grain: 55, yellow: 70, blur: 10 },
  arch: { age: 55, tilt: 52, grain: 40, yellow: 50, blur: 6 },
  kraft: { age: 65, tilt: 50, grain: 65, yellow: 85, blur: 8 },
  copy: { age: 80, tilt: 56, grain: 75, yellow: 15, blur: 14 },
  fax: { age: 50, tilt: 47, grain: 60, yellow: 35, blur: 5 },
  mime: { age: 60, tilt: 54, grain: 70, yellow: 60, blur: 12 },
  red: { age: 35, tilt: 49, grain: 30, yellow: 45, blur: 4 },
  snap: { age: 25, tilt: 70, grain: 35, yellow: 25, blur: 9 },
}

function fmtSize(b: number) {
  return b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(1)} KB`
}

function Acc({ title, open, onToggle, children }: { title: string; open: boolean; onToggle: () => void; children: ReactNode }) {
  return (
    <div className={`acc ${open ? 'open' : ''}`}>
      <button className="acc-head" onClick={onToggle}>
        <span>{title}</span>
        <span className="chev">▾</span>
      </button>
      {open && <div className="acc-body">{children}</div>}
    </div>
  )
}

export default function ScanLab() {
  const { t } = useI18n()
  const fileRef = useRef<HTMLInputElement>(null)
  const viewRef = useRef<HTMLDivElement>(null)
  const dragRef = useRef(false)
  const [pack, setPack] = useState<PackId>('news')
  const [canvases, setCanvases] = useState<HTMLCanvasElement[]>([])
  const [thumbs, setThumbs] = useState<string[]>([])
  const [docTexts, setDocTexts] = useState<TextPiece[][]>([])
  const [fileName, setFileName] = useState('')
  const [fileSize, setFileSize] = useState(0)
  const [sel, setSel] = useState(0)
  const [strength, setStrength] = useState(85)
  const [age, setAge] = useState(75)
  const [tilt, setTilt] = useState(45)
  const [grain, setGrain] = useState(55)
  const [yellow, setYellow] = useState(70)
  const [blur, setBlur] = useState(10)
  const [random, setRandom] = useState(true)
  const [gray, setGray] = useState(false)
  const [cmp, setCmp] = useState(55)
  const [z, setZ] = useState(1)
  const [busy, setBusy] = useState(false)
  const [over, setOver] = useState(false)
  const [acc, setAcc] = useState({ packs: true, tune: true, opts: false })
  const [viewSize, setViewSize] = useState({ w: 900, h: 620 })
  /** null = nothing exported yet; 'text' | 'plain' = last export result */
  const [done, setDone] = useState<null | 'text' | 'plain'>(null)

  // file / style pack handed over from the homepage quick-start zone
  useEffect(() => {
    if (pending.pack) { pickPack(pending.pack); pending.pack = null }
    if (pending.file) { const f = pending.file; pending.file = null; onFile(f) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // preview stage fits whatever space the viewport actually has
  useEffect(() => {
    const el = viewRef.current
    if (!el) return
    const ro = new ResizeObserver(() => {
      setViewSize({ w: el.clientWidth, h: el.clientHeight })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [canvases.length])

  const fx: Fx = { age, tilt, grain, yellow, blur }
  const k = strength / 100
  const filter = fxCss(fx, strength) + (gray ? ' grayscale(1)' : '')
  const hasText = docTexts.some((arr) => arr.length > 0)

  const cw = canvases[sel]?.width ?? 3
  const ch = canvases[sel]?.height ?? 4
  const availW = Math.max(200, viewSize.w - 56)
  const availH = Math.max(240, viewSize.h - 56)
  const sc = Math.min(availW / cw, availH / ch)
  const dispW = Math.round(cw * sc)
  const dispH = Math.round(ch * sc)

  function pickPack(id: PackId) {
    const p = PRESETS[id]
    setPack(id)
    setAge(p.age); setTilt(p.tilt); setGrain(p.grain); setYellow(p.yellow); setBlur(p.blur)
  }

  function resetAll() {
    setCanvases([])
    setThumbs([])
    setDocTexts([])
    setFileName('')
    setFileSize(0)
    setSel(0)
    setZ(1)
    setDone(null)
  }

  async function onFile(f?: File | null) {
    if (!f) return
    setBusy(true)
    try {
      const doc = await loadDoc(f)
      setCanvases(doc.pages)
      setThumbs(doc.pages.map((p) => p.toDataURL('image/jpeg', 0.85)))
      setDocTexts(doc.texts)
      setFileName(f.name)
      setFileSize(f.size)
      setSel(0)
      setZ(1)
      setCmp(55)
      setDone(null)
    } catch {
      alert('Could not read this file. PDF, JPG or PNG please.')
    } finally {
      setBusy(false)
    }
  }

  async function generate() {
    if (!canvases.length) return
    setBusy(true)
    try {
      const withText = await exportScan(canvases, fx, random, gray, fileName || 'doc.pdf', strength, docTexts)
      setDone(withText ? 'text' : 'plain')
    } finally {
      setBusy(false)
    }
  }

  // drag the compare split directly on the image
  function updateCmp(e: React.PointerEvent<HTMLDivElement>) {
    const r = e.currentTarget.getBoundingClientRect()
    if (r.width < 10) return
    const pct = ((e.clientX - r.left) / r.width) * 100
    setCmp(Math.min(98, Math.max(2, pct)))
  }
  function onSplitDown(e: React.PointerEvent<HTMLDivElement>) {
    dragRef.current = true
    e.currentTarget.setPointerCapture(e.pointerId)
    updateCmp(e)
  }
  function onSplitMove(e: React.PointerEvent<HTMLDivElement>) {
    if (dragRef.current) updateCmp(e)
  }
  function onSplitUp() {
    dragRef.current = false
  }

  const sliders = [
    { lab: 'lab.strength', val: `${strength}%`, v: strength, set: setStrength },
    { lab: 'lab.age', val: `${age}%`, v: age, set: setAge },
    { lab: 'lab.tilt', val: `${tiltDeg(tilt).toFixed(2)}°`, v: tilt, set: setTilt },
    { lab: 'lab.grain', val: `${grain}%`, v: grain, set: setGrain },
    { lab: 'lab.yellow', val: `${yellow}%`, v: yellow, set: setYellow },
    { lab: 'lab.blur', val: `${blur}%`, v: blur, set: setBlur },
  ]

  return (
    <div className="wb wb--wide">
      <div className="lab2">
        <aside className="lab2-side">
          {canvases.length === 0 ? (
            <div
              className={`up-card ${over ? 'over' : ''}`}
              onClick={() => fileRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setOver(true) }}
              onDragLeave={() => setOver(false)}
              onDrop={(e) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files?.[0]) }}
            >
              <div className="up-badge">PDF · JPG · PNG</div>
              <div className="up-title">{t('lab.drop')}</div>
              <div className="up-hint">{t('lab.dropHint')}</div>
              <span className="up-or">{t('lab.choose')}</span>
            </div>
          ) : (
            <div className="up-card up-file" onClick={() => fileRef.current?.click()}>
              <div className="up-name">📄 {fileName}</div>
              <div className="up-meta">{canvases.length} {t('lab.pages')} · {fmtSize(fileSize)}</div>
              <span className="up-or">{t('lab.replace')}</span>
            </div>
          )}

          <Acc title={t('lab.packs')} open={acc.packs} onToggle={() => setAcc({ ...acc, packs: !acc.packs })}>
            <div className="chips">
              {PACKS.map((id) => (
                <button key={id} className={`chip ${pack === id ? 'on' : ''}`} onClick={() => pickPack(id)}>
                  {t('tpl.' + id)}
                </button>
              ))}
            </div>
          </Acc>

          <Acc title={t('lab.tune')} open={acc.tune} onToggle={() => setAcc({ ...acc, tune: !acc.tune })}>
            {sliders.map((s) => (
              <div className="slider-row" key={s.lab}>
                <div className="slider-lab">
                  <span>{t(s.lab)}</span>
                  <b>{s.val}</b>
                </div>
                <input type="range" min={0} max={100} value={s.v} onChange={(e) => s.set(+e.target.value)} />
              </div>
            ))}
          </Acc>

          <Acc title={t('lab.opts')} open={acc.opts} onToggle={() => setAcc({ ...acc, opts: !acc.opts })}>
            <div className="chips">
              <button className={`chip ${gray ? 'on' : ''}`} onClick={() => setGray(!gray)}>{t('lab.gray')}</button>
            </div>
            <div className="sw-row">
              <button className={`sw ${random ? 'on' : ''}`} onClick={() => setRandom(!random)} aria-label="toggle" />
              <span className="sw-txt">
                {t('lab.random')}
                <small>{t('lab.rec')}</small>
              </span>
            </div>
            <div className="opt-tags">
              {hasText
                ? <span className="tag-gold">{t('lab.layer')}</span>
                : <span className="opt-note">{t('lab.layerNo')}</span>}
            </div>
            <div className="opt-note">{t('lab.note')}</div>
          </Acc>

          <button className="btn-seal lab2-gen" disabled={!canvases.length || busy} onClick={generate}>
            {busy ? t('lab.loading') : t('lab.generate')}
          </button>

          {done && (
            <div className="done-bar">
              <span>{done === 'text' ? t('lab.doneText') : t('lab.done')}</span>
              <button className="btn-ghost" onClick={resetAll}>{t('lab.another')}</button>
            </div>
          )}

          <input
            ref={fileRef}
            type="file"
            accept="application/pdf,image/*"
            style={{ display: 'none' }}
            onChange={(e) => onFile(e.target.files?.[0])}
          />
        </aside>

        <section
          className={`lab2-main ${over && canvases.length > 0 ? 'over' : ''}`}
          onDragOver={(e) => { e.preventDefault(); setOver(true) }}
          onDragLeave={() => setOver(false)}
          onDrop={(e) => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files?.[0]) }}
        >
          {canvases.length === 0 ? (
            <div className="pv-empty">
              <div className="pv-empty-ic">🗞️</div>
              <div>{t('lab.emptyMain')}</div>
            </div>
          ) : (
            <>
              <div className="pv-head2">
                <span className="on">{t('lab.preview')}</span>
                <span style={{ color: 'var(--wb-dim)' }}>{t('lab.compare')}</span>
                <div className="zoom-ctl" style={{ marginLeft: 'auto' }}>
                  <button onClick={() => setZ(Math.max(1, +(z - 0.25).toFixed(2)))}>−</button>
                  <span>{Math.round(z * 100)}%</span>
                  <button onClick={() => setZ(Math.min(4, +(z + 0.25).toFixed(2)))}>＋</button>
                </div>
              </div>
              <div className="pv-view2" ref={viewRef}>
                <div
                  className="pv-stage2"
                  style={{ width: dispW * z, height: dispH * z }}
                  onPointerDown={onSplitDown}
                  onPointerMove={onSplitMove}
                  onPointerUp={onSplitUp}
                  onPointerCancel={onSplitUp}
                >
                  <div className="pv-frame">
                    <img src={thumbs[sel]} alt="original" draggable={false} />
                  </div>
                  <div
                    className="pv-frame pv-aged"
                    style={{ clipPath: `inset(0 ${100 - cmp}% 0 0)`, transform: `rotate(${(tiltDeg(tilt) * k).toFixed(2)}deg)`, filter }}
                  >
                    <img src={thumbs[sel]} alt="scan" draggable={false} />
                    <div className="stains" style={{ opacity: (age / 140) * k }} />
                    <div className="grain" style={{ opacity: (grain / 130) * k }} />
                  </div>
                  <div className="pv-split" style={{ left: `${cmp}%` }} />
                </div>
              </div>
              <div className="pv-pager">
                <button disabled={sel === 0} onClick={() => { setSel(sel - 1); setZ(1) }}>‹</button>
                <span>{sel + 1} / {canvases.length}</span>
                <button disabled={sel === canvases.length - 1} onClick={() => { setSel(sel + 1); setZ(1) }}>›</button>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  )
}
