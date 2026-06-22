'use client'

import { ArrowRightOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import {
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  LineChart,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { type MiningStageMetric } from '@/shared/mocks'
import { ChartFrame, KpiValue } from '@/shared/ui'
import { formatNumber } from '@/shared/utils/formatNumber'

import styles from './MiningStageOverview.module.css'

const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-kpi-plan)'
const TREND_Y_AXIS_WIDTH = 40
const TREND_MARGIN_RIGHT = 12
const MIN_X_TICK_GAP = 26

type MiningStageOverviewProps = {
  metrics: MiningStageMetric[]
}

function formatMetricNumber(value: number) {
  return formatNumber(value, { fractionDigits: value % 1 === 0 ? 0 : 1 })
}

function getHrefWithQuery(href: string, queryString: string) {
  return queryString ? `${href}?${queryString}` : href
}

function getSummaryDelta(metric: MiningStageMetric) {
  if (metric.summary.plan === 0) {
    return metric.summary.fact === 0 ? 0 : null
  }

  return ((metric.summary.fact - metric.summary.plan) / metric.summary.plan) * 100
}

function getMetricTone(delta: number | null) {
  if (delta === null || delta === 0) {
    return styles.metricNeutral
  }

  return delta > 0 ? styles.metricSuccess : styles.metricDanger
}

function getProgressPercent(metric: MiningStageMetric) {
  if (metric.summary.plan <= 0) {
    return metric.summary.fact > 0 ? 100 : 0
  }

  return Math.max(0, Math.min((metric.summary.fact / metric.summary.plan) * 100, 100))
}

function getVisibleTickIndexes(pointCount: number, chartWidth: number) {
  if (pointCount <= 2) {
    return new Set(Array.from({ length: pointCount }, (_, index) => index))
  }

  const availableWidth = Math.max(chartWidth - TREND_Y_AXIS_WIDTH - TREND_MARGIN_RIGHT, 0)
  const maxTickCount = Math.max(Math.floor(availableWidth / MIN_X_TICK_GAP), 2)

  if (pointCount <= maxTickCount) {
    return new Set(Array.from({ length: pointCount }, (_, index) => index))
  }

  const lastIndex = pointCount - 1
  const maxInteriorTickCount = Math.max(maxTickCount - 2, 1)
  const step = Math.max(Math.ceil((pointCount - 2) / maxInteriorTickCount), 1)
  const indexes = new Set([0, lastIndex])

  for (let index = step; index < lastIndex; index += step) {
    if (lastIndex - index >= step) {
      indexes.add(index)
    }
  }

  return indexes
}

function renderTrendChart(metric: MiningStageMetric, chartWidth: number) {
  const visibleTickIndexes = getVisibleTickIndexes(metric.data.length, chartWidth)
  const tooltipFormatter = (value: unknown, name: unknown) => [
    formatMetricNumber(Number(value)),
    name === 'fact' ? 'Факт' : 'План'
  ]
  const tickFormatter = (value: unknown, index: number) =>
    visibleTickIndexes.has(index) ? String(value) : ''

  if (metric.kind === 'line') {
    return (
      <LineChart data={metric.data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--palette-border-soft)" vertical={false} />
        <XAxis
          dataKey="day"
          tickLine={false}
          axisLine={false}
          interval={0}
          tickFormatter={tickFormatter}
          height={32}
        />
        <YAxis tickLine={false} axisLine={false} width={40} />
        <Tooltip formatter={tooltipFormatter} />
        <Line
          type="monotone"
          dataKey="fact"
          stroke={FACT_COLOR}
          strokeWidth={2}
          dot={{ r: 3, fill: FACT_COLOR }}
        />
        <Line
          type="monotone"
          dataKey="plan"
          stroke={PLAN_COLOR}
          strokeWidth={2}
          dot={{ r: 3, fill: PLAN_COLOR }}
        />
      </LineChart>
    )
  }

  return (
    <ComposedChart data={metric.data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
      <CartesianGrid stroke="var(--palette-border-soft)" vertical={false} />
      <XAxis
        dataKey="day"
        tickLine={false}
        axisLine={false}
        interval={0}
        tickFormatter={tickFormatter}
        height={32}
      />
      <YAxis tickLine={false} axisLine={false} width={40} />
      <Tooltip formatter={tooltipFormatter} />
      <Bar dataKey="fact" fill={FACT_COLOR} radius={[3, 3, 0, 0]} />
      <Line
        type="monotone"
        dataKey="plan"
        stroke={PLAN_COLOR}
        strokeWidth={2}
        dot={{ r: 3, fill: PLAN_COLOR }}
      />
    </ComposedChart>
  )
}

export function MiningStageOverview({ metrics }: MiningStageOverviewProps) {
  const searchParams = useSearchParams()
  const queryString = searchParams.toString()

  return (
    <section className={styles.overview} aria-label="Обзор показателей добычи">
      <div className={styles.overviewHeader}>
        <div className={styles.legend} aria-hidden="true">
          <span className={styles.factLegend}>Факт</span>
          <span className={styles.planLegend}>План</span>
        </div>
      </div>

      <div className={styles.metricGrid}>
        {metrics.map((metric) => {
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
            <article
              className={classNames(styles.metricCard, getMetricTone(delta))}
              key={metric.id}
            >
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
                    {({ width }) => renderTrendChart(metric, width)}
                  </ChartFrame>
                </div>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
