import classNames from 'classnames'
import Link from 'next/link'

import {
  formatDeviation,
  formatSummaryNumber,
  getSeverityClassName,
  type DepositSummaryView
} from '@/entities/production-summary'

import styles from '../ProductionSummaryDashboard.module.css'

type DepositGridProps = {
  deposits: DepositSummaryView[]
}

export function DepositGrid({ deposits }: DepositGridProps) {
  if (deposits.length === 0) {
    return null
  }

  return (
    <section className={styles.depositSection} aria-labelledby="deposits-title">
      <h2 id="deposits-title">Месторождения</h2>
      <div className={styles.depositGrid}>
        {deposits.map((deposit) => {
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
                      <strong>{metric.title}</strong>
                      <span>{metric.unit}</span>
                    </div>
                    <b className={styles.metricValue}>
                      {formatSummaryNumber(metric.factValue, metric.title === 'Содержание' ? 2 : 1)}
                    </b>
                    <span
                      className={classNames(
                        styles.deviation,
                        styles[getSeverityClassName(metric.severity)]
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
