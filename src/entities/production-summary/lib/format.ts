import { formatNumber } from '@/shared/utils/formatNumber'

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

  return `${sign}${formatSummaryNumber(value, 1)}% к плану`
}

export function formatFooterCount(value: number | null | undefined) {
  return value === null || value === undefined ? '-' : String(value)
}
