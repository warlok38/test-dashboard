import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { DATE_URL_FORMAT } from '@/shared/constants'

import { type SummaryQuery } from '../model/types'

dayjs.extend(customParseFormat)

const SUMMARY_API_DATE_FORMAT = 'YYYY-MM-DD'

type SearchParamValue = string | string[] | undefined

export type SummarySearchParams = {
  dateFrom?: SearchParamValue
  dateTo?: SearchParamValue
}

function getSearchParamValue(value: SearchParamValue) {
  return Array.isArray(value) ? value[0] : value
}

function formatSummaryDate(value: SearchParamValue) {
  const date = getSearchParamValue(value)

  if (!date) {
    return undefined
  }

  const parsed = dayjs(date, DATE_URL_FORMAT, true)

  return parsed.isValid() ? parsed.format(SUMMARY_API_DATE_FORMAT) : undefined
}

export function getSummaryQueryFromSearchParams(
  searchParams: SummarySearchParams | undefined,
  gtk?: string
): SummaryQuery {
  return {
    date_from: formatSummaryDate(searchParams?.dateFrom),
    date_to: formatSummaryDate(searchParams?.dateTo),
    ...(gtk ? { gtk } : {})
  }
}
