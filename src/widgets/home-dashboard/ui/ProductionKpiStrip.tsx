import classNames from 'classnames'

import { type HomeDashboardKpi } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionKpiStripProps = {
  kpis: HomeDashboardKpi[]
}

export function ProductionKpiStrip({ kpis }: ProductionKpiStripProps) {
  return (
    <section className={styles.summaryCards} aria-label="Ключевые показатели производства">
      {kpis.map((kpi) => (
        <article
          key={kpi.id}
          className={classNames(styles.summaryCard, styles[`status-${kpi.status}`])}
        >
          <span>{kpi.title}</span>
          <strong>
            {kpi.value}
            {kpi.unit ? ` ${kpi.unit}` : ''}
          </strong>
          <p>
            {kpi.caption} · {kpi.deltaLabel}
          </p>
        </article>
      ))}
    </section>
  )
}
