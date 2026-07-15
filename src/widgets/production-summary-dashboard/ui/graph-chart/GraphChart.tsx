'use client'

import { useEffect, useMemo, useState, type WheelEvent } from 'react'
import {
  Bar,
  Brush,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'

import { type GraphPeriod, type GraphPoint } from '@/entities/production-summary'
import { ChartFrame } from '@/shared/ui'

import styles from '../../ProductionSummaryDashboard.module.css'
import {
  formatGraphTick,
  getGraphXAxisTicks,
  getXAxisInterval,
  type GraphChartSize
} from './graph-axis'

const COMPACT_POINT_LIMIT = 10
const COMPACT_POINT_WIDTH = 150
const DEFAULT_BAR_SIZE = 40
const COMPACT_BAR_SIZE = 32
const BRUSH_VISIBLE_POINT_COUNT = 35
const BRUSH_WHEEL_PIXELS_PER_POINT = 80
const BRUSH_WHEEL_MAX_STEP = 8
const CHART_HORIZONTAL_MARGIN = 32
const Y_AXIS_TICK_COUNT = 5
const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-chart-plan)'
const GRID_COLOR = 'var(--palette-dashboard-grid-border)'
const EMPTY_AXIS_COLOR = 'var(--palette-dashboard-grid-border)'
const EMPTY_GRID_LINES = [0.25, 0.5, 0.75]
const BRUSH_TRACK_COLOR = 'var(--color-bg-card)'
const BRUSH_BORDER_COLOR = 'var(--color-chart-brush-track-border)'
const TOOLTIP_BACKGROUND_COLOR = 'var(--color-chart-tooltip-bg)'
const TOOLTIP_BORDER_COLOR = 'var(--color-chart-tooltip-border)'
const TOOLTIP_LABEL_COLOR = 'var(--color-chart-tooltip-label)'

export type GraphSeriesKey = 'plan' | 'fact'
export type GraphSeriesView = 'bar' | 'line'

type BrushRange = {
  startIndex: number
  endIndex: number
}

type BrushState = BrushRange & {
  dataLength: number
  graphPeriod: GraphPeriod
  dataKey: string | undefined
  lastDataDate: string | undefined
}

type AxisTickPayload = {
  value?: string | number
}

type AxisTickProps = {
  x?: number | string
  y?: number | string
  payload?: AxisTickPayload
}

type GraphChartProps = {
  data: GraphPoint[]
  dataKey: string | undefined
  emptyText?: string
  graphPeriod: GraphPeriod
  isUpdating?: boolean
  seriesView: Record<GraphSeriesKey, GraphSeriesView>
  showBrush?: boolean
  size?: GraphChartSize
}

export const GRAPH_SERIES_CONFIGS: Array<{
  key: GraphSeriesKey
  name: string
  color: string
}> = [
  { key: 'plan', name: 'План', color: PLAN_COLOR },
  { key: 'fact', name: 'Факт', color: FACT_COLOR }
]

function formatCompactAxisNumber(value: string | number | undefined) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return value === undefined ? '' : String(value)
  }

  if (Math.abs(numberValue) >= 1_000_000) {
    return `${Number((numberValue / 1_000_000).toFixed(1)).toString()}m`
  }

  if (Math.abs(numberValue) >= 10_000) {
    return `${Number((numberValue / 1_000).toFixed(1)).toString()}k`
  }

  return numberValue.toString()
}

function formatFullAxisNumber(value: string | number | undefined) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return value === undefined ? '' : String(value)
  }

  return numberValue.toString()
}

function YAxisTick({ x = 0, y = 0, payload }: AxisTickProps) {
  const fullValue = formatFullAxisNumber(payload?.value)

  return (
    <text className={styles.graphYAxisTick} dy={4} fill="currentColor" textAnchor="end" x={x} y={y}>
      <title>{fullValue}</title>
      {formatCompactAxisNumber(payload?.value)}
    </text>
  )
}

function getCompactXAxisPadding(chartWidth: number, visiblePointCount: number) {
  if (visiblePointCount > COMPACT_POINT_LIMIT) {
    return 0
  }

  const compactWidth = visiblePointCount * COMPACT_POINT_WIDTH
  const availableWidth = Math.max(chartWidth - CHART_HORIZONTAL_MARGIN, 0)

  return Math.max(availableWidth - compactWidth, 0)
}

function getYAxisMax(data: GraphPoint[]) {
  const maxValue = Math.max(...data.flatMap((point) => [point.fact ?? 0, point.plan ?? 0]), 0)

  if (maxValue <= 0) {
    return 1
  }

  const magnitude = 10 ** Math.max(Math.floor(Math.log10(maxValue)) - 1, 0)

  return Math.ceil((maxValue * 1.05) / magnitude) * magnitude
}

function getDefaultBrushRange(dataLength: number): BrushRange | undefined {
  return normalizeBrushRange(
    { startIndex: dataLength - BRUSH_VISIBLE_POINT_COUNT, endIndex: dataLength - 1 },
    dataLength
  )
}

function normalizeBrushRange(
  range: BrushRange | undefined,
  dataLength: number
): BrushRange | undefined {
  if (!range || dataLength === 0) {
    return undefined
  }

  const visiblePointCount = Math.min(BRUSH_VISIBLE_POINT_COUNT, dataLength)
  const maxStartIndex = dataLength - visiblePointCount
  const startIndex = Math.min(Math.max(range.startIndex, 0), maxStartIndex)

  return {
    startIndex,
    endIndex: startIndex + visiblePointCount - 1
  }
}

function createBrushState(
  range: BrushRange | undefined,
  dataLength: number,
  graphPeriod: GraphPeriod,
  dataKey: string | undefined,
  lastDataDate: string | undefined
): BrushState | undefined {
  if (!range) {
    return undefined
  }

  return {
    ...range,
    dataLength,
    graphPeriod,
    dataKey,
    lastDataDate
  }
}

function getWheelPointDelta(event: WheelEvent) {
  const wheelDelta = Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY
  const pointDelta = Math.ceil(Math.abs(wheelDelta) / BRUSH_WHEEL_PIXELS_PER_POINT)

  return Math.sign(wheelDelta) * Math.min(Math.max(pointDelta, 1), BRUSH_WHEEL_MAX_STEP)
}

function getEffectiveBrushRange(
  shouldUseBrush: boolean,
  isBrushRangeActual: boolean,
  brushRange: BrushState | undefined,
  defaultBrushRange: BrushRange | undefined
) {
  if (!shouldUseBrush) {
    return undefined
  }

  return isBrushRangeActual ? brushRange : defaultBrushRange
}

export function GraphChart({
  data,
  dataKey,
  emptyText = 'Нет данных',
  graphPeriod,
  isUpdating = false,
  seriesView,
  showBrush = true,
  size = 'default'
}: GraphChartProps) {
  const [brushRange, setBrushRange] = useState<BrushState | undefined>()
  const shouldUseBrush =
    showBrush && graphPeriod === 'day' && data.length > BRUSH_VISIBLE_POINT_COUNT
  const yAxisMax = useMemo(() => getYAxisMax(data), [data])
  const lastDataDate = data[data.length - 1]?.date
  const defaultBrushRange = useMemo(() => getDefaultBrushRange(data.length), [data.length])
  const isBrushRangeActual =
    brushRange?.dataLength === data.length &&
    brushRange.graphPeriod === graphPeriod &&
    brushRange.dataKey === dataKey &&
    brushRange.lastDataDate === lastDataDate
  const effectiveBrushRange = getEffectiveBrushRange(
    shouldUseBrush,
    isBrushRangeActual,
    brushRange,
    defaultBrushRange
  )

  useEffect(() => {
    if (!shouldUseBrush) {
      setBrushRange(undefined)

      return
    }

    if (!defaultBrushRange || isBrushRangeActual) {
      return
    }

    setBrushRange(
      createBrushState(defaultBrushRange, data.length, graphPeriod, dataKey, lastDataDate)
    )
  }, [
    data.length,
    dataKey,
    defaultBrushRange,
    graphPeriod,
    isBrushRangeActual,
    lastDataDate,
    shouldUseBrush
  ])

  const renderSeries = (view: GraphSeriesView, barSize: number | undefined) =>
    GRAPH_SERIES_CONFIGS.filter((series) => seriesView[series.key] === view).map((series) => {
      if (view === 'line') {
        return (
          <Line
            key={series.key}
            dataKey={series.key}
            name={series.name}
            stroke={series.color}
            strokeWidth={2}
            dot={{ r: 2 }}
            activeDot={{ r: 4 }}
            type="monotone"
            connectNulls
            isAnimationActive={false}
          />
        )
      }

      return (
        <Bar
          key={series.key}
          dataKey={series.key}
          name={series.name}
          fill={series.color}
          radius={[3, 3, 0, 0]}
          barSize={barSize}
          isAnimationActive={false}
        />
      )
    })

  const handleBrushChange = (range: { startIndex?: number; endIndex?: number }) => {
    if (typeof range.startIndex !== 'number' || typeof range.endIndex !== 'number') {
      return
    }

    const nextRange = normalizeBrushRange(
      {
        startIndex: range.startIndex,
        endIndex: range.endIndex
      },
      data.length
    )

    setBrushRange(createBrushState(nextRange, data.length, graphPeriod, dataKey, lastDataDate))
  }

  const handleChartWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!shouldUseBrush || !event.shiftKey || !effectiveBrushRange) {
      return
    }

    event.preventDefault()

    const pointDelta = getWheelPointDelta(event)
    const nextRange = normalizeBrushRange(
      {
        startIndex: effectiveBrushRange.startIndex + pointDelta,
        endIndex: effectiveBrushRange.endIndex + pointDelta
      },
      data.length
    )

    setBrushRange(createBrushState(nextRange, data.length, graphPeriod, dataKey, lastDataDate))
  }

  const isCompactRange = data.length <= COMPACT_POINT_LIMIT
  const barSize = size === 'compact' && isCompactRange ? COMPACT_BAR_SIZE : DEFAULT_BAR_SIZE
  const visiblePointCount = shouldUseBrush ? BRUSH_VISIBLE_POINT_COUNT : data.length
  const chartClassName = size === 'compact' ? styles.compactChartBox : styles.chartBox

  if (data.length === 0) {
    return (
      <div className={styles.graphWheelArea}>
        <ChartFrame className={chartClassName}>
          {({ width, height }) => (
            <ComposedChart
              data={[{ date: '', value: null }]}
              height={height}
              margin={{ top: 8, right: 16, bottom: 0, left: -16 }}
              width={width}
            >
              {EMPTY_GRID_LINES.map((lineValue) => (
                <ReferenceLine
                  key={lineValue}
                  y={lineValue}
                  stroke={EMPTY_AXIS_COLOR}
                  strokeOpacity={0.55}
                  ifOverflow="extendDomain"
                />
              ))}
              <XAxis
                dataKey="date"
                axisLine={{ stroke: EMPTY_AXIS_COLOR, strokeOpacity: 0.8 }}
                tick={false}
                tickLine={false}
                padding={{ left: 0, right: 0 }}
              />
              <YAxis
                axisLine={{ stroke: EMPTY_AXIS_COLOR, strokeOpacity: 0.8 }}
                domain={[0, 1]}
                tick={false}
                tickLine={false}
              />
            </ComposedChart>
          )}
        </ChartFrame>
        <div className={styles.graphEmptyChartLabel}>{emptyText}</div>
      </div>
    )
  }

  return (
    <div className={styles.graphWheelArea} onWheel={handleChartWheel}>
      <ChartFrame className={chartClassName}>
        {({ width, height }) => {
          const compactXAxisPadding = getCompactXAxisPadding(width, visiblePointCount)
          const visibleXAxisData = effectiveBrushRange
            ? data.slice(effectiveBrushRange.startIndex, effectiveBrushRange.endIndex + 1)
            : data
          const xAxisTicks = getGraphXAxisTicks(
            visibleXAxisData.map((point) => point.date),
            graphPeriod,
            size,
            width
          )
          const tickFormatter = (value: string | number) =>
            formatGraphTick(String(value), graphPeriod, size)

          return (
            <ComposedChart
              barGap={0}
              data={data}
              height={height}
              margin={{ top: 8, right: 16, bottom: shouldUseBrush ? 8 : 0, left: -16 }}
              width={width}
            >
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                ticks={xAxisTicks}
                interval={getXAxisInterval(graphPeriod, size)}
                tickFormatter={tickFormatter}
                padding={{ left: 0, right: compactXAxisPadding }}
              />
              <YAxis
                domain={[0, yAxisMax]}
                tickCount={Y_AXIS_TICK_COUNT}
                tickLine={false}
                axisLine={false}
                tick={YAxisTick}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: TOOLTIP_BACKGROUND_COLOR,
                  borderColor: TOOLTIP_BORDER_COLOR,
                  borderRadius: 'var(--radius-5)',
                  boxShadow: 'var(--color-shadow-card)'
                }}
                isAnimationActive={false}
                labelFormatter={(label) => formatGraphTick(String(label), graphPeriod, size)}
                labelStyle={{ color: TOOLTIP_LABEL_COLOR }}
              />
              {renderSeries('bar', barSize)}
              {renderSeries('line', barSize)}
              {shouldUseBrush ? (
                <Brush
                  key={dataKey}
                  dataKey="date"
                  endIndex={effectiveBrushRange?.endIndex}
                  fill={BRUSH_TRACK_COLOR}
                  height={16}
                  className={styles.graphBrush}
                  onChange={handleBrushChange}
                  startIndex={effectiveBrushRange?.startIndex}
                  stroke={BRUSH_BORDER_COLOR}
                  tickFormatter={tickFormatter}
                  travellerWidth={0}
                />
              ) : null}
            </ComposedChart>
          )
        }}
      </ChartFrame>
      {isUpdating ? <div className={styles.graphUpdatingOverlay}>Обновление...</div> : null}
    </div>
  )
}
