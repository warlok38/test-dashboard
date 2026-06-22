import { Bar, CartesianGrid, ComposedChart, Line, LineChart, Tooltip, XAxis, YAxis } from 'recharts'

import { type MiningStageMetric } from '@/entities/production-stage'

import { formatMetricNumber, getVisibleTickIndexes } from '../lib'

const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-kpi-plan)'

type TrendChartProps = {
  height?: number
  metric: MiningStageMetric
  width?: number
}

export function TrendChart({ height = 0, metric, width = 0 }: TrendChartProps) {
  const visibleTickIndexes = getVisibleTickIndexes(metric.data.length, width)
  const tooltipFormatter = (value: unknown, name: unknown) => [
    formatMetricNumber(Number(value)),
    name === 'fact' ? 'Факт' : 'План'
  ]
  const tickFormatter = (value: unknown, index: number) =>
    visibleTickIndexes.has(index) ? String(value) : ''

  if (metric.kind === 'line') {
    return (
      <LineChart
        data={metric.data}
        height={height}
        margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
        width={width}
      >
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
    <ComposedChart
      data={metric.data}
      height={height}
      margin={{ top: 16, right: 12, left: 0, bottom: 0 }}
      width={width}
    >
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
