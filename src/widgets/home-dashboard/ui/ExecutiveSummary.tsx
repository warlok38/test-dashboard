import classNames from 'classnames'

import { type HomeDashboardSummary } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ExecutiveSummaryProps = {
  summary: HomeDashboardSummary
}

export function ExecutiveSummary({ summary }: ExecutiveSummaryProps) {
  return (
    <section className={classNames(styles.summary, styles[`status-${summary.status}`])}>
      <div className={styles.summaryLead}>
        <span className={styles.summaryEyebrow}>Производственный контур</span>
        <h1>{summary.statusTitle}</h1>
        <p>{summary.statusDescription}</p>
      </div>
      <div className={styles.summaryCards}>
        {summary.cards.map((card) => (
          <article
            key={card.id}
            className={classNames(styles.summaryCard, styles[`status-${card.status}`])}
          >
            <span>{card.title}</span>
            <strong>{card.value}</strong>
            <p>{card.caption}</p>
          </article>
        ))}
      </div>
    </section>
  )
}
