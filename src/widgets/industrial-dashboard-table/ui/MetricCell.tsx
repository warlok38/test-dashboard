import { ArrowRightOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import Link from 'next/link'

import { type DashboardMetric } from '@/entities/production-stage'
import { KpiValue } from '@/shared/ui'

import { getHrefWithQuery, getMetricProgressPercent, getMetricStatus } from '../lib'
import styles from '../IndustrialDashboardTable.module.css'
import { getDeltaBadgeClassName, getMetricClassName } from './classNames'

type MetricCellProps = {
  metric: DashboardMetric | undefined
  queryString: string
}

export function MetricCell({ metric, queryString }: MetricCellProps) {
  if (!metric) {
    return <div className={styles.emptyCell} aria-hidden="true" />
  }

  const status = getMetricStatus(metric)
  const progressPercent = getMetricProgressPercent(metric, status)
  const hasDetailRoute = Boolean(metric.detailRoute)
  const content = (
    <div className={classNames(styles.metricCell, getMetricClassName(status))}>
      {hasDetailRoute && (
        <span className={styles.metricArrow} aria-hidden="true">
          <ArrowRightOutlined />
        </span>
      )}
      <div className={styles.metricTitle}>{metric.title}</div>
      <KpiValue
        as="div"
        className={styles.metricValue}
        kind="fact"
        value={metric.value}
        fractionDigits={metric.valueFractionDigits}
      />
      <div className={styles.metricMeta}>
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
        <div className={styles.metricProgress} aria-hidden="true">
          <span style={{ width: `${progressPercent}%` }} />
        </div>
      )}
    </div>
  )

  if (!hasDetailRoute || !metric.detailRoute) {
    return content
  }

  return (
    <Link
      className={styles.metricLink}
      href={getHrefWithQuery(metric.detailRoute, queryString)}
      aria-label={`Открыть детализацию: ${metric.title}`}
    >
      {content}
    </Link>
  )
}
