'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'

import { type DateRangePickerValue } from '@/shared/ui'

import {
  DATE_FROM_PARAM,
  DATE_TO_PARAM,
  formatUrlDate,
  getTodayRange,
  parseUrlDate
} from './dateRange'

export function useDateRangeSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const dateFrom = parseUrlDate(searchParams.get(DATE_FROM_PARAM))
  const dateTo = parseUrlDate(searchParams.get(DATE_TO_PARAM))
  const value: NonNullable<DateRangePickerValue> =
    dateFrom && dateTo ? [dateFrom, dateTo] : getTodayRange()

  const setDateRange = (nextValue: DateRangePickerValue | null) => {
    const params = new URLSearchParams(searchParams.toString())

    if (!nextValue || !nextValue[0] || !nextValue[1]) {
      params.delete(DATE_FROM_PARAM)
      params.delete(DATE_TO_PARAM)
    } else {
      params.set(DATE_FROM_PARAM, formatUrlDate(nextValue[0]))
      params.set(DATE_TO_PARAM, formatUrlDate(nextValue[1]))
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  return { value, setDateRange }
}
