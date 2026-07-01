import classNames from 'classnames'

import { type HomeDashboardDeviation } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type DeviationReasonsListProps = {
  deviations: HomeDashboardDeviation[]
}

export function DeviationReasonsList({ deviations }: DeviationReasonsListProps) {
  return (
    <section className={styles.panel} aria-label="Причины отклонений">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Проблемы</span>
          <h2>Отклонения и причины</h2>
        </div>
      </div>
      <div className={styles.deviationList}>
        {deviations.map((deviation) => (
          <article
            key={deviation.id}
            className={classNames(styles.deviationRow, styles[`status-${deviation.status}`])}
          >
            <div>
              <span>
                {deviation.assetTitle} · {deviation.stageTitle}
              </span>
              <h3>{deviation.reasonTitle}</h3>
              <p>{deviation.metricTitle}</p>
              <b>{deviation.factPlanLabel}</b>
            </div>
            <div className={styles.deviationMeta}>
              <strong>{deviation.deltaLabel}</strong>
              <em>{deviation.impactLabel}</em>
              <small>влияние</small>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
