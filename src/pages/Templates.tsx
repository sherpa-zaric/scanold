import { Link } from 'react-router-dom'
import { useI18n, pathOf } from '../i18n'
import { PACKS, PackId, TplThumb } from '../components'

const DESC: Record<PackId, { en: string; zh: string }> = {
  news: { en: 'Yellowed newsprint, tight columns, ink bleed. Pages look cut from different days.', zh: '泛黄新闻纸、密排分栏、油墨微洇，每页都像剪自不同一天。' },
  arch: { en: 'Folder-toned paper with file stamps and shelf dust. Perfect for memos and records.', zh: '档案袋色调，带编号章与上架灰尘感，适合备忘与记录文件。' },
  kraft: { en: 'Coarse kraft wrapper with fiber flecks — parcels, envelopes and manila covers.', zh: '粗纤维牛皮纸，适合包裹单、信封与档案袋封面。' },
  copy: { en: 'Third-generation photocopy: crushed blacks, blown highlights, copier skew.', zh: '第三代复印件：黑位糊死、高光过曝、复印机走纸歪斜。' },
  fax: { en: 'Thermal fax roll with feed stripes and a soft top-edge curl.', zh: '热敏传真纸，带走纸条纹与顶端轻微卷边。' },
  mime: { en: 'Mimeograph exam paper: uneven ink, duplicated blur, dotted staples.', zh: '油印考卷：着墨不均、翻印发虚、订书钉锈点。' },
  red: { en: 'Aged official layout with a red masthead band — one tone only, nothing copied.', zh: '旧式公文版式配红色版头，仅做泛黄做旧，不复制任何真实机关版式。' },
  snap: { en: 'Phone snap look: tilt, corner shadow, slight defocus and a finger at the edge.', zh: '手机随手拍：歪斜、角阴影、轻微失焦，边缘还搭着一根手指。' },
}

export default function Templates() {
  const { loc, t } = useI18n()
  return (
    <div className="tplpage">
      <h1>{t('tplpage.title')}</h1>
      <p className="intro">{t('tplpage.intro')}</p>
      <div className="tpl-grid">
        {PACKS.map((id) => (
          <div className="tpl-card" key={id}>
            <TplThumb id={id} />
            <h3>{t('tpl.' + id)}</h3>
            <p>{loc === 'zh' ? DESC[id].zh : DESC[id].en}</p>
            <Link to={pathOf(loc, '/scan')}>{t('tplpage.open')}</Link>
          </div>
        ))}
      </div>
    </div>
  )
}
