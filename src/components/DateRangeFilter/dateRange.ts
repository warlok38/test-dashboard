import dayjs, { type Dayjs } from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'

import { type DateRangePickerValue } from '@/shared/ui'

dayjs.extend(customParseFormat)

export const DATE_FORMAT = 'DD-MM-YYYY'
export const DATE_FROM_PARAM = 'dateFrom'
export const DATE_TO_PARAM = 'dateTo'

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

  const parsed = dayjs(value, DATE_FORMAT, true)

  return parsed.isValid() ? parsed : null
}

export function formatUrlDate(value: Dayjs) {
  return value.format(DATE_FORMAT)
}
