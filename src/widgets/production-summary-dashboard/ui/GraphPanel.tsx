'use client'

import { ReloadOutlined } from '@ant-design/icons'
import { Alert, Button, Segmented, Skeleton, Tooltip as AntTooltip } from 'antd'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { useEffect, useMemo, useState } from 'react'
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from 'recharts'
import { type DotItemDotProps } from 'recharts/types/util/types'

import { type GraphPoint, type GraphQuery, useGetGraphQuery } from '@/entities/production-summary'
import { DATE_DISPLAY_FORMAT } from '@/shared/constants'

import styles from '../ProductionSummaryDashboard.module.css'

const GRAPH_DATE_FORMAT = 'YYYY-MM-DD'
const DEFAULT_VISIBLE_DAYS = 30
const MIN_VISIBLE_DAYS = 7
const MAX_VISIBLE_DAYS = 365
const MAX_X_AXIS_TICKS = 8
const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-kpi-plan)'
const GRID_COLOR = 'var(--palette-dashboard-grid-border)'
const DOT_FILL_COLOR = 'var(--color-bg-card)'
const BRUSH_TRACK_FILL_COLOR = 'var(--color-chart-brush-track-bg)'
const BRUSH_TRACK_STROKE_COLOR = 'var(--color-chart-brush-track-border)'
const BRUSH_HANDLE_FILL_COLOR = 'var(--color-chart-brush-handle-bg)'
const BRUSH_HANDLE_GRIP_COLOR = 'var(--color-chart-brush-handle-grip)'
const RANGE_PRESETS = [
  { label: 'Неделя', value: 7 },
  { label: 'Месяц', value: 30 },
  { label: 'Квартал', value: 90 },
  { label: 'Год', value: MAX_VISIBLE_DAYS }
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
    dateFrom: formatGraphDate(dateTo.subtract(MAX_VISIBLE_DAYS - 1, 'day')),
    dateTo: formatGraphDate(dateTo)
  }
}

function findDateIndex(data: GraphPoint[], date: string) {
  const index = data.findIndex((point) => point.date === date)

  return index === -1 ? null : index
}

function createRangeFromIndexes(data: GraphPoint[], startIndex: number, endIndex: number) {
  return {
    dateFrom: data[startIndex].date,
    dateTo: data[endIndex].date
  }
}

function getVisibleIndexes(data: GraphPoint[], visibleRange: GraphRange | null) {
  if (data.length === 0) {
    return null
  }

  if (!visibleRange) {
    const endIndex = data.length - 1
    const startIndex = Math.max(0, endIndex - DEFAULT_VISIBLE_DAYS + 1)

    return { startIndex, endIndex }
  }

  const startIndex = findDateIndex(data, visibleRange.dateFrom)
  const endIndex = findDateIndex(data, visibleRange.dateTo)

  if (startIndex === null || endIndex === null) {
    return null
  }

  return { startIndex, endIndex }
}

function getRangeSize(range: GraphRange) {
  const dateFrom = parseGraphDate(range.dateFrom)
  const dateTo = parseGraphDate(range.dateTo)

  if (!dateFrom || !dateTo) {
    return DEFAULT_VISIBLE_DAYS
  }

  return Math.max(MIN_VISIBLE_DAYS, dateTo.diff(dateFrom, 'day') + 1)
}

function getPresetValue(range: GraphRange | null) {
  if (!range) {
    return DEFAULT_VISIBLE_DAYS
  }

  const rangeSize = getRangeSize(range)
  const preset = RANGE_PRESETS.find((item) => item.value === rangeSize)

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

    const endIndex = data.length - 1
    const startIndex = Math.max(0, endIndex - DEFAULT_VISIBLE_DAYS + 1)

    setVisibleRange(createRangeFromIndexes(data, startIndex, endIndex))
  }, [data, visibleRange])

  const updateVisibleRange = (range: BrushRange) => {
    const startIndex = range.startIndex ?? visibleIndexes?.startIndex
    const endIndex = range.endIndex ?? visibleIndexes?.endIndex

    if (startIndex === undefined || endIndex === undefined) {
      return
    }

    setVisibleRange(createRangeFromIndexes(data, startIndex, endIndex))
  }

  const updateVisibleRangeByDays = (days: number) => {
    if (!visibleIndexes) {
      return
    }

    const nextSize = Math.min(MAX_VISIBLE_DAYS, Math.max(MIN_VISIBLE_DAYS, days), data.length)
    const endIndex = visibleIndexes.endIndex
    const startIndex = Math.max(0, endIndex - nextSize + 1)

    setVisibleRange(createRangeFromIndexes(data, startIndex, endIndex))
  }

  const resetVisibleRange = () => {
    if (data.length === 0) {
      setVisibleRange(null)

      return
    }

    const endIndex = data.length - 1
    const startIndex = Math.max(0, endIndex - DEFAULT_VISIBLE_DAYS + 1)

    setVisibleRange(createRangeFromIndexes(data, startIndex, endIndex))
  }

  const renderFactDot = (dotProps: DotItemDotProps) => {
    const { cx, cy, payload } = dotProps

    if (typeof cx !== 'number' || typeof cy !== 'number' || !isGraphPoint(payload)) {
      return null
    }

    if (!xAxisTickSet.has(payload.date)) {
      return null
    }

    return (
      <circle cx={cx} cy={cy} fill={DOT_FILL_COLOR} r={3} stroke={FACT_COLOR} strokeWidth={3} />
    )
  }

  const renderGraphContent = () => {
    if (!query) {
      return <div className={styles.emptyState}>Нет показателя для графика</div>
    }

    if (error) {
      return <Alert showIcon type="error" title="Не удалось загрузить график" />
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

    return (
      <div className={styles.chartBox}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 16, bottom: 0, left: -16 }}>
            <CartesianGrid stroke={GRID_COLOR} vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12 }}
              ticks={xAxisTicks}
              tickFormatter={formatShortDate}
            />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
            <Tooltip labelFormatter={(label) => formatShortDate(String(label))} />
            <Line
              type="monotone"
              dataKey="plan"
              name="План"
              stroke={PLAN_COLOR}
              strokeWidth={2}
              dot={false}
              connectNulls={false}
            />
            <Line
              type="monotone"
              dataKey="fact"
              name="Факт"
              stroke={FACT_COLOR}
              strokeWidth={3}
              dot={renderFactDot}
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
          </LineChart>
        </ResponsiveContainer>
      </div>
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
              onChange={(value) => updateVisibleRangeByDays(Number(value))}
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
