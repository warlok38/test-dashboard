'use client'

import {
  CalendarOutlined,
  CloseCircleFilled,
  DoubleLeftOutlined,
  DoubleRightOutlined,
  LeftOutlined,
  RightOutlined
} from '@ant-design/icons'
import { Button, Calendar, Drawer, Space, Typography } from 'antd'
import { type CalendarMode } from 'antd/es/calendar/generateCalendar'
import cn from 'classnames'
import dayjs, { type Dayjs } from 'dayjs'
import 'dayjs/locale/ru'
import { useEffect, useState } from 'react'

import { type DateRangePickerProps, type DateRangePickerValue } from './DateRangePicker'
import styles from './MobileDateRangePicker.module.css'

type RangeValue = NonNullable<DateRangePickerValue>

type DraftRange = [Dayjs | null, Dayjs | null]

type Preset = NonNullable<DateRangePickerProps['presets']>[number]

const DEFAULT_FORMAT = 'DD-MM-YYYY'
const RANGE_SEPARATOR = '—'

function resolveFormat(format: unknown): string {
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

function normalizeRange(value: DateRangePickerValue | null | undefined): DraftRange {
  return [value?.[0] ?? null, value?.[1] ?? null]
}

function formatDate(value: Dayjs | null, format: string): string {
  return value ? value.format(format) : ''
}

function formatRange(value: DraftRange, format: string): [string, string] {
  return [formatDate(value[0], format), formatDate(value[1], format)]
}

function getPresetValue(preset: Preset): RangeValue {
  return typeof preset.value === 'function' ? preset.value() : preset.value
}

function isDisabled(disabled: DateRangePickerProps['disabled']): boolean {
  return Array.isArray(disabled) ? disabled.some(Boolean) : Boolean(disabled)
}

function isSameDate(left: Dayjs | null, right: Dayjs | null): boolean {
  return Boolean(left && right && left.isSame(right, 'day'))
}

function isInSelectedRange(date: Dayjs, range: DraftRange): boolean {
  const [start, end] = range

  return Boolean(start && end && date.isAfter(start, 'day') && date.isBefore(end, 'day'))
}

function sortRange(range: DraftRange): DraftRange {
  const [start, end] = range

  if (start && end && end.isBefore(start, 'day')) {
    return [end.startOf('day'), start.endOf('day')]
  }

  return range
}

function getVisiblePanelDate(range: DraftRange): Dayjs {
  return range[1] ?? range[0] ?? dayjs()
}

export function MobileDateRangePicker({
  allowClear,
  className,
  disabled,
  disabledDate,
  format,
  onChange,
  placeholder,
  presets,
  style,
  value
}: DateRangePickerProps) {
  const dateFormat = resolveFormat(format)
  const [isOpen, setIsOpen] = useState(false)
  const [draftRange, setDraftRange] = useState<DraftRange>(() => normalizeRange(value))
  const [panelDate, setPanelDate] = useState<Dayjs>(() =>
    getVisiblePanelDate(normalizeRange(value))
  )
  const [calendarMode, setCalendarMode] = useState<CalendarMode>('month')
  const selectedLabel = formatRange(normalizeRange(value), dateFormat)
  const previewLabel = formatRange(draftRange, dateFormat)
  const hasValue = Boolean(value?.[0] && value?.[1])
  const placeholders = placeholder ?? ['Дата от', 'Дата до']
  const pickerDisabled = isDisabled(disabled)

  useEffect(() => {
    if (!isOpen) {
      const nextRange = normalizeRange(value)

      setDraftRange(nextRange)
      setPanelDate(getVisiblePanelDate(nextRange))
      setCalendarMode('month')
    }
  }, [isOpen, value])

  const openPicker = () => {
    if (!pickerDisabled) {
      const nextRange = normalizeRange(value)

      setDraftRange(nextRange)
      setPanelDate(getVisiblePanelDate(nextRange))
      setCalendarMode('month')
      setIsOpen(true)
    }
  }

  const closePicker = () => {
    setIsOpen(false)
  }

  const triggerChange = (nextValue: DraftRange | null) => {
    if (!onChange) {
      return
    }

    onChange(nextValue, nextValue ? formatRange(nextValue, dateFormat) : ['', ''])
  }

  const applyRange = () => {
    triggerChange(draftRange[0] && draftRange[1] ? draftRange : null)
    setIsOpen(false)
  }

  const clearRange = () => {
    setDraftRange([null, null])
    triggerChange(null)
    setIsOpen(false)
  }

  const selectDate = (date: Dayjs) => {
    if (disabledDate?.(date, { type: 'date', from: draftRange[0] ?? undefined })) {
      return
    }

    setPanelDate(date)

    setDraftRange(([start, end]) => {
      if (!start || end) {
        return [date.startOf('day'), null]
      }

      if (date.isBefore(start, 'day')) {
        return [date.startOf('day'), start]
      }

      return [start, date.endOf('day')]
    })
  }

  const selectPreset = (preset: Preset) => {
    const nextValue = sortRange(normalizeRange(getPresetValue(preset)))

    setDraftRange(nextValue)
    setPanelDate(getVisiblePanelDate(nextValue))
    setCalendarMode('month')
  }

  const renderDateCell = (date: Dayjs) => {
    const isStart = isSameDate(date, draftRange[0])
    const isEnd = isSameDate(date, draftRange[1])
    const inRange = isInSelectedRange(date, draftRange)
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

  const drawerTitle = (
    <div className={styles.drawerTitle}>
      <span className={styles.drawerTitleText}>Период</span>
      <span className={styles.drawerTitleRange}>
        <span className={styles.summaryLabel}>с</span>
        <span className={cn(styles.summaryValue, { [styles.placeholder]: !previewLabel[0] })}>
          {previewLabel[0] || placeholders[0]}
        </span>
        <span className={styles.separator}>{RANGE_SEPARATOR}</span>
        <span className={styles.summaryLabel}>по</span>
        <span className={cn(styles.summaryValue, { [styles.placeholder]: !previewLabel[1] })}>
          {previewLabel[1] || placeholders[1]}
        </span>
      </span>
    </div>
  )

  return (
    <>
      <Button
        className={cn(styles.trigger, className)}
        disabled={pickerDisabled}
        icon={<CalendarOutlined />}
        style={style}
        onClick={openPicker}
      >
        <span className={styles.triggerText}>
          <span className={cn({ [styles.placeholder]: !selectedLabel[0] })}>
            {selectedLabel[0] || placeholders[0]}
          </span>
          <span className={styles.separator}>{RANGE_SEPARATOR}</span>
          <span className={cn({ [styles.placeholder]: !selectedLabel[1] })}>
            {selectedLabel[1] || placeholders[1]}
          </span>
        </span>
        {allowClear && hasValue && !pickerDisabled && (
          <CloseCircleFilled
            className={styles.clearIcon}
            onClick={(event) => {
              event.stopPropagation()
              clearRange()
            }}
          />
        )}
      </Button>

      <Drawer
        className={styles.drawer}
        placement="bottom"
        size="60%"
        styles={{ body: { padding: 'var(--space-4)' } }}
        title={drawerTitle}
        open={isOpen}
        onClose={closePicker}
      >
        <div className={styles.content}>
          {presets && presets.length > 0 && (
            <Space className={styles.presets} size={[8, 8]} wrap>
              {presets.map((preset, index) => (
                <Button key={index} size="small" onClick={() => selectPreset(preset)}>
                  {preset.label}
                </Button>
              ))}
            </Space>
          )}

          <Calendar
            fullscreen={false}
            mode={calendarMode}
            value={panelDate}
            disabledDate={(date) =>
              Boolean(disabledDate?.(date, { type: 'date', from: draftRange[0] ?? undefined }))
            }
            fullCellRender={(date, info) =>
              info.type === 'date' ? renderDateCell(date) : info.originNode
            }
            headerRender={({
              value: headerValue,
              type,
              onChange: changePanelDate,
              onTypeChange
            }) => {
              const changeCalendarPanel = (date: Dayjs) => {
                setPanelDate(date)
                changePanelDate(date)
              }
              const setPanelType = (nextMode: CalendarMode) => {
                setCalendarMode(nextMode)
                onTypeChange(nextMode)
              }

              return (
                <div
                  className={cn(styles.calendarHeader, {
                    [styles.calendarHeaderYear]: type === 'year'
                  })}
                >
                  <Button
                    aria-label={type === 'year' ? 'Предыдущий год' : 'Предыдущий год'}
                    icon={<DoubleLeftOutlined />}
                    type="text"
                    onClick={() => changeCalendarPanel(headerValue.subtract(1, 'year'))}
                  />
                  {type === 'month' && (
                    <Button
                      aria-label="Предыдущий месяц"
                      icon={<LeftOutlined />}
                      type="text"
                      onClick={() => changeCalendarPanel(headerValue.subtract(1, 'month'))}
                    />
                  )}
                  <Button
                    className={styles.calendarTitleButton}
                    type="text"
                    onClick={() => setPanelType(type === 'month' ? 'year' : 'month')}
                  >
                    <Typography.Title className={styles.calendarTitle} level={5}>
                      {type === 'year'
                        ? headerValue.format('YYYY')
                        : headerValue.locale('ru').format('MMMM YYYY')}
                    </Typography.Title>
                  </Button>
                  {type === 'month' && (
                    <Button
                      aria-label="Следующий месяц"
                      icon={<RightOutlined />}
                      type="text"
                      onClick={() => changeCalendarPanel(headerValue.add(1, 'month'))}
                    />
                  )}
                  <Button
                    aria-label={type === 'year' ? 'Следующий год' : 'Следующий год'}
                    icon={<DoubleRightOutlined />}
                    type="text"
                    onClick={() => changeCalendarPanel(headerValue.add(1, 'year'))}
                  />
                </div>
              )
            }}
            onPanelChange={(date, mode) => {
              setPanelDate(date)
              setCalendarMode(mode)
            }}
            onSelect={(date, info) => {
              if (info.source === 'date') {
                selectDate(date)
                return
              }

              setPanelDate(date)

              if (info.source === 'month') {
                setCalendarMode('month')
              }
            }}
          />

          <div className={styles.footer}>
            <Button onClick={clearRange}>Сбросить</Button>
            <Button disabled={!draftRange[0] || !draftRange[1]} type="primary" onClick={applyRange}>
              Применить
            </Button>
          </div>
        </div>
      </Drawer>
    </>
  )
}
