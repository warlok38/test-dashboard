import dayjs, { type Dayjs } from 'dayjs'

import { type DateRangePickerProps, type DateRangePickerValue } from '../DateRangePicker'

export type RangeValue = NonNullable<DateRangePickerValue>

export type DraftRange = [Dayjs | null, Dayjs | null]

type Preset = NonNullable<DateRangePickerProps['presets']>[number]

export function normalizeRange(value: DateRangePickerValue | null | undefined): DraftRange {
  return [value?.[0] ?? null, value?.[1] ?? null]
}

export function getPresetValue(preset: Preset): RangeValue {
  return typeof preset.value === 'function' ? preset.value() : preset.value
}

export function isSameDate(left: Dayjs | null, right: Dayjs | null): boolean {
  return Boolean(left && right && left.isSame(right, 'day'))
}

export function isInSelectedRange(date: Dayjs, range: DraftRange): boolean {
  const [start, end] = range

  return Boolean(start && end && date.isAfter(start, 'day') && date.isBefore(end, 'day'))
}

export function sortRange(range: DraftRange): DraftRange {
  const [start, end] = range

  if (start && end && end.isBefore(start, 'day')) {
    return [end.startOf('day'), start.endOf('day')]
  }

  return range
}

export function getVisiblePanelDate(range: DraftRange): Dayjs {
  return range[1] ?? range[0] ?? dayjs()
}
