'use client'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Segmented, SegmentedProps } from 'antd'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'

import { useAppDispatch, useAppSelector } from '@/shared/hooks'

import {
  formatPeriodScopeLabel,
  getCurrentProductionDate,
  getPeriodByShift,
  normalizeProductionDate,
  PERIOD_OPTIONS
} from './lib'
import {
  commitPeriodProductionDate,
  resetPeriodScope,
  shiftPeriodProductionDate
} from './model/period-filter-slice'
import styles from './PeriodFilter.module.css'

export const SHIFT_PARAM = 'shift'
const PERIOD_ARROW_COMMIT_DELAY_MS = 500

const periodSegmentOptions: SegmentedProps['options'] = PERIOD_OPTIONS.map((period) => ({
  label: period.label,
  value: period.shift,
  disabled: period.disabled
}))

type PeriodScopeState = {
  shift: number | null
  productionDate: string | null
  committedProductionDate: string | null
}

export function PeriodFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const dispatch = useAppDispatch()
  const periodScope = useAppSelector(
    (state: { periodFilter: PeriodScopeState }) => state.periodFilter
  )
  const period = getPeriodByShift(searchParams.get(SHIFT_PARAM) ?? undefined)
  const fallbackProductionDate = useMemo(() => getCurrentProductionDate(), [])
  const activeProductionDate =
    periodScope.shift === period.shift && periodScope.productionDate
      ? periodScope.productionDate
      : normalizeProductionDate(period, fallbackProductionDate)
  const scopeLabel = formatPeriodScopeLabel(period, activeProductionDate)
  const isYearPeriod = period.key === 'year'

  useEffect(() => {
    if (periodScope.shift === period.shift && periodScope.productionDate) {
      return
    }

    dispatch(
      resetPeriodScope({
        shift: period.shift,
        productionDate: normalizeProductionDate(period, fallbackProductionDate)
      })
    )
  }, [dispatch, fallbackProductionDate, period, periodScope.productionDate, periodScope.shift])

  useEffect(() => {
    if (
      isYearPeriod ||
      periodScope.shift !== period.shift ||
      !periodScope.productionDate ||
      periodScope.productionDate === periodScope.committedProductionDate
    ) {
      return
    }

    const nextProductionDate = periodScope.productionDate
    const timeoutId = window.setTimeout(() => {
      dispatch(
        commitPeriodProductionDate({
          shift: period.shift,
          productionDate: nextProductionDate
        })
      )
    }, PERIOD_ARROW_COMMIT_DELAY_MS)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [
    dispatch,
    isYearPeriod,
    period.shift,
    periodScope.committedProductionDate,
    periodScope.productionDate,
    periodScope.shift
  ])

  const updateUrlShift = (shift: number) => {
    const params = new URLSearchParams(searchParams.toString())

    params.set(SHIFT_PARAM, String(shift))
    params.delete('dateFrom')
    params.delete('dateTo')

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const updatePeriod = (nextShift: number) => {
    const nextPeriod = getPeriodByShift(nextShift)
    const nextProductionDate = normalizeProductionDate(nextPeriod, fallbackProductionDate)

    dispatch(
      resetPeriodScope({
        shift: nextPeriod.shift,
        productionDate: nextProductionDate
      })
    )
    updateUrlShift(nextPeriod.shift)
  }

  const shiftScope = (direction: -1 | 1) => {
    if (isYearPeriod) {
      return
    }

    dispatch(
      shiftPeriodProductionDate({
        direction,
        productionDate: activeProductionDate,
        shift: period.shift
      })
    )
  }

  return (
    <div className={styles.root}>
      <div className={styles.scopeControl}>
        <Button
          className={styles.navButton}
          disabled={isYearPeriod}
          icon={<LeftOutlined />}
          type="text"
          onClick={() => shiftScope(-1)}
        />
        <span className={styles.scopeLabel}>
          <span>{scopeLabel.primary}</span>
          {scopeLabel.secondary ? (
            <span className={styles.scopeLabelSecondary}>· {scopeLabel.secondary}</span>
          ) : null}
        </span>
        <Button
          className={styles.navButton}
          disabled={isYearPeriod}
          icon={<RightOutlined />}
          type="text"
          onClick={() => shiftScope(1)}
        />
      </div>
      <Segmented
        className={styles.periodSegment}
        options={periodSegmentOptions}
        value={period.shift}
        onChange={(value) => updatePeriod(Number(value))}
      />
    </div>
  )
}
