import classNames from 'classnames'
import Link from 'next/link'

import { type HomeDashboardAttentionItem } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type AttentionListProps = {
  items: HomeDashboardAttentionItem[]
}

const STATUS_LABELS: Record<HomeDashboardAttentionItem['status'], string> = {
  danger: 'Критично',
  neutral: 'Нет данных',
  warning: 'Отклонение'
}

export function AttentionList({ items }: AttentionListProps) {
  return (
    <section className={styles.panel} aria-labelledby="attention-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Приоритет</span>
          <h2 id="attention-title">Требуют внимания</h2>
        </div>
      </div>
      <div className={styles.attentionList}>
        {items.map((item) => {
          const content = (
            <article className={classNames(styles.attentionCard, styles[`status-${item.status}`])}>
              <div className={styles.attentionHeader}>
                <div>
                  <span>{item.title}</span>
                  <h3>{item.metricTitle}</h3>
                </div>
                <strong>{STATUS_LABELS[item.status]}</strong>
              </div>
              <div className={styles.attentionMetric}>
                <span>Факт / план</span>
                <b>
                  {item.factLabel} / {item.planLabel}
                </b>
              </div>
              <div className={styles.attentionFooter}>
                <strong>{item.deltaLabel}</strong>
                <p>{item.impact}</p>
              </div>
            </article>
          )

          if (!item.href) {
            return <div key={item.id}>{content}</div>
          }

          return (
            <Link key={item.id} href={item.href} className={styles.cardLink}>
              {content}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
