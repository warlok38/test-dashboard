'use client'

import { ReloadOutlined } from '@ant-design/icons'
import { Button, Segmented, Skeleton, Tooltip as AntTooltip } from 'antd'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import isoWeek from 'dayjs/plugin/isoWeek'
import { useEffect, useMemo, useState } from 'react'
import { Bar, CartesianGrid, ComposedChart, Tooltip, XAxis, YAxis } from 'recharts'

import { type GraphPoint, type GraphQuery, useGetGraphQuery } from '@/entities/production-summary'
import { DATE_DISPLAY_FORMAT } from '@/shared/constants'
import { ApiErrorAlert, ChartFrame } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'

const GRAPH_DATE_FORMAT = 'YYYY-MM-DD'
const MAX_X_AXIS_TICKS = 8
const COMPACT_POINT_LIMIT = 10
const COMPACT_POINT_WIDTH = 150
const COMPACT_BAR_SIZE = 32
const CHART_HORIZONTAL_MARGIN = 32
const FACT_COLOR = 'var(--color-kpi-fact)'
const PLAN_COLOR = 'var(--color-chart-plan)'
const GRID_COLOR = 'var(--palette-dashboard-grid-border)'
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

type VisibleIndexes = {
  startIndex: number
  endIndex: number
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
    const isCompactRange = visiblePointCount <= COMPACT_POINT_LIMIT
    const chartData = data.slice(visibleIndexes.startIndex, visibleIndexes.endIndex + 1)
    const barSize = isCompactRange ? COMPACT_BAR_SIZE : undefined

    return (
      <ChartFrame className={styles.chartBox}>
        {({ width, height }) => {
          const compactXAxisPadding = getCompactXAxisPadding(width, visiblePointCount)

          return (
            <ComposedChart
              barGap={0}
              data={chartData}
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
                padding={{ left: 0, right: compactXAxisPadding }}
              />
              <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
              <Tooltip labelFormatter={(label) => formatShortDate(String(label))} />
              <Bar
                dataKey="plan"
                name="План"
                fill={PLAN_COLOR}
                radius={[3, 3, 0, 0]}
                barSize={barSize}
              />
              <Bar
                dataKey="fact"
                name="Факт"
                fill={FACT_COLOR}
                radius={[3, 3, 0, 0]}
                barSize={barSize}
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
