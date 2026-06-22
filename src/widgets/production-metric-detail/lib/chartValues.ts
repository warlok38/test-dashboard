import { type MetricValue, hasMetricValue } from './metricStatus'

export const EMPTY_BAR_VALUE = 0.001

export function getChartValue(value: MetricValue) {
  if (!hasMetricValue(value) || value === 0) {
    return EMPTY_BAR_VALUE
  }

  return value
}

export function getNumberProp(record: Record<string, unknown>, key: string) {
  const value = record[key]

  if (typeof value === 'number') {
    return value
  }

  if (typeof value === 'string') {
    const parsedValue = Number(value)

    return Number.isNaN(parsedValue) ? null : parsedValue
  }

  return null
}
