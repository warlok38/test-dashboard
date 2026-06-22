import cn from 'classnames'
import dayjs, { type Dayjs } from 'dayjs'

import styles from '../MobileDateRangePicker.module.css'
import { isInSelectedRange, isSameDate, type DraftRange } from '../lib'

type DateCellProps = {
  date: Dayjs
  panelDate: Dayjs
  range: DraftRange
}

export function DateCell({ date, panelDate, range }: DateCellProps) {
  const isStart = isSameDate(date, range[0])
  const isEnd = isSameDate(date, range[1])
  const inRange = isInSelectedRange(date, range)
  const isCurrentMonth = date.isSame(panelDate, 'month')
  const isToday = date.isSame(dayjs(), 'day')

  return (
    <div
      className={cn(styles.dateCell, {
        [styles.dateCellStart]: isStart,
        [styles.dateCellEnd]: isEnd,
        [styles.dateCellInRange]: inRange,
        [styles.dateCellMuted]: !isCurrentMonth,
        [styles.dateCellToday]: isToday
      })}
    >
      <span className={styles.dateCellInner}>{date.date()}</span>
    </div>
  )
}
