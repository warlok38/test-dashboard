'use client'

import { Spin } from 'antd'

import {
  type GeneralSummaryCard,
  type SummaryQuery,
  useGetGeneralSummaryQuery
} from '@/entities/production-summary'
import { ApiErrorAlert } from '@/shared/ui'

import styles from './ProductionSummaryDashboard.module.css'
import { GeneralSummary, GraphPanel } from './ui'

type SummaryDashboardProps = {
  query: SummaryQuery
  showGraph?: boolean
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
  const { indicator, ...summaryQuery } = query
  const {
    data: generalSummary,
    error: generalSummaryError,
    isLoading: isGeneralSummaryLoading
  } = useGetGeneralSummaryQuery(summaryQuery)

  const generalSummaryCards = generalSummary?.cards || []
  const selectedIndicator = getSelectedGeneralSummaryIndicator(generalSummaryCards, indicator)

  const isInitialLoading = isGeneralSummaryLoading && !generalSummary
  const graphQuery =
    showGraph && selectedIndicator
      ? {
          indicator: selectedIndicator,
          ...(query.date_from ? { date_from: query.date_from } : {}),
          ...(query.date_to ? { date_to: query.date_to } : {}),
          ...(query.gtk ? { gtk: query.gtk } : {})
        }
      : undefined

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
      {showGraph && <GraphPanel query={graphQuery} />}
    </section>
  )
}
