import { ArrowRightOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import Link from 'next/link'
import { Bar, BarChart, YAxis } from 'recharts'

import { type MiningStageMetric } from '@/entities/production-stage'
import { ChartFrame, KpiValue } from '@/shared/ui'

import { getHrefWithQuery, getProgressPercent, getSummaryDelta } from '../lib'
import styles from '../MiningStageOverview.module.css'
import { TrendChart } from './TrendChart'

const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-kpi-plan)'

type MiningMetricCardProps = {
  metric: MiningStageMetric
  queryString: string
}

function getMetricTone(delta: number | null) {
  if (delta === null || delta === 0) {
    return styles.metricNeutral
  }

  return delta > 0 ? styles.metricSuccess : styles.metricDanger
}

export function MiningMetricCard({ metric, queryString }: MiningMetricCardProps) {
  const delta = getSummaryDelta(metric)
  const progressPercent = getProgressPercent(metric)
  const metricHeaderContent = (
    <>
      <div className={styles.metricTitleGroup}>
        <h2 className={styles.metricTitle}>{metric.title}</h2>
        <span className={styles.metricUnit}>{metric.unit}</span>
      </div>

      {metric.detailRoute && (
        <span className={styles.detailIndicator} aria-hidden="true">
          <ArrowRightOutlined />
        </span>
      )}
    </>
  )

  return (
    <article className={classNames(styles.metricCard, getMetricTone(delta))}>
      {metric.detailRoute ? (
        <Link
          className={classNames(styles.metricHeader, styles.metricHeaderLink)}
          href={getHrefWithQuery(metric.detailRoute, queryString)}
          aria-label={`Открыть детализацию: ${metric.title}`}
        >
          {metricHeaderContent}
        </Link>
      ) : (
        <div className={styles.metricHeader}>{metricHeaderContent}</div>
      )}

      <div className={styles.metricBody}>
        <div className={styles.summaryPanel}>
          <div className={styles.primaryStat}>
            <span>Факт</span>
            <KpiValue
              as="strong"
              kind="fact"
              value={metric.summary.fact}
              fractionDigits={metric.summary.fact % 1 === 0 ? 0 : 1}
            />
          </div>

          <div className={styles.statRow}>
            <span>План</span>
            <KpiValue
              as="strong"
              kind="plan"
              value={metric.summary.plan}
              fractionDigits={metric.summary.plan % 1 === 0 ? 0 : 1}
            />
          </div>

          <div className={styles.statRow}>
            <span>Отклонение</span>
            <KpiValue as="strong" kind="delta" value={delta} fractionDigits={1} />
          </div>

          <div className={styles.progressTrack} aria-hidden="true">
            <span style={{ width: `${progressPercent}%` }} />
          </div>

          <ChartFrame className={styles.summaryChart}>
            <BarChart data={[metric.summary]} barGap={6}>
              <YAxis hide domain={[0, 'dataMax + 20']} />
              <Bar dataKey="fact" fill={FACT_COLOR} radius={[3, 3, 0, 0]} />
              <Bar dataKey="plan" fill={PLAN_COLOR} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ChartFrame>
        </div>

        <div className={styles.trendPanel}>
          <div className={styles.trendTitle}>Динамика по дням</div>
          <ChartFrame className={styles.trendChart}>
            <TrendChart metric={metric} />
          </ChartFrame>
        </div>
      </div>
    </article>
  )
}
