'use client'

import { DateRangePicker, type DateRangePickerProps } from '@/shared/ui'
import { DATE_DISPLAY_FORMAT } from '@/shared/constants'

import { getMonthToDateRange, getYesterdayRange, getYearToDateRange } from './lib'
import { useDateRangeSearchParams } from './useDateRangeSearchParams'

type DateRangeFilterProps = Pick<
  DateRangePickerProps,
  'className' | 'placement' | 'size' | 'variant'
>

export function DateRangeFilter(props: DateRangeFilterProps = {}) {
  const { value, setDateRange } = useDateRangeSearchParams()

  const presets: DateRangePickerProps['presets'] = [
    { label: 'Сутки', value: getYesterdayRange() },
    { label: 'С начала месяца', value: getMonthToDateRange() },
    { label: 'С начала года', value: getYearToDateRange() }
  ]

  return (
    <DateRangePicker
      allowClear
      format={DATE_DISPLAY_FORMAT}
      presets={presets}
      value={value}
      separator="—"
      placeholder={['С: дд.мм.гггг', 'По : дд.мм.гггг']}
      onChange={setDateRange}
      {...props}
    />
  )
}
