'use client'

import { useSearchParams } from 'next/navigation'
import { useMemo, useState } from 'react'
import { Tag } from 'antd'
import { Bar, BarChart, Pie, PieChart, XAxis, YAxis, type PieLabelRenderProps } from 'recharts'

import {
  reportingAssetMockOptions,
  getReportingStage,
  reportingMockData,
  type ReportingAssetKey,
  type ReportingDataset,
  type ReportingMetricKey
} from '@/entities/reporting'
import { ChartFrame, ComparisonArrowLine } from '@/shared/ui'
import { formatNumber } from '@/shared/utils'

import { ReportingMap } from './ui/ReportingMap'
import styles from './ReportingOverview.module.css'

const ASSET_PARAM = 'asset'
const STAGE_PARAM = 'stage'
const DEFAULT_ASSET_KEY: ReportingAssetKey = 'group'
const MONTHLY_BAR_SIZE = 12
const MONTHLY_BAR_GAP = 2
const MONTHLY_Y_AXIS_HEADROOM = 0.35
const { CheckableTag } = Tag
const chartColors = {
  fact: 'var(--color-kpi-fact)',
  plan: 'var(--color-chart-plan)',
  forecast: '#c9d5e4'
}

function getDataset(assetKey: string | null): ReportingDataset {
  return (
    reportingMockData.find((dataset) => dataset.assetKey === assetKey) ??
    reportingMockData.find((dataset) => dataset.assetKey === DEFAULT_ASSET_KEY) ??
    reportingMockData[0]
  )
}

export function ReportingOverview() {
  const searchParams = useSearchParams()
  const assetKey = searchParams.get(ASSET_PARAM)
  const stage = getReportingStage(searchParams.get(STAGE_PARAM))
  const dataset = getDataset(assetKey)
  const assetLabel =
    reportingAssetMockOptions.find((asset) => asset.key === dataset.assetKey)?.label ?? ''
  const [activeMetricKey, setActiveMetricKey] = useState<ReportingMetricKey>(stage.metrics[0].key)
  const activeMetricKeyForStage = stage.metrics.some((metric) => metric.key === activeMetricKey)
    ? activeMetricKey
    : stage.metrics[0].key
  const overview = useMemo(
    () =>
      dataset.overviews.find((item) => item.metricKey === activeMetricKeyForStage) ??
      dataset.overviews[0],
    [activeMetricKeyForStage, dataset.overviews]
  )
  const donutData = useMemo(
    () =>
      overview.breakdown
        .filter((entry) => entry.value !== null)
        .map((entry, index) => ({
          ...entry,
          value: entry.value,
          fill: index === 0 ? chartColors.fact : `rgba(250, 181, 41, ${0.18 + index * 0.1})`
        })),
    [overview.breakdown]
  )
  const monthlyData = useMemo(
    () =>
      overview.monthly.some(
        (point) => point.fact !== null || point.plan !== null || point.forecast !== null
      )
        ? overview.monthly
        : [],
    [overview.monthly]
  )
  const hasDonutData = donutData.length > 0
  const hasMonthlyData = monthlyData.length > 0

  return (
    <section className={styles.section}>
      <ReportingMap activeAssetKey={dataset.assetKey} />
      <aside className={styles.analyticsPanel}>
        <h3 className={styles.assetTitle}>
          {assetLabel}
          <span className={styles.titleSeparator}>•</span>
          <span>{stage.label}</span>
        </h3>
        <div className={styles.analyticsMain}>
          <div className={styles.metricTabs}>
            {stage.metrics.map((metric) => (
              <CheckableTag
                checked={metric.key === activeMetricKeyForStage}
                className={styles.metricTag}
                key={metric.key}
                onChange={() => setActiveMetricKey(metric.key)}
              >
                <span className={styles.metricLabel}>{metric.label.toUpperCase()}</span>
                {metric.uom ? <span className={styles.metricUom}>, {metric.uom}</span> : null}
              </CheckableTag>
            ))}
          </div>
          <div className={styles.kpiBlock}>
            {overview.deltas.length > 0 ? (
              <ComparisonArrowLine className={styles.comparisonLine} deltas={overview.deltas} />
            ) : null}
            <div className={styles.kpiRow}>
              {overview.kpis.map((kpi, index) => (
                <div className={styles.kpiItem} key={`${kpi.label}-${index}`}>
                  <span className={styles.kpiValue}>
                    {kpi.value === null ? '-' : formatNumber(kpi.value, { fractionDigits: 2 })}
                  </span>
                  <span className={styles.kpiLabel}>{kpi.label}</span>
                  <span className={styles.kpiCaption}>{formatMonthCaption(kpi.caption)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.donutChart}>
          <ChartFrame className={styles.donutChartFrame}>
            {({ width, height }) => (
              <PieChart
                height={height}
                margin={{ top: 8, right: 12, bottom: 8, left: 12 }}
                width={width}
              >
                {hasDonutData ? (
                  <Pie
                    data={donutData}
                    dataKey="value"
                    innerRadius={40}
                    isAnimationActive={false}
                    label={renderDonutLabel}
                    labelLine={false}
                    nameKey="name"
                    outerRadius={64}
                    paddingAngle={1}
                    stroke="none"
                  />
                ) : null}
              </PieChart>
            )}
          </ChartFrame>
          <div className={styles.donutValue}>
            {overview.donutValue === null
              ? '-'
              : `${formatNumber(overview.donutValue, { fractionDigits: 1 })}${overview.donutUnit}`}
          </div>
        </div>
        <div className={styles.monthlyChart}>
          <ChartFrame className={styles.monthlyChartFrame}>
            {({ width, height }) => (
              <BarChart
                barGap={MONTHLY_BAR_GAP}
                barSize={MONTHLY_BAR_SIZE}
                data={hasMonthlyData ? monthlyData : overview.monthly}
                height={height}
                width={width}
              >
                <XAxis
                  dataKey="month"
                  interval={0}
                  tickLine={false}
                  tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 600 }}
                />
                <YAxis hide domain={[0, `dataMax + ${MONTHLY_Y_AXIS_HEADROOM}`]} />
                {hasMonthlyData ? (
                  <>
                    <Bar dataKey="forecast" fill={chartColors.forecast} isAnimationActive={false} />
                    <Bar dataKey="plan" fill={chartColors.plan} isAnimationActive={false} />
                    <Bar dataKey="fact" fill={chartColors.fact} isAnimationActive={false} />
                  </>
                ) : null}
              </BarChart>
            )}
          </ChartFrame>
        </div>
      </aside>
    </section>
  )
}

function formatMonthCaption(caption: string) {
  return caption.replace('Авг', 'АВГ.')
}

function renderDonutLabel({ name, textAnchor, x, y }: PieLabelRenderProps) {
  return (
    <text className={styles.donutLabel} textAnchor={textAnchor} x={x} y={y}>
      {name}
    </text>
  )
}
