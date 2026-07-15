'use client'

import { Spin } from 'antd'
import { useEffect, useMemo } from 'react'

import {
  type GeneralSummaryCard,
  type SummaryQuery,
  useGetGeneralSummaryQuery
} from '@/entities/production-summary'
import {
  applyBackendProductionDate,
  createPeriodRequestParams,
  getPeriodByShift,
  normalizeProductionDate
} from '@/features/period-filter'
import { useAppDispatch, useAppSelector } from '@/shared/hooks'
import { ApiErrorAlert } from '@/shared/ui'

import styles from './ProductionSummaryDashboard.module.css'
import { GeneralSummary, GraphPanel } from './ui'

type SummaryDashboardProps = {
  query: SummaryQuery
  showGraph?: boolean
}

type PeriodScopeState = {
  shift: number | null
  productionDate: string | null
  committedProductionDate: string | null
}

function getSelectedGeneralSummaryIndicator(
  cards: GeneralSummaryCard[],
  indicator: string | undefined
) {
  const indicators = cards[0]?.cards ?? []

  return indicators.some((card) => card.indicator_name === indicator)
    ? indicator
    : indicators[0]?.indicator_name
}

export function ProductionSummaryDashboard({ query, showGraph = false }: SummaryDashboardProps) {
  const dispatch = useAppDispatch()
  const periodScope = useAppSelector(
    (state: { periodFilter: PeriodScopeState }) => state.periodFilter
  )
  const { indicator, ...summaryQuery } = query
  const period = getPeriodByShift(summaryQuery.shift)
  const fallbackProductionDate = useMemo(
    () => normalizeProductionDate(period, new Date().toISOString().slice(0, 10)),
    [period]
  )
  const committedProductionDate =
    periodScope.shift === period.shift && periodScope.committedProductionDate
      ? periodScope.committedProductionDate
      : fallbackProductionDate
  const periodParams = createPeriodRequestParams(period, committedProductionDate)
  const generalSummaryQuery = {
    ...summaryQuery,
    ...periodParams
  }
  const {
    data: generalSummary,
    error: generalSummaryError,
    isLoading: isGeneralSummaryLoading
  } = useGetGeneralSummaryQuery(generalSummaryQuery)

  const generalSummaryCards = generalSummary?.cards || []
  const selectedIndicator = getSelectedGeneralSummaryIndicator(generalSummaryCards, indicator)

  const isInitialLoading = isGeneralSummaryLoading && !generalSummary
  const graphQuery =
    showGraph && selectedIndicator
      ? {
          indicator: selectedIndicator,
          ...periodParams,
          ...(query.gtk ? { gtk: query.gtk } : {})
        }
      : undefined

  useEffect(() => {
    if (!generalSummary?.production_date) {
      return
    }

    dispatch(
      applyBackendProductionDate({
        shift: period.shift,
        productionDate: normalizeProductionDate(period, generalSummary.production_date)
      })
    )
  }, [dispatch, generalSummary?.production_date, period])

  if (isInitialLoading) {
    return (
      <section className={styles.dashboard}>
        <div className={styles.initialLoading}>
          <Spin />
          <span>Загружаем данные...</span>
        </div>
      </section>
    )
  }

  if (generalSummaryError && !generalSummary) {
    return (
      <section className={styles.dashboard}>
        <ApiErrorAlert error={generalSummaryError} title="Не удалось загрузить общие показатели" />
      </section>
    )
  }

  return (
    <section className={styles.dashboard}>
      <GeneralSummary
        cards={generalSummaryCards}
        activeIndicator={selectedIndicator}
        loading={isGeneralSummaryLoading}
      />
      {showGraph && <GraphPanel graphPeriod={period.key} query={graphQuery} />}
    </section>
  )
}
