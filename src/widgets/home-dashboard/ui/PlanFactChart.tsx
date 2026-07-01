'use client'

import classNames from 'classnames'
import { useEffect, useState } from 'react'
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { type HomeDashboardTrend } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type PlanFactChartProps = {
  trend: HomeDashboardTrend
}

const TREND_TOOLTIP_LABELS = {
  fact: 'Факт',
  plan: 'План'
} satisfies Record<'fact' | 'plan', string>

export function PlanFactChart({ trend }: PlanFactChartProps) {
  const [isChartReady, setIsChartReady] = useState(false)

  useEffect(() => {
    setIsChartReady(true)
  }, [])

  return (
    <section className={styles.panel} aria-label="План-факт производства">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>План-факт</span>
          <h2>{getActiveMetricLabel(trend)}</h2>
        </div>
        <strong className={classNames(styles.trendBadge, styles[`status-${trend.status}`])}>
          {trend.deltaTotal} {trend.unit}
        </strong>
      </div>
      <div className={styles.trendChart}>
        {isChartReady ? (
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={trend.points} margin={{ top: 8, right: 16, bottom: 8, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} />
              <YAxis tickLine={false} axisLine={false} width={44} />
              <Tooltip
                formatter={(value, name) => [
                  `${value ?? '--'} ${trend.unit}`,
                  getTrendTooltipLabel(name)
                ]}
                labelFormatter={(label) => `Время: ${label}`}
              />
              <Line
                type="monotone"
                dataKey="plan"
                name="plan"
                stroke="var(--color-kpi-plan)"
                strokeWidth={2}
                dot
              />
              <Line
                type="monotone"
                dataKey="fact"
                name="fact"
                stroke="var(--color-kpi-fact)"
                strokeWidth={3}
                dot
              />
            </LineChart>
          </ResponsiveContainer>
        ) : null}
      </div>
      <p>
        Факт: {trend.factTotal} {trend.unit} · План: {trend.planTotal} {trend.unit}
      </p>
    </section>
  )
}

function getActiveMetricLabel(trend: HomeDashboardTrend): string {
  return trend.tabs.find((tab) => tab.id === trend.activeMetric)?.label ?? 'Показатель'
}

function getTrendTooltipLabel(name: unknown): string {
  return name === 'fact' || name === 'plan' ? TREND_TOOLTIP_LABELS[name] : String(name)
}
