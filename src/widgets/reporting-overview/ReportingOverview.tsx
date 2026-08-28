'use client'

import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { useMemo, useState } from 'react'
import { Tag } from 'antd'
import {
  Bar,
  BarChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type PieLabelRenderProps
} from 'recharts'

import {
  reportingAssetMockOptions,
  reportingMetricMockOptions,
  reportingMockData,
  type ReportingAssetKey,
  type ReportingDataset,
  type ReportingMetricKey
} from '@/entities/reporting'
import { ComparisonArrowLine } from '@/shared/ui'
import { formatNumber } from '@/shared/utils'

import styles from './ReportingOverview.module.css'

const ASSET_PARAM = 'asset'
const DEFAULT_ASSET_KEY: ReportingAssetKey = 'group'
const MONTHLY_CHART_HEIGHT = 118
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
  const dataset = getDataset(assetKey)
  const assetLabel =
    reportingAssetMockOptions.find((asset) => asset.key === dataset.assetKey)?.label ?? ''
  const [activeMetricKey, setActiveMetricKey] = useState<ReportingMetricKey>(
    reportingMetricMockOptions[0].key
  )
  const overview = useMemo(
    () =>
      dataset.overviews.find((item) => item.metricKey === activeMetricKey) ?? dataset.overviews[0],
    [activeMetricKey, dataset.overviews]
  )
  const donutData = useMemo(
    () =>
      overview.breakdown.map((entry, index) => ({
        ...entry,
        fill: index === 0 ? chartColors.fact : `rgba(250, 181, 41, ${0.18 + index * 0.1})`
      })),
    [overview.breakdown]
  )

  return (
    <section className={styles.section}>
      <div className={styles.mapPanel}>
        <Image
          alt=""
          className={styles.mapImage}
          fill
          priority
          src="/reporting/russia-map.png"
          sizes="49vw"
        />
      </div>
      <aside className={styles.analyticsPanel}>
        <div className={styles.analyticsMain}>
          <h2 className={styles.assetTitle}>{assetLabel}</h2>
          <div className={styles.metricTabs}>
            {reportingMetricMockOptions.map((metric) => (
              <CheckableTag
                checked={metric.key === overview.metricKey}
                className={styles.metricTag}
                key={metric.key}
                onChange={() => setActiveMetricKey(metric.key)}
              >
                {metric.label.toUpperCase()}
              </CheckableTag>
            ))}
          </div>
          <div className={styles.kpiBlock}>
            <ComparisonArrowLine className={styles.comparisonLine} deltas={overview.deltas} />
            <div className={styles.kpiRow}>
              {overview.kpis.map((kpi, index) => (
                <div className={styles.kpiItem} key={`${kpi.label}-${index}`}>
                  <span className={styles.kpiValue}>
                    {formatNumber(kpi.value, { fractionDigits: 2 })}
                  </span>
                  <span className={styles.kpiLabel}>{kpi.label}</span>
                  <span className={styles.kpiCaption}>{formatMonthCaption(kpi.caption)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className={styles.donutChart}>
          <ResponsiveContainer height={136} width="100%">
            <PieChart margin={{ top: 8, right: 12, bottom: 8, left: 12 }}>
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
            </PieChart>
          </ResponsiveContainer>
          <div className={styles.donutValue}>
            {formatNumber(overview.donutValue, { fractionDigits: 1 })}
            {overview.donutUnit}
          </div>
        </div>
        <div className={styles.monthlyChart}>
          <ResponsiveContainer height={MONTHLY_CHART_HEIGHT} width="100%">
            <BarChart barGap={MONTHLY_BAR_GAP} barSize={MONTHLY_BAR_SIZE} data={overview.monthly}>
              <XAxis
                dataKey="month"
                interval={0}
                tickLine={false}
                tick={{ fill: 'var(--color-text-muted)', fontSize: 9, fontWeight: 600 }}
              />
              <YAxis hide domain={[0, `dataMax + ${MONTHLY_Y_AXIS_HEADROOM}`]} />
              <Bar dataKey="forecast" fill={chartColors.forecast} isAnimationActive={false} />
              <Bar dataKey="plan" fill={chartColors.plan} isAnimationActive={false} />
              <Bar dataKey="fact" fill={chartColors.fact} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
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
