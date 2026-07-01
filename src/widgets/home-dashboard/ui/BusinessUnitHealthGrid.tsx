import classNames from 'classnames'

import { type HomeDashboardBusinessUnit } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type BusinessUnitHealthGridProps = {
  units: HomeDashboardBusinessUnit[]
}

const UNIT_STATUS_LABELS: Record<HomeDashboardBusinessUnit['status'], string> = {
  danger: 'Критично',
  neutral: 'Нет данных',
  success: 'В норме',
  warning: 'Отклонение'
}

export function BusinessUnitHealthGrid({ units }: BusinessUnitHealthGridProps) {
  return (
    <section className={styles.panel} aria-labelledby="business-units-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Месторождения</span>
          <h2 id="business-units-title">Состояние по активам</h2>
        </div>
      </div>
      <div className={styles.businessGrid}>
        {units.map((unit) => (
          <article
            key={unit.id}
            className={classNames(styles.businessCard, styles[`status-${unit.status}`])}
          >
            <div className={styles.businessHeader}>
              <h3>{unit.title}</h3>
              <strong>{UNIT_STATUS_LABELS[unit.status]}</strong>
            </div>
            <p>
              {unit.worstMetricTitle}: <span>{unit.worstMetricDeltaLabel}</span>
            </p>
            <b>{unit.contributionLabel}</b>
            <dl>
              {unit.metrics.map((metric) => (
                <div key={metric.id}>
                  <dt>{metric.title}</dt>
                  <dd className={styles[`status-${metric.status}`]}>
                    {metric.value} <span>{metric.deltaLabel}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
