import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ReferenceArea,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { type HomeDashboardTrendPoint } from '@/entities/production-stage'

import styles from '../HomeDashboard.module.css'

type PlanFactTrendProps = {
  data: HomeDashboardTrendPoint[]
}

export function PlanFactTrend({ data }: PlanFactTrendProps) {
  const lastPoint = data[data.length - 1]
  const hasGap = lastPoint !== undefined && lastPoint.fact < lastPoint.plan
  const referenceStart = data[Math.max(data.length - 3, 0)]?.label

  return (
    <section className={styles.panel} aria-labelledby="trend-title">
      <div className={styles.panelHeader}>
        <div>
          <span className={styles.panelEyebrow}>Динамика</span>
          <h2 id="trend-title">План-факт накопительно</h2>
        </div>
        {lastPoint && (
          <span className={styles.trendBadge}>{hasGap ? 'Отставание' : 'По плану'}</span>
        )}
      </div>
      <div className={styles.trendChart} aria-hidden="true">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 12, right: 12, bottom: 0, left: -12 }}>
            <CartesianGrid stroke="var(--palette-dashboard-grid-border)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11 }} width={48} />
            <Tooltip />
            <Legend verticalAlign="top" height={28} />
            {hasGap && (
              <ReferenceArea
                x1={referenceStart}
                x2={lastPoint.label}
                fill="var(--palette-status-danger-bg)"
              />
            )}
            <Line
              type="monotone"
              dataKey="plan"
              name="План"
              stroke="var(--color-kpi-plan)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="fact"
              name="Факт"
              stroke="var(--color-kpi-fact)"
              strokeWidth={3}
              dot={{ r: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </section>
  )
}
