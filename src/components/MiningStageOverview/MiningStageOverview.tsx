'use client'

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
import { ChartFrame } from '@/shared/ui'
import { formatNumber } from '@/shared/utils/formatNumber'

import styles from './MiningStageOverview.module.css'

const FACT_COLOR = '#fab529'
const PLAN_COLOR = '#5d605d'

type MiningStageOverviewProps = {
  metrics: MiningStageMetric[]
}

function formatMetricNumber(value: number) {
  return formatNumber(value, { fractionDigits: value % 1 === 0 ? 0 : 1 })
}

function renderTrendChart(metric: MiningStageMetric) {
  const tooltipFormatter = (value: unknown, name: unknown) => [
    formatMetricNumber(Number(value)),
    name === 'fact' ? 'Факт' : 'План'
  ]

  if (metric.kind === 'line') {
    return (
      <LineChart data={metric.data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--palette-border-soft)" vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} interval={0} height={32} />
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
      <XAxis dataKey="day" tickLine={false} axisLine={false} interval={0} height={32} />
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
  return (
    <section className={styles.overview} aria-label="Обзор показателей добычи">
      <div className={styles.legend} aria-hidden="true">
        <span className={styles.factLegend}>Факт</span>
        <span className={styles.planLegend}>План</span>
      </div>

      <div className={styles.metricList}>
        {metrics.map((metric) => (
          <article className={styles.metricRow} key={metric.id}>
            <div className={styles.metricSummary}>
              <h2 className={styles.metricTitle}>
                {metric.title} <span>{metric.unit}</span>
              </h2>
              <ChartFrame className={styles.summaryChart}>
                <BarChart data={[metric.summary]} barGap={6}>
                  <YAxis hide domain={[0, 'dataMax + 20']} />
                  <Bar dataKey="fact" fill={FACT_COLOR} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="plan" fill={PLAN_COLOR} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartFrame>
              <div className={styles.summaryValues}>
                <span>{formatMetricNumber(metric.summary.fact)}</span>
                <span>{formatMetricNumber(metric.summary.plan)}</span>
              </div>
            </div>

            <ChartFrame className={styles.trendChart}>{renderTrendChart(metric)}</ChartFrame>
          </article>
        ))}
      </div>
    </section>
  )
}
