'use client'

import { DateRangePicker, type DateRangePickerProps } from '@/shared/ui'
import { DATE_DISPLAY_FORMAT } from '@/shared/constants'

import { getMonthToDateRange, getTodayRange, getYearToDateRange } from './lib'
import { useDateRangeSearchParams } from './useDateRangeSearchParams'

export function DateRangeFilter() {
  const { value, setDateRange } = useDateRangeSearchParams()

  const presets: DateRangePickerProps['presets'] = [
    { label: 'Сутки', value: getTodayRange() },
    { label: 'С начала месяца', value: getMonthToDateRange() },
    { label: 'С начала года', value: getYearToDateRange() }
  ]

  return (
    <DateRangePicker
      allowClear
      format={DATE_DISPLAY_FORMAT}
      presets={presets}
      value={value}
      onChange={setDateRange}
    />
  )
}
