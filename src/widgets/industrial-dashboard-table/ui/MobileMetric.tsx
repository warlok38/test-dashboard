import classNames from 'classnames'
import Link from 'next/link'

import { type DashboardMetric } from '@/entities/production-stage'
import { KpiValue } from '@/shared/ui'

import { getHrefWithQuery, getMetricProgressPercent, getMetricStatus } from '../lib'
import styles from '../IndustrialDashboardTable.module.css'
import { getDeltaBadgeClassName, getMetricClassName } from './classNames'

type MobileMetricProps = {
  metric: DashboardMetric
  queryString: string
}

export function MobileMetric({ metric, queryString }: MobileMetricProps) {
  const status = getMetricStatus(metric)
  const progressPercent = getMetricProgressPercent(metric, status)
  const content = (
    <div className={classNames(styles.mobileMetric, getMetricClassName(status))}>
      <div className={styles.mobileMetricMain}>
        <div className={styles.mobileMetricTitle}>{metric.title}</div>
        <KpiValue
          as="div"
          className={styles.mobileMetricValue}
          kind="fact"
          value={metric.value}
          fractionDigits={metric.valueFractionDigits}
        />
      </div>
      <div className={styles.mobileMetricMeta}>
        <span>
          План:{' '}
          <KpiValue kind="plan" value={metric.plan} fractionDigits={metric.planFractionDigits} />
        </span>
        {metric.delta !== null && (
          <KpiValue
            as="span"
            className={getDeltaBadgeClassName(metric.delta)}
            kind="delta"
            value={metric.delta}
            fractionDigits={metric.deltaFractionDigits}
          />
        )}
      </div>
      {progressPercent !== null && (
        <div className={styles.mobileMetricProgress} aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </div>
  )

  if (!metric.detailRoute) {
    return content
  }

  return (
    <Link
      key={metric.id}
      className={styles.mobileMetricLink}
      href={getHrefWithQuery(metric.detailRoute, queryString)}
      aria-label={`Открыть детализацию: ${metric.title}`}
    >
      {content}
    </Link>
  )
}
