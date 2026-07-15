import { type GraphPeriod } from '@/entities/production-summary'

export type GraphChartSize = 'default' | 'compact'

const GRAPH_DATE_REGEXP = /^(\d{4})-(\d{2})-(\d{2})$/
const DAY_LABEL_MIN_WIDTH = 18
const YEAR_LABEL_MIN_WIDTH = 42

const MONTH_SHORT_LABELS = [
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
] as const

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
] as const

function parseGraphDate(value: string | undefined) {
  const match = value?.match(GRAPH_DATE_REGEXP)

  if (!match) {
    return null
  }

  const year = Number(match[1])
  const month = Number(match[2])
  const day = Number(match[3])

  if (!Number.isInteger(year) || month < 1 || month > 12 || day < 1 || day > 31) {
    return null
  }

  return { day, month, year }
}

function getSteppedTicks(values: string[], maxTickCount: number) {
  if (values.length <= maxTickCount) {
    return values
  }

  const step = Math.ceil((values.length - 1) / (maxTickCount - 1))
  const ticks = values.filter((_value, index) => index % step === 0)
  const lastValue = values[values.length - 1]

  return ticks.includes(lastValue) ? ticks : [...ticks, lastValue]
}

function getDynamicTicks(values: string[], chartWidth: number, minLabelWidth: number) {
  const maxTickCount = Math.max(Math.floor(chartWidth / minLabelWidth), 2)

  return getSteppedTicks(values, maxTickCount)
}

export function formatGraphTick(
  value: string,
  period: GraphPeriod,
  size: GraphChartSize = 'default'
) {
  const date = parseGraphDate(value)

  if (!date) {
    return value
  }

  if (period === 'year') {
    return String(date.year)
  }

  if (period === 'month') {
    const labels = size === 'compact' ? MONTH_SHORT_LABELS : MONTH_FULL_LABELS

    return labels[date.month - 1]
  }

  return String(date.day)
}

export function getGraphXAxisTicks(
  values: string[],
  period: GraphPeriod,
  size: GraphChartSize,
  chartWidth: number
) {
  if (values.length <= 1) {
    return values
  }

  if (period === 'month') {
    return values
  }

  if (period === 'day') {
    return size === 'default' ? values : getDynamicTicks(values, chartWidth, DAY_LABEL_MIN_WIDTH)
  }

  return getDynamicTicks(values, chartWidth, YEAR_LABEL_MIN_WIDTH)
}

export function getXAxisInterval(period: GraphPeriod, size: GraphChartSize) {
  return period === 'day' && size === 'default' ? 0 : 'preserveEnd'
}
