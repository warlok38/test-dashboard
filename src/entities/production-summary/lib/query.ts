import { type SummaryPeriod, type SummaryQuery } from '../model/types'

const DEFAULT_PERIOD: SummaryPeriod = 'day'
const SUPPORTED_PERIODS = new Set<SummaryPeriod>(['day', 'month', 'year'])

type SearchParamValue = string | string[] | undefined

export type SummarySearchParams = {
  period?: SearchParamValue
  indicator?: SearchParamValue
}

function getSearchParamValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value
}

function getPeriodParam(value: SearchParamValue): SummaryPeriod {
  const period = getSearchParamValue(value)

  return SUPPORTED_PERIODS.has(period as SummaryPeriod) ? (period as SummaryPeriod) : DEFAULT_PERIOD
}

export function getSummaryQueryFromSearchParams(
  searchParams: SummarySearchParams | undefined,
  gtk?: string
): SummaryQuery {
  return {
    period: getPeriodParam(searchParams?.period),
    indicator: getSearchParamValue(searchParams?.indicator),
    ...(gtk ? { gtk } : {})
  }
}
