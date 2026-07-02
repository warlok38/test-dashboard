import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { DATE_URL_FORMAT } from '@/shared/constants'
import { type DateRangePickerValue } from '@/shared/ui'

dayjs.extend(customParseFormat)

export const DATE_FROM_PARAM = 'dateFrom'
export const DATE_TO_PARAM = 'dateTo'

export function getYesterdayRange(): NonNullable<DateRangePickerValue> {
  const yesterday = dayjs().subtract(1, 'day')

  return [yesterday.startOf('day'), yesterday.endOf('day')]
}

export function getTodayRange(): NonNullable<DateRangePickerValue> {
  const today = dayjs()

  return [today.startOf('day'), today]
}

export function getMonthToDateRange(): NonNullable<DateRangePickerValue> {
  return [dayjs().startOf('month'), dayjs()]
}

export function getYearToDateRange(): NonNullable<DateRangePickerValue> {
  return [dayjs().startOf('year'), dayjs()]
}

export function parseUrlDate(value: string | null): Dayjs | null {
  if (!value) {
    return null
  }

  const parsed = dayjs(value, DATE_URL_FORMAT, true)

  return parsed.isValid() ? parsed : null
}

export function formatUrlDate(value: Dayjs) {
  return value.format(DATE_URL_FORMAT)
}
