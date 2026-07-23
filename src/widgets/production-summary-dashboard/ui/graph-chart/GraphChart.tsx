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
  YAxis,
  type TooltipContentProps
} from 'recharts'

import { type GraphPeriod, type GraphPoint } from '@/entities/production-summary'
import { ChartFrame, Loader } from '@/shared/ui'
import { formatNumber } from '@/shared/utils/formatNumber'

import styles from '../../ProductionSummaryDashboard.module.css'
import {
  formatGraphTick,
  getGraphXAxisTicks,
  getXAxisInterval,
  type GraphChartSize
} from './graph-axis'
import {
  createGraphYAxisScale,
  type GraphYAxisDataPoint,
  type GraphYAxisValueRange
} from './graph-y-axis'

const COMPACT_POINT_LIMIT = 10
const COMPACT_POINT_WIDTH = 150
const DEFAULT_BAR_SIZE = 40
const COMPACT_BAR_SIZE = 32
const BRUSH_VISIBLE_POINT_COUNT = 35
const BRUSH_WHEEL_PIXELS_PER_POINT = 80
const BRUSH_WHEEL_MAX_STEP = 8
const CHART_HORIZONTAL_MARGIN = 32
const Y_AXIS_TICK_COUNT = 5
const COMPACT_Y_AXIS_TICK_COUNT = 3
const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-chart-plan)'
const GRID_COLOR = 'var(--palette-dashboard-grid-border)'
const EMPTY_AXIS_COLOR = 'var(--palette-dashboard-grid-border)'
const EMPTY_GRID_LINES = [0.25, 0.5, 0.75]
const BRUSH_TRACK_COLOR = 'var(--color-bg-card)'
const BRUSH_BORDER_COLOR = 'var(--color-chart-brush-track-border)'
const GRAPH_DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/

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
  tickFormatter?: (value: string | number | undefined) => string
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
  normalizeValueRange?: boolean
  normalizedValueRange?: GraphYAxisValueRange
  updatingText?: string
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

  if (Math.abs(numberValue) >= 1_000) {
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

function formatTooltipNumber(value: unknown) {
  const numberValue = Number(value)

  if (!Number.isFinite(numberValue)) {
    return value === null || value === undefined ? '-' : String(value)
  }

  return formatNumber(numberValue)
}

function formatTooltipDate(value: string) {
  const match = value.match(GRAPH_DATE_REGEXP)

  if (!match) {
    return value
  }

  return `${match[3]}.${match[2]}.${match[1]}`
}

function GraphTooltip({ active, label, payload }: TooltipContentProps) {
  if (!active || !payload?.length) {
    return null
  }

  const point = payload[0]?.payload as Partial<Record<GraphSeriesKey, unknown>> | undefined
  const items = GRAPH_SERIES_CONFIGS.map((series) => ({
    ...series,
    value: point?.[series.key]
  })).filter((item) => item.value !== null && item.value !== undefined)

  return (
    <div className={styles.graphTooltip}>
      <div className={styles.graphTooltipDate}>{formatTooltipDate(String(label))}</div>
      <div className={styles.graphTooltipItems}>
        {items.map((item) => {
          const isFact = item.key === 'fact'

          return (
            <div key={item.key} className={styles.graphTooltipItem} style={{ color: item.color }}>
              <span>{item.name}</span>
              <span> : </span>
              <span className={isFact ? styles.graphTooltipFactValue : undefined}>
                {formatTooltipNumber(item.value)}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function YAxisTick({ tickFormatter, x = 0, y = 0, payload }: AxisTickProps) {
  const formattedValue = tickFormatter ? tickFormatter(payload?.value) : payload?.value
  const fullValue = formatFullAxisNumber(formattedValue)

  return (
    <text className={styles.graphYAxisTick} dy={4} fill="currentColor" textAnchor="end" x={x} y={y}>
      <title>{fullValue}</title>
      {formatCompactAxisNumber(formattedValue)}
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

function getCompactYAxisTicks(ticks: number[] | undefined) {
  if (!ticks || ticks.length <= COMPACT_Y_AXIS_TICK_COUNT) {
    return ticks
  }

  return [ticks[0], ticks[Math.floor(ticks.length / 2)], ticks[ticks.length - 1]]
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
  normalizeValueRange = false,
  normalizedValueRange,
  updatingText = 'Обновление...',
  seriesView,
  showBrush = true,
  size = 'default'
}: GraphChartProps) {
  const [brushRange, setBrushRange] = useState<BrushState | undefined>()
  const shouldUseBrush =
    showBrush && graphPeriod === 'day' && data.length > BRUSH_VISIBLE_POINT_COUNT
  const yAxisScale = useMemo(
    () =>
      createGraphYAxisScale({
        data,
        normalizeValueRange,
        seriesView,
        valueRange: normalizedValueRange
      }),
    [data, normalizeValueRange, normalizedValueRange, seriesView]
  )
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
      const chartDataKey = `${series.key}ChartValue` satisfies keyof GraphYAxisDataPoint

      if (view === 'line') {
        return (
          <Line
            key={series.key}
            dataKey={chartDataKey}
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
          dataKey={chartDataKey}
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
        {isUpdating ? (
          <div className={styles.graphUpdatingOverlay}>
            <span>{updatingText}</span>
            <Loader size="small" />
          </div>
        ) : null}
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
          const yAxisTicks =
            size === 'compact' ? getCompactYAxisTicks(yAxisScale.ticks) : yAxisScale.ticks
          const yAxisTickCount = size === 'compact' ? COMPACT_Y_AXIS_TICK_COUNT : Y_AXIS_TICK_COUNT

          return (
            <ComposedChart
              barGap={0}
              data={yAxisScale.data}
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
                domain={yAxisScale.domain}
                tickCount={yAxisTickCount}
                tickLine={false}
                axisLine={false}
                tickFormatter={yAxisScale.formatTick}
                ticks={yAxisTicks}
                interval={yAxisTicks ? 0 : undefined}
                tick={(props) => <YAxisTick {...props} tickFormatter={yAxisScale.formatTick} />}
              />
              <Tooltip content={(props) => <GraphTooltip {...props} />} isAnimationActive={false} />
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
      {isUpdating ? (
        <div className={styles.graphUpdatingOverlay}>
          <span>{updatingText}</span>
          <Loader size="small" />
        </div>
      ) : null}
    </div>
  )
}
