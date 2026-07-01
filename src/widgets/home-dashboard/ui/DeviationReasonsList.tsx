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
          <span className={styles.panelEyebrow}>Отклонения</span>
          <h2>Ключевые причины</h2>
        </div>
      </div>
      <div className={styles.attentionList}>
        {deviations.map((deviation) => (
          <article
            key={deviation.id}
            className={classNames(styles.attentionCard, styles[`status-${deviation.status}`])}
          >
            <div className={styles.attentionHeader}>
              <div>
                <span>
                  {deviation.assetTitle} · {deviation.stageTitle}
                </span>
                <h3>{deviation.reasonTitle}</h3>
              </div>
              <strong>{deviation.deltaLabel}</strong>
            </div>
            <div className={styles.attentionMetric}>
              <span>{deviation.metricTitle}</span>
              <b>{deviation.factPlanLabel}</b>
            </div>
            <div className={styles.attentionFooter}>
              <strong>{deviation.impactLabel}</strong>
              <p>Влияние на выпуск золота</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
