import { formatNumber } from '@/shared/utils/formatNumber'

const PRECISE_INDICATORS = new Set(['Содержание', 'Содержание Au', 'Катодный осадок'])

export function getSummaryFractionDigits(indicatorName: string) {
  return PRECISE_INDICATORS.has(indicatorName) ? 2 : 1
}

export function formatSummaryNumber(value: number | null | undefined, fractionDigits = 1) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  return formatNumber(value, { fractionDigits })
}

export function formatDeviation(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) {
    return '-'
  }

  const sign = value > 0 ? '+' : ''

  return `${sign}${formatSummaryNumber(value, 1)}%`
}

export function formatFooterCount(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : String(value)
}
