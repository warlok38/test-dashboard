export type GraphYAxisSeriesKey = 'plan' | 'fact'
export type GraphYAxisSeriesView = 'bar' | 'line'

export type GraphYAxisPoint = {
  date: string
  fact: number | null
  plan: number | null
}

export type GraphYAxisDataPoint = GraphYAxisPoint & {
  factChartValue: number | null
  planChartValue: number | null
}

export type GraphYAxisZeroLabel = {
  date: string
  key: GraphYAxisSeriesKey
  view: GraphYAxisSeriesView
}

export type GraphYAxisScale = {
  data: GraphYAxisDataPoint[]
  domain: [number, number]
  formatTick: (value: string | number | undefined) => string
  isCompressedZeroScale: boolean
  ticks?: number[]
  zeroLabels: GraphYAxisZeroLabel[]
}

export type GraphYAxisValueRange = {
  hasZero: boolean
  max: number
  min: number
}

type CreateGraphYAxisScaleParams = {
  data: GraphYAxisPoint[]
  normalizeValueRange: boolean
  valueRange?: GraphYAxisValueRange
  seriesView: Record<GraphYAxisSeriesKey, GraphYAxisSeriesView>
}

const SERIES_KEYS: GraphYAxisSeriesKey[] = ['plan', 'fact']
const NORMALIZED_PADDING_RATIO = 0.05
const COMPRESSED_ZERO_DOMAIN_MAX = 100
const COMPRESSED_ZERO_BASELINE_GAP = 10
const COMPRESSED_ZERO_TICK_COUNT = 5

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function formatTickValue(value: number) {
  return String(Math.round(value))
}

function getChartValueKey(key: GraphYAxisSeriesKey) {
  return `${key}ChartValue` as const
}

function getNumericValues(data: GraphYAxisPoint[]) {
  return data.flatMap((point) => SERIES_KEYS.map((key) => point[key]).filter(isFiniteNumber))
}

export function getDefaultYAxisMax(data: GraphYAxisPoint[]) {
  const maxValue = Math.max(...data.flatMap((point) => [point.fact ?? 0, point.plan ?? 0]), 0)

  if (maxValue <= 0) {
    return 1
  }

  const magnitude = 10 ** Math.max(Math.floor(Math.log10(maxValue)) - 1, 0)

  return Math.ceil((maxValue * 1.05) / magnitude) * magnitude
}

function createLegacyData(data: GraphYAxisPoint[]): GraphYAxisDataPoint[] {
  return data.map((point) => ({
    ...point,
    factChartValue: point.fact,
    planChartValue: point.plan
  }))
}

function createLegacyScale(data: GraphYAxisPoint[]): GraphYAxisScale {
  return {
    data: createLegacyData(data),
    domain: [0, getDefaultYAxisMax(data)],
    formatTick: (value) => (value === undefined ? '' : String(value)),
    isCompressedZeroScale: false,
    zeroLabels: []
  }
}

function getPaddedDomain(minValue: number, maxValue: number): [number, number] {
  if (minValue === maxValue) {
    const fallbackPadding = Math.max(Math.abs(minValue) * NORMALIZED_PADDING_RATIO, 1)

    return [minValue - fallbackPadding, maxValue + fallbackPadding]
  }

  const padding = (maxValue - minValue) * NORMALIZED_PADDING_RATIO

  return [minValue - padding, maxValue + padding]
}

function normalizeCompressedValue(value: number, minValue: number, maxValue: number) {
  if (value === 0) {
    return 0
  }

  if (minValue === maxValue) {
    return (COMPRESSED_ZERO_DOMAIN_MAX + COMPRESSED_ZERO_BASELINE_GAP) / 2
  }

  const usableRange = COMPRESSED_ZERO_DOMAIN_MAX - COMPRESSED_ZERO_BASELINE_GAP

  return COMPRESSED_ZERO_BASELINE_GAP + ((value - minValue) / (maxValue - minValue)) * usableRange
}

function denormalizeCompressedValue(value: number, minValue: number, maxValue: number) {
  if (value === 0) {
    return 0
  }

  if (minValue === maxValue) {
    return minValue
  }

  const usableRange = COMPRESSED_ZERO_DOMAIN_MAX - COMPRESSED_ZERO_BASELINE_GAP

  return minValue + ((value - COMPRESSED_ZERO_BASELINE_GAP) / usableRange) * (maxValue - minValue)
}

function createCompressedTicks(minValue: number, maxValue: number) {
  if (minValue === maxValue) {
    return [0, normalizeCompressedValue(minValue, minValue, maxValue)]
  }

  const realStep = (maxValue - minValue) / (COMPRESSED_ZERO_TICK_COUNT - 2)

  return [
    0,
    ...Array.from({ length: COMPRESSED_ZERO_TICK_COUNT - 1 }, (_item, index) =>
      normalizeCompressedValue(minValue + realStep * index, minValue, maxValue)
    )
  ]
}

export function createGraphYAxisScale({
  data,
  normalizeValueRange,
  valueRange,
  seriesView
}: CreateGraphYAxisScaleParams): GraphYAxisScale {
  if (!normalizeValueRange) {
    return createLegacyScale(data)
  }

  const numericValues = getNumericValues(data)
  const nonZeroValues = numericValues.filter((value) => value !== 0)

  if (!valueRange && nonZeroValues.length === 0) {
    return createLegacyScale(data)
  }

  const minValue = valueRange?.min ?? Math.min(...nonZeroValues)
  const maxValue = valueRange?.max ?? Math.max(...nonZeroValues)
  const hasZero = valueRange?.hasZero ?? numericValues.some((value) => value === 0)

  if (!hasZero) {
    return {
      data: createLegacyData(data),
      domain: getPaddedDomain(minValue, maxValue),
      formatTick: (value) => {
        const numericValue = Number(value)

        if (Number.isFinite(numericValue)) {
          return formatTickValue(numericValue)
        }

        return value === undefined ? '' : String(value)
      },
      isCompressedZeroScale: false,
      zeroLabels: []
    }
  }

  const zeroLabels: GraphYAxisZeroLabel[] = []
  const normalizedData = data.map((point) => {
    const nextPoint: GraphYAxisDataPoint = {
      ...point,
      factChartValue: null,
      planChartValue: null
    }

    SERIES_KEYS.forEach((key) => {
      const value = point[key]
      const chartValueKey = getChartValueKey(key)

      if (!isFiniteNumber(value)) {
        nextPoint[chartValueKey] = null

        return
      }

      if (value === 0 && seriesView[key] === 'bar') {
        nextPoint[chartValueKey] = null
        zeroLabels.push({ date: point.date, key, view: seriesView[key] })

        return
      }

      if (value === 0) {
        zeroLabels.push({ date: point.date, key, view: seriesView[key] })
      }

      nextPoint[chartValueKey] = normalizeCompressedValue(value, minValue, maxValue)
    })

    return nextPoint
  })

  return {
    data: normalizedData,
    domain: [0, COMPRESSED_ZERO_DOMAIN_MAX],
    formatTick: (value) => {
      const numericValue = Number(value)

      if (!Number.isFinite(numericValue)) {
        return value === undefined ? '' : String(value)
      }

      return formatTickValue(denormalizeCompressedValue(numericValue, minValue, maxValue))
    },
    isCompressedZeroScale: true,
    ticks: createCompressedTicks(minValue, maxValue),
    zeroLabels
  }
}
