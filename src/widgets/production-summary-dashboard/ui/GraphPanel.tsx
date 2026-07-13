'use client'

import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { Segmented, Skeleton } from 'antd'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useEffect, useMemo, useState, type ReactNode, type WheelEvent } from 'react'
import { Bar, Brush, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from 'recharts'

import {
  type GraphPeriod,
  type GraphPoint,
  type GraphQuery,
  useGetGraphQuery
} from '@/entities/production-summary'
import { ApiErrorAlert, ChartFrame } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'

const GRAPH_DATE_FORMAT = 'YYYY-MM-DD'
const MAX_X_AXIS_TICKS = 8
const COMPACT_POINT_LIMIT = 10
const COMPACT_POINT_WIDTH = 150
const COMPACT_BAR_SIZE = 32
const BRUSH_VISIBLE_POINT_COUNT = 35
const BRUSH_WHEEL_PIXELS_PER_POINT = 80
const BRUSH_WHEEL_MAX_STEP = 8
const GRAPH_LOADING_OVERLAY_DELAY_MS = 400
const CHART_HORIZONTAL_MARGIN = 32
const Y_AXIS_TICK_COUNT = 5
const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-chart-plan)'
const GRID_COLOR = 'var(--palette-dashboard-grid-border)'
const BRUSH_TRACK_COLOR = 'var(--color-bg-card)'
const BRUSH_BORDER_COLOR = 'var(--color-chart-brush-track-border)'
type GraphSeriesKey = 'plan' | 'fact'
type GraphSeriesView = 'bar' | 'line'
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

const DEFAULT_GRAPH_PERIOD: GraphPeriod = 'day'
const GRAPH_PERIOD_OPTIONS: Array<{ label: string; value: GraphPeriod }> = [
  { label: 'Дни', value: 'day' },
  { label: 'Месяцы', value: 'month' },
  { label: 'Годы', value: 'year' }
]
const SERIES_CONFIGS: Array<{
  key: GraphSeriesKey
  name: string
  color: string
}> = [
  { key: 'plan', name: 'План', color: PLAN_COLOR },
  { key: 'fact', name: 'Факт', color: FACT_COLOR }
]
const EMPTY_GRAPH_DATA: GraphPoint[] = []
const MONTH_LABELS = [
  'янв',
  'фев',
  'мар',
  'апр',
  'май',
  'июн',
  'июл',
  'авг',
  'сен',
  'окт',
  'ноя',
  'дек'
]
const MONTH_FULL_LABELS = [
  'январь',
  'февраль',
  'март',
  'апрель',
  'май',
  'июнь',
  'июль',
  'август',
  'сентябрь',
  'октябрь',
  'ноябрь',
  'декабрь'
]

const SERIES_VIEW_OPTIONS: Array<{ label: ReactNode; value: GraphSeriesView }> = [
  {
    label: (
      <span
        aria-label="Столбики"
        className={styles.seriesViewIconLabel}
        role="img"
        title="Столбики"
      >
        <BarChartOutlined className={styles.seriesViewIcon} />
      </span>
    ),
    value: 'bar'
  },
  {
    label: (
      <span aria-label="Линия" className={styles.seriesViewIconLabel} role="img" title="Линия">
        <LineChartOutlined className={styles.seriesViewIcon} />
      </span>
    ),
    value: 'line'
  }
]

dayjs.extend(customParseFormat)

type GraphPanelQuery = Pick<GraphQuery, 'indicator' | 'gtk' | 'date_from' | 'date_to'>

type GraphPanelProps = {
  query: GraphPanelQuery | undefined
}
type LastSuccessfulGraphData = {
  data: GraphPoint[]
  dataKey: string | undefined
}

function parseGraphDate(value: string | undefined) {
  if (!value) {
    return null
  }

  const date = dayjs(value, GRAPH_DATE_FORMAT, true)

  return date.isValid() ? date : null
}

function formatGraphTick(value: string, period: GraphPeriod) {
  const date = parseGraphDate(value)

  if (!date) {
    return value
  }

  if (period === 'year') {
    return date.format('YYYY')
  }

  if (period === 'month') {
    return MONTH_FULL_LABELS[date.month()]
  }

  return `${date.format('DD')} ${MONTH_LABELS[date.month()]}`
}

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

function getXAxisTicks(data: GraphPoint[], visibleRange?: BrushRange) {
  const tickData = visibleRange
    ? data.slice(visibleRange.startIndex, visibleRange.endIndex + 1)
    : data

  if (tickData.length <= MAX_X_AXIS_TICKS) {
    return tickData.map((point) => point.date)
  }

  const step = Math.ceil((tickData.length - 1) / (MAX_X_AXIS_TICKS - 1))
  const ticks = tickData.filter((_point, index) => index % step === 0).map((point) => point.date)
  const lastDate = tickData[tickData.length - 1].date

  return ticks.includes(lastDate) ? ticks : [...ticks, lastDate]
}

function getCompactXAxisPadding(chartWidth: number, visiblePointCount: number) {
  if (visiblePointCount > COMPACT_POINT_LIMIT) {
    return 0
  }

  const compactWidth = visiblePointCount * COMPACT_POINT_WIDTH
  const availableWidth = Math.max(chartWidth - CHART_HORIZONTAL_MARGIN, 0)

  return Math.max(availableWidth - compactWidth, 0)
}

function getGraphQuery(query: GraphPanelQuery | undefined, period: GraphPeriod) {
  if (!query) {
    return undefined
  }

  const shouldUseGlobalRange =
    query.date_from !== undefined &&
    query.date_to !== undefined &&
    query.date_from !== query.date_to

  return {
    indicator: query.indicator,
    period,
    ...(query.gtk ? { gtk: query.gtk } : {}),
    ...(shouldUseGlobalRange
      ? {
          date_from: query.date_from,
          date_to: query.date_to
        }
      : {})
  } satisfies GraphQuery
}

function getGraphDataKey(query: GraphQuery | undefined) {
  if (!query) {
    return undefined
  }

  return [
    query.gtk ?? '',
    query.indicator,
    query.period ?? '',
    query.date_from ?? '',
    query.date_to ?? ''
  ].join(':')
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

function normalizeBrushRange(range: BrushRange, dataLength: number): BrushRange | undefined {
  if (dataLength === 0) {
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

function useDelayedFlag(isActive: boolean, delayMs: number) {
  const [isDelayedActive, setIsDelayedActive] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setIsDelayedActive(false)

      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsDelayedActive(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [delayMs, isActive])

  return isDelayedActive
}

export function GraphPanel({ query }: GraphPanelProps) {
  const [graphPeriod, setGraphPeriod] = useState<GraphPeriod>(DEFAULT_GRAPH_PERIOD)
  const [seriesView, setSeriesView] = useState<Record<GraphSeriesKey, GraphSeriesView>>({
    plan: 'bar',
    fact: 'bar'
  })
  const [brushRange, setBrushRange] = useState<BrushState | undefined>()
  const graphQuery = useMemo(() => getGraphQuery(query, graphPeriod), [graphPeriod, query])
  const graphDataKey = useMemo(() => getGraphDataKey(graphQuery), [graphQuery])
  const { currentData, error, isFetching, isLoading } = useGetGraphQuery(graphQuery as GraphQuery, {
    skip: !graphQuery
  })
  const [lastSuccessfulData, setLastSuccessfulData] = useState<
    LastSuccessfulGraphData | undefined
  >()
  const data = currentData ?? lastSuccessfulData?.data ?? EMPTY_GRAPH_DATA
  const dataKey = currentData ? graphDataKey : lastSuccessfulData?.dataKey
  const measureUnit = data[0]?.measure_unit
  const isInitialLoading = isLoading && !currentData && !lastSuccessfulData?.data
  const shouldShowUpdatingOverlay = useDelayedFlag(
    isFetching && Boolean(lastSuccessfulData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )
  const shouldUseBrush = graphPeriod === 'day' && data.length > BRUSH_VISIBLE_POINT_COUNT
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
  const xAxisTicks = useMemo(
    () => getXAxisTicks(data, effectiveBrushRange),
    [data, effectiveBrushRange]
  )

  useEffect(() => {
    if (currentData) {
      setLastSuccessfulData({
        data: currentData,
        dataKey: graphDataKey
      })
    }
  }, [currentData, graphDataKey])

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

  const updateSeriesView = (seriesKey: GraphSeriesKey, view: GraphSeriesView) => {
    setSeriesView((currentView) => ({
      ...currentView,
      [seriesKey]: view
    }))
  }

  const renderSeries = (view: GraphSeriesView, barSize: number | undefined) =>
    SERIES_CONFIGS.filter((series) => seriesView[series.key] === view).map((series) => {
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

  const renderGraphContent = () => {
    if (!query) {
      return <div className={styles.emptyState}>Нет показателя для графика</div>
    }

    if (error) {
      return <ApiErrorAlert error={error} title="Не удалось загрузить график" />
    }

    if (isInitialLoading) {
      return <Skeleton active paragraph={{ rows: 6 }} title={false} />
    }

    if (data.length === 0) {
      return <div className={styles.emptyState}>Нет данных для графика</div>
    }

    const isCompactRange = data.length <= COMPACT_POINT_LIMIT
    const barSize = isCompactRange ? COMPACT_BAR_SIZE : undefined
    const visiblePointCount = shouldUseBrush ? BRUSH_VISIBLE_POINT_COUNT : data.length

    return (
      <div className={styles.graphWheelArea} onWheel={handleChartWheel}>
        <ChartFrame className={styles.chartBox}>
          {({ width, height }) => {
            const compactXAxisPadding = getCompactXAxisPadding(width, visiblePointCount)

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
                  tickFormatter={(value) => formatGraphTick(String(value), graphPeriod)}
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
                  isAnimationActive={false}
                  labelFormatter={(label) => formatGraphTick(String(label), graphPeriod)}
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
                    tickFormatter={(value) => formatGraphTick(String(value), graphPeriod)}
                    travellerWidth={0}
                  />
                ) : null}
              </ComposedChart>
            )
          }}
        </ChartFrame>
        {shouldShowUpdatingOverlay ? (
          <div className={styles.graphUpdatingOverlay} aria-live="polite">
            Обновление...
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <section className={styles.graphPanel} aria-labelledby="graph-title">
      <header className={styles.graphHeader}>
        <div>
          <h2 className={styles.graphTitle} id="graph-title">
            <span>{query?.indicator ?? 'График'}</span>
            {measureUnit ? <span className={styles.graphTitleUnit}>{measureUnit}</span> : null}
          </h2>
        </div>
        <div className={styles.graphMeta}>
          <label className={styles.graphPeriodControl}>
            <span className={styles.seriesViewLabel}>Детализация</span>
            <Segmented
              options={GRAPH_PERIOD_OPTIONS}
              size="small"
              value={graphPeriod}
              onChange={(value) => setGraphPeriod(value as GraphPeriod)}
            />
          </label>
          <div className={styles.graphViewControls} aria-label="Тип отображения серий">
            {SERIES_CONFIGS.map((series) => (
              <label className={styles.seriesViewControl} key={series.key}>
                <span className={styles.seriesViewLabel}>{series.name}</span>
                <Segmented
                  options={SERIES_VIEW_OPTIONS}
                  size="small"
                  value={seriesView[series.key]}
                  onChange={(value) => updateSeriesView(series.key, value as GraphSeriesView)}
                />
              </label>
            ))}
          </div>
        </div>
      </header>
      {renderGraphContent()}
    </section>
  )
}
