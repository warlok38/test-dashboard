'use client'

import { Bar, BarChart, LabelList, YAxis } from 'recharts'
import classNames from 'classnames'

import { type ProductionMetricDetail as ProductionMetricDetailData } from '@/shared/mocks'
import { ChartFrame } from '@/shared/ui'
import { formatNumber, formatPercent } from '@/shared/utils/formatNumber'

import styles from './ProductionMetricDetail.module.css'

const FACT_COLOR = '#fab529'
const PLAN_COLOR = '#5d605d'
const NEUTRAL_VALUE_COLOR = '#8a8f8a'
const EMPTY_BAR_VALUE = 0.001

type MetricValue = number | null | undefined

type ProductionMetricDetailProps = {
  detail: ProductionMetricDetailData
}

function hasMetricValue(value: MetricValue): value is number {
  return typeof value === 'number'
}

function getDelta(fact: MetricValue, plan: number) {
  if (!hasMetricValue(fact)) {
    return null
  }

  if (plan === 0) {
    return fact === 0 ? 0 : null
  }

  return ((fact - plan) / plan) * 100
}

function formatDetailNumber(value: number) {
  return formatNumber(value, { fractionDigits: value % 1 === 0 ? 0 : 2 })
}

function getMetricTone(fact: MetricValue, delta: number | null) {
  if (!hasMetricValue(fact)) {
    return 'danger'
  }

  if (delta === null) {
    return 'neutral'
  }

  return delta < 0 ? 'danger' : 'success'
}

function getValueTone(value: MetricValue) {
  return hasMetricValue(value) && value > 0 ? 'active' : 'neutral'
}

function getDeltaValueTone(delta: number | null) {
  if (delta === null || delta === 0) {
    return 'neutral'
  }

  return delta < 0 ? 'danger' : 'success'
}

function getStatusText(fact: MetricValue, delta: number | null) {
  if (!hasMetricValue(fact)) {
    return 'Нет факта'
  }

  if (delta === null) {
    return 'Без плана'
  }

  return delta < 0 ? 'Ниже плана' : 'В плане'
}

function formatDelta(delta: number | null) {
  return delta === null ? '-' : formatPercent(delta, 2)
}

function formatStatusBadge(fact: MetricValue, statusText: string, delta: number | null) {
  return hasMetricValue(fact) ? `${statusText} ${formatDelta(delta)}` : statusText
}

function getChartValue(value: MetricValue) {
  if (!hasMetricValue(value) || value === 0) {
    return EMPTY_BAR_VALUE
  }

  return value
}

function getNumberProp(record: Record<string, unknown>, key: string) {
  const value = record[key]

  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)

    return Number.isNaN(parsedValue) ? null : parsedValue
  }

  return null
}

function createBarValueLabel(activeColor: string) {
  return function BarValueLabel(props: unknown) {
    if (typeof props !== 'object' || props === null) {
      return null
    }

    const record = props as Record<string, unknown>
    const x = getNumberProp(record, 'x')
    const y = getNumberProp(record, 'y')
    const width = getNumberProp(record, 'width')
    const height = getNumberProp(record, 'height')
    const value = getNumberProp(record, 'value')

    if (x === null || y === null || width === null || height === null) {
      return null
    }

    return (
      <text
        x={x + width / 2}
        y={y + height + 20}
        fill={value !== null && value > 0 ? activeColor : NEUTRAL_VALUE_COLOR}
        fontSize={14}
        fontWeight={700}
        textAnchor="middle"
      >
        {value === null ? '-' : formatDetailNumber(value)}
      </text>
    )
  }
}

const renderPlanValueLabel = createBarValueLabel(PLAN_COLOR)
const renderFactValueLabel = createBarValueLabel(FACT_COLOR)

export function ProductionMetricDetail({ detail }: ProductionMetricDetailProps) {
  const totalFact = detail.summaries.reduce((sum, unit) => sum + (unit.fact ?? 0), 0)
  const totalPlan = detail.summaries.reduce((sum, unit) => sum + unit.plan, 0)
  const totalDelta = getDelta(totalFact, totalPlan)
  const totalTone = getMetricTone(totalFact, totalDelta)
  const totalFactTone = getValueTone(totalFact)
  const totalPlanTone = getValueTone(totalPlan)
  const totalDeltaTone = getDeltaValueTone(totalDelta)
  const problemUnitsCount = detail.summaries.filter((unit) => {
    const delta = getDelta(unit.fact, unit.plan)

    return delta !== null && delta < 0
  }).length
  const missingFactUnitsCount = detail.summaries.filter((unit) => !hasMetricValue(unit.fact)).length

  return (
    <section className={styles.detail} aria-labelledby="metric-detail-title">
      <div
        className={classNames(styles.totalPanel, {
          [styles.totalPanelDanger]: totalTone === 'danger',
          [styles.totalPanelSuccess]: totalTone === 'success'
        })}
      >
        <div className={styles.totalHeader}>
          <div>
            <h1 id="metric-detail-title" className={styles.title}>
              <span>
                {detail.metricTitle}, {detail.unit}
              </span>{' '}
              <span className={styles.titleNote}>(Итого по выбранным БЕ)</span>
            </h1>
          </div>
          <div className={styles.legend} aria-hidden="true">
            <span className={styles.planLegend}>План</span>
            <span className={styles.factLegend}>Факт</span>
          </div>
        </div>
        <dl className={styles.totalStats}>
          <div className={styles.totalStatsRow}>
            <div className={styles.totalStat}>
              <dt>План</dt>
              <dd
                className={classNames({
                  [styles.valuePlan]: totalPlanTone === 'active',
                  [styles.valueNeutral]: totalPlanTone === 'neutral'
                })}
              >
                {formatDetailNumber(totalPlan)}
              </dd>
            </div>
            <div className={classNames(styles.totalStat, styles.totalFactStat)}>
              <dt>Факт</dt>
              <dd
                className={classNames(styles.totalValue, {
                  [styles.valueFact]: totalFactTone === 'active',
                  [styles.valueNeutral]: totalFactTone === 'neutral'
                })}
              >
                {formatDetailNumber(totalFact)}
              </dd>
            </div>
            <div className={styles.totalStat}>
              <dt>Отклонение</dt>
              <dd
                className={classNames({
                  [styles.deltaDanger]: totalDeltaTone === 'danger',
                  [styles.deltaSuccess]: totalDeltaTone === 'success',
                  [styles.valueNeutral]: totalDeltaTone === 'neutral'
                })}
              >
                {formatDelta(totalDelta)}
              </dd>
            </div>
          </div>
          <div className={styles.totalStatsRow}>
            <div className={styles.totalStat}>
              <dt>Ниже плана</dt>
              <dd>{problemUnitsCount}</dd>
            </div>
            <div className={styles.totalStat}>
              <dt>Без факта</dt>
              <dd>{missingFactUnitsCount}</dd>
            </div>
            <div className={styles.totalStat}></div>
          </div>
        </dl>
      </div>

      <div className={styles.summaryGrid}>
        {detail.summaries.map((unit) => {
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
              key={unit.slug}
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
        })}
      </div>
    </section>
  )
}
