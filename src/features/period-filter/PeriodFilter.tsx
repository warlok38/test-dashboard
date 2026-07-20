'use client'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Segmented, SegmentedProps } from 'antd'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useMemo } from 'react'

import { useAppDispatch, useAppSelector } from '@/shared/hooks'

import {
  formatPeriodScopeLabel,
  getCurrentProductionDate,
  getPeriodByKey,
  normalizeProductionDate,
  PERIOD_OPTIONS
} from './lib'
import {
  commitPeriodProductionDate,
  resetPeriodScope,
  shiftPeriodProductionDate
} from './model/period-filter-slice'
import styles from './PeriodFilter.module.css'

export const PERIOD_PARAM = 'period'
const PERIOD_ARROW_COMMIT_DELAY_MS = 500

const periodSegmentOptions: SegmentedProps['options'] = PERIOD_OPTIONS.map((period) => ({
  label: period.label,
  value: period.key,
  disabled: period.disabled
}))

type PeriodScopeState = {
  periodKey: string | null
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
  const period = getPeriodByKey(searchParams.get(PERIOD_PARAM) ?? undefined)
  const fallbackProductionDate = useMemo(() => getCurrentProductionDate(), [])
  const activeProductionDate =
    periodScope.periodKey === period.key && periodScope.productionDate
      ? periodScope.productionDate
      : normalizeProductionDate(period, fallbackProductionDate)
  const scopeLabel = formatPeriodScopeLabel(period, activeProductionDate)
  const isYearPeriod = period.key === 'year'

  useEffect(() => {
    if (periodScope.periodKey === period.key && periodScope.productionDate) {
      return
    }

    dispatch(
      resetPeriodScope({
        periodKey: period.key,
        productionDate: normalizeProductionDate(period, fallbackProductionDate)
      })
    )
  }, [dispatch, fallbackProductionDate, period, periodScope.periodKey, periodScope.productionDate])

  useEffect(() => {
    if (
      isYearPeriod ||
      periodScope.periodKey !== period.key ||
      !periodScope.productionDate ||
      periodScope.productionDate === periodScope.committedProductionDate
    ) {
      return
    }

    const nextProductionDate = periodScope.productionDate
    const timeoutId = window.setTimeout(() => {
      dispatch(
        commitPeriodProductionDate({
          periodKey: period.key,
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
    period.key,
    periodScope.committedProductionDate,
    periodScope.periodKey,
    periodScope.productionDate
  ])

  const updateUrlPeriod = (periodKey: string) => {
    const params = new URLSearchParams(searchParams.toString())

    params.set(PERIOD_PARAM, periodKey)
    params.delete('shift')
    params.delete('dateFrom')
    params.delete('dateTo')

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const updatePeriod = (nextPeriodKey: string) => {
    const nextPeriod = getPeriodByKey(nextPeriodKey)
    const nextProductionDate = normalizeProductionDate(nextPeriod, fallbackProductionDate)

    dispatch(
      resetPeriodScope({
        periodKey: nextPeriod.key,
        productionDate: nextProductionDate
      })
    )
    updateUrlPeriod(nextPeriod.key)
  }

  const shiftScope = (direction: -1 | 1) => {
    if (isYearPeriod) {
      return
    }

    dispatch(
      shiftPeriodProductionDate({
        direction,
        productionDate: activeProductionDate,
        periodKey: period.key
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
        value={period.key}
        onChange={(value) => updatePeriod(String(value))}
      />
    </div>
  )
}
