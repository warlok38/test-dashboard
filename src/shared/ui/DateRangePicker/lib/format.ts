import { type Dayjs } from 'dayjs'

import { DATE_DISPLAY_FORMAT } from '@/shared/constants'

import { type DateRangePickerProps } from '../DateRangePicker'
import { type DraftRange } from './range'

const DEFAULT_FORMAT = DATE_DISPLAY_FORMAT

export function resolveFormat(format: unknown): string {
  if (typeof format === 'string') {
    return format
  }

  if (Array.isArray(format)) {
    const firstFormat = format[0]

    if (typeof firstFormat === 'string') {
      return firstFormat
    }

    if (
      typeof firstFormat === 'object' &&
      firstFormat &&
      'format' in firstFormat &&
      typeof firstFormat.format === 'string'
    ) {
      return firstFormat.format
    }
  }

  if (
    typeof format === 'object' &&
    format &&
    'format' in format &&
    typeof format.format === 'string'
  ) {
    return format.format
  }

  return DEFAULT_FORMAT
}

export function formatDate(value: Dayjs | null, format: string): string {
  return value ? value.format(format) : ''
}

export function formatRange(value: DraftRange, format: string): [string, string] {
  return [formatDate(value[0], format), formatDate(value[1], format)]
}

export function isDisabled(disabled: DateRangePickerProps['disabled']): boolean {
  return Array.isArray(disabled) ? disabled.some(Boolean) : Boolean(disabled)
}
