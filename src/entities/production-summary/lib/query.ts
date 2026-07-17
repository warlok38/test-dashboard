import { type SummaryQuery } from '../model/types'

const DEFAULT_SHIFT = 3
const SUPPORTED_SHIFTS = new Set([3, 5, 99])

type SearchParamValue = string | string[] | undefined

export type SummarySearchParams = {
  shift?: SearchParamValue
  indicator?: SearchParamValue
}

function getSearchParamValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value
}

function getShiftParam(value: SearchParamValue) {
  const shift = Number(getSearchParamValue(value))

  return SUPPORTED_SHIFTS.has(shift) ? shift : DEFAULT_SHIFT
}

export function getSummaryQueryFromSearchParams(
  searchParams: SummarySearchParams | undefined,
  gtk?: string
): SummaryQuery {
  return {
    shift: getShiftParam(searchParams?.shift),
    indicator: getSearchParamValue(searchParams?.indicator),
    ...(gtk ? { gtk } : {})
  }
}
