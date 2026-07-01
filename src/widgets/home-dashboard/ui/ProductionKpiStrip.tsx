import classNames from 'classnames'

import { type HomeDashboardKpi } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type ProductionKpiStripProps = {
  kpis: HomeDashboardKpi[]
}

export function ProductionKpiStrip({ kpis }: ProductionKpiStripProps) {
  return (
    <section className={styles.kpiStrip} aria-label="Ключевые показатели производства">
      {kpis.map((kpi) => (
        <article
          key={kpi.id}
          className={classNames(styles.kpiCard, styles[`status-${kpi.status}`])}
        >
          <div className={styles.kpiHeader}>
            <span>{kpi.title}</span>
            <strong>{kpi.deltaLabel}</strong>
          </div>
          <b>
            {kpi.value}
            {kpi.unit ? <small>{kpi.unit}</small> : null}
          </b>
          <p>{kpi.caption}</p>
        </article>
      ))}
    </section>
  )
}
