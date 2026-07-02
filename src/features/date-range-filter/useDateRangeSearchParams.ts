'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { type DateRangePickerValue } from '@/shared/ui'

import {
  DATE_FROM_PARAM,
  DATE_TO_PARAM,
  formatUrlDate,
  getYesterdayRange,
  parseUrlDate
} from './lib'

export function useDateRangeSearchParams() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const dateFrom = parseUrlDate(searchParams.get(DATE_FROM_PARAM))
  const dateTo = parseUrlDate(searchParams.get(DATE_TO_PARAM))
  const defaultValue = useMemo(() => getYesterdayRange(), [])
  const value: NonNullable<DateRangePickerValue> = useMemo(
    () => (dateFrom && dateTo ? [dateFrom, dateTo] : defaultValue),
    [dateFrom, dateTo, defaultValue]
  )

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
