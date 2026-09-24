import { useI18n } from '../i18n'

export default function About() {
  const { t } = useI18n()
  return (
    <div className="about">
      <h1>{t('about.title')}</h1>
      <div className="prose">
        <p>{t('about.p1')}</p>
        <p>{t('about.p2')}</p>
        <p>{t('about.p3')}</p>
      </div>
      <div className="dis-box">
        <h3>{t('about.disTitle')}</h3>
        <p>{t('about.disclaimer')}</p>
      </div>
    </div>
  )
}
