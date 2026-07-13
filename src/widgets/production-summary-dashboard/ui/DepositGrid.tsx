import classNames from 'classnames'
import Link from 'next/link'

import {
  getDeviationClassName,
  formatDeviation,
  formatSummaryNumber,
  getSummaryFractionDigits,
  getSeverityClassName,
  type DepositSummaryView
} from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'

type DepositGridProps = {
  items: DepositSummaryView[]
  title: string
  titleId: string
}

export function DepositGrid({ items, title, titleId }: DepositGridProps) {
  if (items.length === 0) {
    return null
  }

  return (
    <section className={styles.depositSection} aria-labelledby={titleId}>
      <h2 id={titleId}>{title}</h2>
      <div className={styles.depositGrid}>
        {items.map((deposit) => {
          const content = (
            <article className={styles.depositCard}>
              <header className={styles.depositHeader}>
                <h3>{deposit.name}</h3>
                <span
                  className={classNames(
                    styles.statusBadge,
                    styles[getSeverityClassName(deposit.status)]
                  )}
                >
                  {deposit.statusLabel}
                </span>
              </header>
              <div className={styles.depositMetrics}>
                {deposit.metrics.map((metric) => (
                  <div key={metric.id} className={styles.depositMetric}>
                    <div className={styles.metricTitle}>
                      <span className={styles.metricName}>{metric.title}</span>
                      <span className={styles.metricUnit}>{metric.unit}</span>
                    </div>
                    <b className={styles.metricValue}>
                      {formatSummaryNumber(
                        metric.factValue,
                        getSummaryFractionDigits(metric.title)
                      )}
                    </b>
                    <span className={styles.planValue}>
                      План:
                      {formatSummaryNumber(
                        metric.planValue,
                        getSummaryFractionDigits(metric.title)
                      )}
                    </span>
                    <span
                      className={classNames(
                        styles.deviation,
                        styles[getDeviationClassName(metric.deviationPct)]
                      )}
                    >
                      {formatDeviation(metric.deviationPct)}
                    </span>
                  </div>
                ))}
              </div>
            </article>
          )

          return deposit.href ? (
            <Link key={deposit.name} href={deposit.href} className={styles.cardLink}>
              {content}
            </Link>
          ) : (
            <div key={deposit.name}>{content}</div>
          )
        })}
      </div>
    </section>
  )
}
