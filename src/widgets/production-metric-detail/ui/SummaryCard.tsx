import classNames from 'classnames'
import { Bar, BarChart, LabelList, YAxis } from 'recharts'

import { type BusinessUnitSummary } from '@/entities/production-stage'
import { ChartFrame } from '@/shared/ui'

import { formatStatusBadge, getChartValue, getDelta, getMetricTone, getStatusText } from '../lib'
import styles from '../ProductionMetricDetail.module.css'
import { renderFactValueLabel, renderPlanValueLabel } from './BarValueLabel'

const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-kpi-plan)'

type SummaryCardProps = {
  unit: BusinessUnitSummary
}

export function SummaryCard({ unit }: SummaryCardProps) {
  const delta = getDelta(unit.fact, unit.plan)
  const tone = getMetricTone(unit.fact, delta)
  const statusText = getStatusText(unit.fact, delta)
  const chartData = [
    {
      plan: unit.plan,
      fact: getChartValue(unit.fact),
      planLabel: unit.plan,
      factLabel: unit.fact
    }
  ]

  return (
    <article
      className={classNames(styles.summaryCard, {
        [styles.summaryCardDanger]: tone === 'danger',
        [styles.summaryCardSuccess]: tone === 'success'
      })}
    >
      <div className={styles.cardHeader}>
        <h2 className={styles.unitTitle}>{unit.title}</h2>
        <span
          className={classNames(styles.statusBadge, {
            [styles.statusBadgeDanger]: tone === 'danger',
            [styles.statusBadgeSuccess]: tone === 'success'
          })}
        >
          {formatStatusBadge(unit.fact, statusText, delta)}
        </span>
      </div>
      <div className={styles.chartArea} aria-hidden="true">
        <ChartFrame className={styles.summaryChart}>
          <BarChart
            data={chartData}
            barGap={4}
            margin={{ top: 0, right: 12, bottom: 28, left: 12 }}
          >
            <YAxis hide domain={[0, 'dataMax + 20']} />
            <Bar dataKey="plan" fill={PLAN_COLOR} radius={[3, 3, 0, 0]}>
              <LabelList
                content={renderPlanValueLabel}
                valueAccessor={(entry) => entry.payload.planLabel}
              />
            </Bar>
            <Bar dataKey="fact" fill={FACT_COLOR} radius={[3, 3, 0, 0]}>
              <LabelList
                content={renderFactValueLabel}
                valueAccessor={(entry) => entry.payload.factLabel ?? '-'}
              />
            </Bar>
          </BarChart>
        </ChartFrame>
      </div>
    </article>
  )
}
