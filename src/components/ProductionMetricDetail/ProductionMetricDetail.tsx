'use client'

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { type ProductionMetricDetail as ProductionMetricDetailData } from '@/shared/mocks'
import { ChartFrame } from '@/shared/ui'
import { formatNumber, formatPercent } from '@/shared/utils/formatNumber'

import styles from './ProductionMetricDetail.module.css'

const FACT_COLOR = '#fab529'
const PLAN_COLOR = '#5d605d'

type ProductionMetricDetailProps = {
  detail: ProductionMetricDetailData
}

function getDelta(fact: number, plan: number) {
  if (plan === 0) {
    return fact === 0 ? 0 : null
  }

  return ((fact - plan) / plan) * 100
}

function formatDetailNumber(value: number) {
  return formatNumber(value, { fractionDigits: value % 1 === 0 ? 0 : 2 })
}

export function ProductionMetricDetail({ detail }: ProductionMetricDetailProps) {
  return (
    <section className={styles.detail} aria-labelledby="metric-detail-title">
      <div className={styles.toolbar}>
        <div>
          <p className={styles.eyebrow}>{detail.stageTitle}</p>
          <h1 id="metric-detail-title" className={styles.title}>
            {detail.metricTitle}, {detail.unit}
          </h1>
        </div>
      </div>

      <div className={styles.summaryGrid}>
        {detail.summaries.map((unit) => {
          const delta = getDelta(unit.fact, unit.plan)
          const isDanger = delta !== null && delta < 0

          return (
            <article className={styles.summaryCard} key={unit.slug}>
              <h2 className={styles.unitTitle}>{unit.title}</h2>
              <ChartFrame className={styles.summaryChart}>
                <BarChart data={[unit]} barGap={4}>
                  <YAxis hide domain={[0, 'dataMax + 20']} />
                  <Bar dataKey="fact" fill={FACT_COLOR} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="plan" fill={PLAN_COLOR} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ChartFrame>
              <div className={styles.summaryValues}>
                <span>{formatDetailNumber(unit.fact)}</span>
                <span>{formatDetailNumber(unit.plan)}</span>
              </div>
              <p className={styles.summaryMeta}>
                План: {formatDetailNumber(unit.plan)}
                {delta !== null && (
                  <span className={isDanger ? styles.deltaDanger : styles.deltaSuccess}>
                    {formatPercent(delta, 2)}
                  </span>
                )}
              </p>
            </article>
          )
        })}
      </div>

      <div className={styles.trendPanel}>
        <div className={styles.trendHeader}>
          <h2 className={styles.sectionTitle}>Динамика по дням</h2>
          <div className={styles.legend} aria-hidden="true">
            <span className={styles.factLegend}>Факт</span>
            <span className={styles.planLegend}>План</span>
          </div>
        </div>

        <ChartFrame className={styles.trendChart}>
          <ComposedChart data={detail.trend} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
            <CartesianGrid stroke="var(--palette-border-soft)" vertical={false} />
            <XAxis
              dataKey="day"
              tickLine={false}
              axisLine={{ stroke: 'var(--palette-border-soft)' }}
              interval={0}
              height={36}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={44}
              tickFormatter={(value) => formatNumber(Number(value))}
            />
            <Tooltip
              formatter={(value, name) => [
                formatDetailNumber(Number(value)),
                name === 'fact' ? 'Факт' : 'План'
              ]}
              labelFormatter={(label, payload) => {
                const month = payload?.[0]?.payload?.month

                return month ? `${label} ${month}` : label
              }}
            />
            <Legend formatter={(value) => (value === 'fact' ? 'Факт' : 'План')} />
            <Bar dataKey="fact" radius={[3, 3, 0, 0]}>
              {detail.trend.map((point) => (
                <Cell key={`${point.month}-${point.day}`} fill={FACT_COLOR} />
              ))}
            </Bar>
            <Line
              type="monotone"
              dataKey="plan"
              stroke={PLAN_COLOR}
              strokeWidth={2}
              dot={{ r: 3, fill: PLAN_COLOR }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ChartFrame>
      </div>
    </section>
  )
}
