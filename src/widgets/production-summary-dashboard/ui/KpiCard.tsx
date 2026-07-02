import classNames from 'classnames'

import {
  getDeviationClassName,
  formatDeviation,
  formatSummaryNumber,
  type SummaryIndicatorCard
} from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'

type KpiCardProps = {
  card: SummaryIndicatorCard
}

export function KpiCard({ card }: KpiCardProps) {
  const fractionDigits = card.indicator_name === 'Содержание Au' ? 2 : 1

  return (
    <article className={styles.kpiCard}>
      <div className={styles.metricTitle}>
        <span className={styles.metricName}>{card.indicator_name}</span>
        <span className={styles.metricUnit}>{card.measure_unit}</span>
      </div>
      <b className={styles.metricValue}>{formatSummaryNumber(card.fact_value, fractionDigits)}</b>
      <span
        className={classNames(styles.deviation, styles[getDeviationClassName(card.deviation_pct)])}
      >
        {formatDeviation(card.deviation_pct)}
      </span>
    </article>
  )
}
