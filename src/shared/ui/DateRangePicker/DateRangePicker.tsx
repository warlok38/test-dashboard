import { DatePicker } from 'antd'
import { type ComponentProps } from 'react'

const { RangePicker } = DatePicker

export type DateRangePickerProps = ComponentProps<typeof RangePicker>
export type DateRangePickerValue = DateRangePickerProps['value']

export function DateRangePicker(props: DateRangePickerProps) {
  return <RangePicker {...props} />
}
