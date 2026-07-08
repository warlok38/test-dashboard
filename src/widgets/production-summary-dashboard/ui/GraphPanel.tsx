'use client'

import { ReloadOutlined } from '@ant-design/icons'
import { Button, Segmented, Skeleton, Tooltip as AntTooltip } from 'antd'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useEffect, useMemo, useState } from 'react'
import { Bar, Brush, CartesianGrid, ComposedChart, Line, Tooltip, XAxis, YAxis } from 'recharts'
import { type DotItemDotProps } from 'recharts/types/util/types'

import { type GraphPoint, type GraphQuery, useGetGraphQuery } from '@/entities/production-summary'
import { DATE_DISPLAY_FORMAT } from '@/shared/constants'
import { ApiErrorAlert, ChartFrame } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'

const GRAPH_DATE_FORMAT = 'YYYY-MM-DD'
const MAX_X_AXIS_TICKS = 8
const COMPACT_POINT_LIMIT = 10
const COMPACT_POINT_WIDTH = 150
const COMPACT_BAR_SIZE = 64
const CHART_HORIZONTAL_MARGIN = 32
const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-chart-plan)'
const GRID_COLOR = 'var(--palette-dashboard-grid-border)'
const DOT_FILL_COLOR = 'var(--color-bg-card)'
const BRUSH_TRACK_FILL_COLOR = 'var(--color-chart-brush-track-bg)'
const BRUSH_TRACK_STROKE_COLOR = 'var(--color-chart-brush-track-border)'
const BRUSH_HANDLE_FILL_COLOR = 'var(--color-chart-brush-handle-bg)'
const BRUSH_HANDLE_GRIP_COLOR = 'var(--color-chart-brush-handle-grip)'
type GraphPeriod = 'week-to-date' | 'month-to-date' | 'year-to-date'

const DEFAULT_VISIBLE_PERIOD: GraphPeriod = 'month-to-date'
const RANGE_PRESETS: Array<{ label: string; title: string; value: GraphPeriod }> = [
  { label: 'СНН', title: 'С начала недели', value: 'week-to-date' },
  { label: 'СНМ', title: 'С начала месяца', value: 'month-to-date' },
  { label: 'СНГ', title: 'С начала года', value: 'year-to-date' }
]
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

dayjs.extend(customParseFormat)
dayjs.extend(isoWeek)

type GraphPanelQuery = Pick<GraphQuery, 'indicator' | 'gtk'>

type GraphPanelProps = {
  query: GraphPanelQuery | undefined
}

type GraphRange = {
  dateFrom: string
  dateTo: string
}

type BrushRange = {
  startIndex?: number
  endIndex?: number
}

type VisibleIndexes = {
  startIndex: number
  endIndex: number
}

type BrushTravellerProps = {
  x: number
  y: number
  width: number
  height: number
}

function renderBrushTraveller({ x, y, width, height }: BrushTravellerProps) {
  const lineY = Math.floor(y + height / 2) - 1

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={BRUSH_HANDLE_FILL_COLOR}
        stroke="none"
      />
      <line x1={x + 1} y1={lineY} x2={x + width - 1} y2={lineY} stroke={BRUSH_HANDLE_GRIP_COLOR} />
      <line
        x1={x + 1}
        y1={lineY + 2}
        x2={x + width - 1}
        y2={lineY + 2}
        stroke={BRUSH_HANDLE_GRIP_COLOR}
      />
    </g>
  )
}

function parseGraphDate(value: string | undefined) {
  if (!value) {
    return null
  }

  const date = dayjs(value, GRAPH_DATE_FORMAT, true)

  return date.isValid() ? date : null
}

function formatGraphDate(date: dayjs.Dayjs) {
  return date.format(GRAPH_DATE_FORMAT)
}

function formatShortDate(value: string) {
  const date = parseGraphDate(value)

  if (!date) {
    return value
  }

  return `${date.format('DD')} ${MONTH_LABELS[date.month()]}`
}

function getInitialLoadedRange(dateToValue: string | undefined): GraphRange {
  const dateTo = parseGraphDate(dateToValue) ?? dayjs().startOf('day')

  return {
    dateFrom: formatGraphDate(dateTo.startOf('year')),
    dateTo: formatGraphDate(dateTo)
  }
}

function findStartDateIndex(data: GraphPoint[], date: string) {
  const index = data.findIndex((point) => point.date === date)

  if (index !== -1) {
    return index
  }

  const nextIndex = data.findIndex((point) => point.date > date)

  return nextIndex === -1 ? null : nextIndex
}

function findEndDateIndex(data: GraphPoint[], date: string) {
  const exactIndex = data.findIndex((point) => point.date === date)

  if (exactIndex !== -1) {
    return exactIndex
  }

  for (let index = data.length - 1; index >= 0; index -= 1) {
    if (data[index].date < date) {
      return index
    }
  }

  return null
}

function createRangeFromIndexes(data: GraphPoint[], startIndex: number, endIndex: number) {
  return {
    dateFrom: data[startIndex].date,
    dateTo: data[endIndex].date
  }
}

function getVisibleIndexes(
  data: GraphPoint[],
  visibleRange: GraphRange | null
): VisibleIndexes | null {
  if (data.length === 0) {
    return null
  }

  if (!visibleRange) {
    return createVisibleIndexesFromPeriod(data, DEFAULT_VISIBLE_PERIOD)
  }

  const startIndex = findStartDateIndex(data, visibleRange.dateFrom)
  const endIndex = findEndDateIndex(data, visibleRange.dateTo)

  if (startIndex === null || endIndex === null || startIndex > endIndex) {
    return null
  }

  return { startIndex, endIndex }
}

function getPeriodStartDate(dateTo: dayjs.Dayjs, period: GraphPeriod) {
  if (period === 'week-to-date') {
    return dateTo.startOf('isoWeek')
  }

  if (period === 'year-to-date') {
    return dateTo.startOf('year')
  }

  return dateTo.startOf('month')
}

function createVisibleRangeFromPeriod(data: GraphPoint[], period: GraphPeriod) {
  const dateTo = parseGraphDate(data[data.length - 1]?.date)

  if (!dateTo) {
    return null
  }

  const loadedStartDate = parseGraphDate(data[0]?.date)
  const periodStartDate = getPeriodStartDate(dateTo, period)
  const dateFrom =
    loadedStartDate && periodStartDate.isBefore(loadedStartDate) ? loadedStartDate : periodStartDate

  return {
    dateFrom: formatGraphDate(dateFrom),
    dateTo: formatGraphDate(dateTo)
  }
}

function createVisibleIndexesFromPeriod(
  data: GraphPoint[],
  period: GraphPeriod
): VisibleIndexes | null {
  const range = createVisibleRangeFromPeriod(data, period)

  if (!range) {
    return null
  }

  return getVisibleIndexes(data, range)
}

function getPresetValue(range: GraphRange | null) {
  if (!range) {
    return DEFAULT_VISIBLE_PERIOD
  }

  const dateFrom = parseGraphDate(range.dateFrom)
  const dateTo = parseGraphDate(range.dateTo)

  if (!dateFrom || !dateTo) {
    return undefined
  }

  const preset = RANGE_PRESETS.find(
    (item) => formatGraphDate(getPeriodStartDate(dateTo, item.value)) === formatGraphDate(dateFrom)
  )

  return preset?.value
}

function formatRangeLabel(range: GraphRange | null) {
  const dateFrom = parseGraphDate(range?.dateFrom)
  const dateTo = parseGraphDate(range?.dateTo)

  if (!dateFrom || !dateTo) {
    return ''
  }

  return `${dateFrom.format(DATE_DISPLAY_FORMAT)} - ${dateTo.format(DATE_DISPLAY_FORMAT)}`
}

function getXAxisTicks(
  data: GraphPoint[],
  visibleIndexes: NonNullable<ReturnType<typeof getVisibleIndexes>>
) {
  const visibleData = data.slice(visibleIndexes.startIndex, visibleIndexes.endIndex + 1)

  if (visibleData.length <= MAX_X_AXIS_TICKS) {
    return visibleData.map((point) => point.date)
  }

  const step = Math.ceil((visibleData.length - 1) / (MAX_X_AXIS_TICKS - 1))
  const ticks = visibleData.filter((_point, index) => index % step === 0).map((point) => point.date)
  const lastDate = visibleData[visibleData.length - 1].date

  return ticks.includes(lastDate) ? ticks : [...ticks, lastDate]
}

function getVisiblePointCount(visibleIndexes: VisibleIndexes) {
  return visibleIndexes.endIndex - visibleIndexes.startIndex + 1
}

function getCompactXAxisPadding(chartWidth: number, visiblePointCount: number) {
  if (visiblePointCount > COMPACT_POINT_LIMIT) {
    return 0
  }

  const compactWidth = visiblePointCount * COMPACT_POINT_WIDTH
  const availableWidth = Math.max(chartWidth - CHART_HORIZONTAL_MARGIN, 0)

  return Math.max(availableWidth - compactWidth, 0)
}

function isGraphPoint(value: unknown): value is GraphPoint {
  return Boolean(
    value && typeof value === 'object' && 'date' in value && typeof value.date === 'string'
  )
}

export function GraphPanel({ query }: GraphPanelProps) {
  const [loadedRange, setLoadedRange] = useState(() => getInitialLoadedRange(undefined))
  const [visibleRange, setVisibleRange] = useState<GraphRange | null>(null)
  const graphQuery = useMemo<GraphQuery | undefined>(() => {
    if (!query) {
      return undefined
    }

    return {
      ...query,
      date_from: loadedRange.dateFrom,
      date_to: loadedRange.dateTo
    }
  }, [loadedRange.dateFrom, loadedRange.dateTo, query])
  const {
    data = [],
    error,
    isLoading
  } = useGetGraphQuery(graphQuery as GraphQuery, {
    skip: !graphQuery
  })
  const visibleIndexes = getVisibleIndexes(data, visibleRange)
  const visibleStartIndex = visibleIndexes?.startIndex
  const visibleEndIndex = visibleIndexes?.endIndex
  const xAxisTicks = useMemo(
    () =>
      visibleStartIndex === undefined || visibleEndIndex === undefined
        ? []
        : getXAxisTicks(data, {
            startIndex: visibleStartIndex,
            endIndex: visibleEndIndex
          }),
    [data, visibleEndIndex, visibleStartIndex]
  )
  const xAxisTickSet = useMemo(() => new Set(xAxisTicks), [xAxisTicks])
  const rangeLabel = formatRangeLabel(visibleRange)
  const selectedPreset = getPresetValue(visibleRange)

  useEffect(() => {
    setLoadedRange(getInitialLoadedRange(undefined))
    setVisibleRange(null)
  }, [query?.gtk, query?.indicator])

  useEffect(() => {
    if (data.length === 0 || visibleRange) {
      return
    }

    setVisibleRange(createVisibleRangeFromPeriod(data, DEFAULT_VISIBLE_PERIOD))
  }, [data, visibleRange])

  const updateVisibleRange = (range: BrushRange) => {
    const startIndex = range.startIndex ?? visibleIndexes?.startIndex
    const endIndex = range.endIndex ?? visibleIndexes?.endIndex

    if (startIndex === undefined || endIndex === undefined) {
      return
    }

    setVisibleRange(createRangeFromIndexes(data, startIndex, endIndex))
  }

  const updateVisibleRangeByPeriod = (period: GraphPeriod) => {
    if (data.length === 0) {
      return
    }

    setVisibleRange(createVisibleRangeFromPeriod(data, period))
  }

  const resetVisibleRange = () => {
    if (data.length === 0) {
      setVisibleRange(null)

      return
    }

    setVisibleRange(createVisibleRangeFromPeriod(data, DEFAULT_VISIBLE_PERIOD))
  }

  const renderPlanDot = (dotProps: DotItemDotProps) => {
    const { cx, cy, payload } = dotProps

    if (typeof cx !== 'number' || typeof cy !== 'number' || !isGraphPoint(payload)) {
      return null
    }

    if (!xAxisTickSet.has(payload.date)) {
      return null
    }

    return (
      <circle cx={cx} cy={cy} fill={DOT_FILL_COLOR} r={3} stroke={PLAN_COLOR} strokeWidth={3} />
    )
  }

  const renderGraphContent = () => {
    if (!query) {
      return <div className={styles.emptyState}>Нет показателя для графика</div>
    }

    if (error) {
      return <ApiErrorAlert error={error} title="Не удалось загрузить график" />
    }

    if (isLoading) {
      return <Skeleton active paragraph={{ rows: 6 }} title={false} />
    }

    if (data.length === 0) {
      return <div className={styles.emptyState}>Нет данных для графика</div>
    }

    if (!visibleIndexes) {
      return <Skeleton active paragraph={{ rows: 6 }} title={false} />
    }

    const visiblePointCount = getVisiblePointCount(visibleIndexes)
    const barSize = visiblePointCount <= COMPACT_POINT_LIMIT ? COMPACT_BAR_SIZE : undefined

    return (
      <ChartFrame className={styles.chartBox}>
        {({ width, height }) => {
          const compactXAxisPadding = getCompactXAxisPadding(width, visiblePointCount)

          return (
            <ComposedChart
              data={data}
              height={height}
              margin={{ top: 8, right: 16, bottom: 0, left: -16 }}
              width={width}
            >
              <CartesianGrid stroke={GRID_COLOR} vertical={false} />
              <XAxis
                dataKey="date"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 12 }}
                ticks={xAxisTicks}
                tickFormatter={formatShortDate}
                padding={{ left: compactXAxisPadding, right: 0 }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={(label) => formatShortDate(String(label))} />
              <Bar
                dataKey="fact"
                name="Факт"
                fill={FACT_COLOR}
                radius={[3, 3, 0, 0]}
                barSize={barSize}
              />
              <Line
                type="monotone"
                dataKey="plan"
                name="План"
                stroke={PLAN_COLOR}
                strokeWidth={3}
                dot={renderPlanDot}
                connectNulls={false}
              />
              <Brush
                className={styles.chartBrush}
                dataKey="date"
                endIndex={visibleIndexes.endIndex}
                fill={BRUSH_TRACK_FILL_COLOR}
                height={24}
                onChange={updateVisibleRange}
                startIndex={visibleIndexes.startIndex}
                stroke={BRUSH_TRACK_STROKE_COLOR}
                traveller={renderBrushTraveller}
                travellerWidth={8}
              />
            </ComposedChart>
          )
        }}
      </ChartFrame>
    )
  }

  return (
    <section className={styles.graphPanel} aria-labelledby="graph-title">
      <header className={styles.graphHeader}>
        <div>
          <h2 id="graph-title">{query?.indicator ?? 'График'}</h2>
          <div className={styles.graphRange}>{rangeLabel}</div>
        </div>
        <div className={styles.graphMeta}>
          <div className={styles.graphControls}>
            <Segmented
              options={RANGE_PRESETS}
              size="small"
              value={selectedPreset}
              onChange={(value) => updateVisibleRangeByPeriod(value as GraphPeriod)}
            />
            <AntTooltip title="По умолчанию">
              <Button
                aria-label="По умолчанию"
                icon={<ReloadOutlined />}
                onClick={resetVisibleRange}
                size="small"
              />
            </AntTooltip>
          </div>
        </div>
      </header>
      {renderGraphContent()}
    </section>
  )
}
