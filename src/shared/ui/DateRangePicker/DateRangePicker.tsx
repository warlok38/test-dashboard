'use client'

import { DatePicker } from 'antd'
import { type ComponentProps } from 'react'

import { MobileDateRangePicker } from './MobileDateRangePicker'
import styles from './DateRangePicker.module.css'

const { RangePicker } = DatePicker

export type DateRangePickerProps = ComponentProps<typeof RangePicker>
export type DateRangePickerValue = DateRangePickerProps['value']

export function DateRangePicker(props: DateRangePickerProps) {
  return (
    <>
      <span className={styles.desktopPicker}>
        <RangePicker {...props} />
      </span>
      <span className={styles.mobilePicker}>
        <MobileDateRangePicker {...props} />
      </span>
    </>
  )
}
