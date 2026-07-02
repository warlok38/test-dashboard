'use client'

import { Tag } from 'antd'

import {
  DateRangePicker,
  isSameRange,
  normalizeRange,
  type DateRangePickerProps,
  type DateRangePickerValue
} from '@/shared/ui'
import { DATE_DISPLAY_FORMAT } from '@/shared/constants'

import {
  getLastMonthRange,
  getLastWeekRange,
  getLastYearRange,
  getMonthToDateRange,
  getYesterdayRange,
  getYearToDateRange
} from './lib'
import { useDateRangeSearchParams } from './useDateRangeSearchParams'
import styles from './DateRangeFilter.module.css'

type DateRangeFilterProps = Pick<
  DateRangePickerProps,
  'className' | 'placement' | 'size' | 'variant'
>

export function DateRangeFilter(props: DateRangeFilterProps = {}) {
  const { className, ...pickerProps } = props
  const { value, setDateRange } = useDateRangeSearchParams()

  const dateRangePresets: Array<{
    label: string
    value: NonNullable<DateRangePickerValue>
  }> = [
    { label: 'Сутки', value: getYesterdayRange() },
    { label: 'Неделя', value: getLastWeekRange() },
    { label: 'Месяц', value: getLastMonthRange() },
    { label: 'Год', value: getLastYearRange() },
    { label: 'С начала месяца', value: getMonthToDateRange() },
    { label: 'С начала года', value: getYearToDateRange() }
  ]
  const activePreset = dateRangePresets.find((preset) =>
    isSameRange(normalizeRange(value), normalizeRange(preset.value))
  )
  const presets: DateRangePickerProps['presets'] = dateRangePresets.map((preset) => ({
    value: preset.value,
    label: (
      <span className={activePreset?.label === preset.label ? styles.activePresetLabel : undefined}>
        {preset.label}
      </span>
    )
  }))

  return (
    <div className={styles.root}>
      {activePreset && (
        <Tag bordered={false} className={styles.activePresetTag}>
          {activePreset.label}
        </Tag>
      )}
      <DateRangePicker
        allowClear
        className={className}
        format={DATE_DISPLAY_FORMAT}
        presets={presets}
        value={value}
        separator="—"
        placeholder={['С: дд.мм.гггг', 'По : дд.мм.гггг']}
        onChange={setDateRange}
        {...pickerProps}
      />
    </div>
  )
}
