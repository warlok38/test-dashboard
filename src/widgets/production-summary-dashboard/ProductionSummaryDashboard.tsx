'use client'

import { Spin } from 'antd'
import { useEffect, useMemo, useState } from 'react'

import {
  PRODUCTION_SUMMARY_API_ROUTES,
  type GeneralSummaryCard,
  type SummaryQuery,
  useGetGeneralSummaryQuery
} from '@/entities/production-summary'
import {
  applyBackendProductionDate,
  createPeriodRequestParams,
  getCurrentProductionDate,
  getPeriodByKey,
  normalizeProductionDate
} from '@/features/period-filter'
import { useAppDispatch, useAppSelector } from '@/shared/hooks'
import { ApiErrorAlert } from '@/shared/ui'

import { isMediaOverlayAvailable, type SummaryOverlayType } from './model'
import styles from './ProductionSummaryDashboard.module.css'
import { GeneralSummary, GraphPanel } from './ui'

type SummaryDashboardProps = {
  gtkSlug?: string
  query: SummaryQuery
  showGraph?: boolean
}

type PeriodScopeState = {
  periodKey: string | null
  productionDate: string | null
  committedProductionDate: string | null
}

function getSelectedGeneralSummaryIndicator(
  cards: GeneralSummaryCard[],
  indicator: string | undefined
) {
  let topIndicators: GeneralSummaryCard[] = []
  if (indicator) {
    topIndicators = cards?.[0] ? [cards[0]] : []
  }
  const detailIndicators = cards[0]?.cards ?? []
  const indicators = [...topIndicators, ...detailIndicators]

  return indicators.some((card) => card.indicator_name === indicator)
    ? indicator
    : indicators[0]?.indicator_name
}

export function ProductionSummaryDashboard({
  gtkSlug,
  query,
  showGraph = false
}: SummaryDashboardProps) {
  const dispatch = useAppDispatch()
  const [activeOverlay, setActiveOverlay] = useState<SummaryOverlayType | null>(null)
  const periodScope = useAppSelector(
    (state: { periodFilter: PeriodScopeState }) => state.periodFilter
  )
  const { indicator, period: queryPeriod, ...summaryQuery } = query
  const period = getPeriodByKey(queryPeriod)
  const fallbackProductionDate = useMemo(
    () => normalizeProductionDate(period, getCurrentProductionDate()),
    [period]
  )
  const committedProductionDate =
    periodScope.periodKey === period.key && periodScope.committedProductionDate
      ? periodScope.committedProductionDate
      : fallbackProductionDate
  const infoPeriodParams = createPeriodRequestParams(period, committedProductionDate, 'info')
  const graphPeriodParams = createPeriodRequestParams(period, committedProductionDate, 'graph')
  const generalSummaryQuery = {
    ...summaryQuery,
    ...infoPeriodParams
  }
  const {
    data: generalSummary,
    error: generalSummaryError,
    isLoading: isGeneralSummaryLoading,
    refetch: refetchGeneralSummary
  } = useGetGeneralSummaryQuery(generalSummaryQuery)

  const generalSummaryCards = generalSummary?.cards || []
  const selectedIndicator = getSelectedGeneralSummaryIndicator(generalSummaryCards, indicator)

  const isInitialLoading = isGeneralSummaryLoading && !generalSummary
  const graphQuery =
    showGraph && selectedIndicator
      ? {
          indicator: selectedIndicator,
          ...graphPeriodParams,
          ...(query.gtk ? { gtk_name: query.gtk } : {})
        }
      : undefined

  useEffect(() => {
    if (!generalSummary?.production_date) {
      return
    }

    dispatch(
      applyBackendProductionDate({
        periodKey: period.key,
        productionDate: normalizeProductionDate(period, generalSummary.production_date)
      })
    )
  }, [dispatch, generalSummary?.production_date, period])

  useEffect(() => {
    if (!showGraph || (activeOverlay && !isMediaOverlayAvailable(activeOverlay, gtkSlug))) {
      setActiveOverlay(null)
    }
  }, [activeOverlay, gtkSlug, showGraph])

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
        <ApiErrorAlert
          error={generalSummaryError}
          title="Не удалось загрузить общие показатели"
          endpointPath={PRODUCTION_SUMMARY_API_ROUTES.generalSummary}
          onRetry={refetchGeneralSummary}
        />
      </section>
    )
  }

  return (
    <section className={styles.dashboard}>
      <GeneralSummary
        cards={generalSummaryCards}
        activeIndicator={selectedIndicator}
        activeOverlay={activeOverlay}
        gtkSlug={gtkSlug}
        loading={isGeneralSummaryLoading}
        showGraph={showGraph}
        onOverlayChange={setActiveOverlay}
        onOverlayPreviewClose={() => setActiveOverlay(null)}
      />
      {showGraph && <GraphPanel graphPeriod={period.key} query={graphQuery} />}
    </section>
  )
}
