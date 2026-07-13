'use client'

import { BarChartOutlined, LineChartOutlined } from '@ant-design/icons'
import { Segmented, Skeleton } from 'antd'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  type GraphPeriod,
  type GraphPoint,
  type GraphQuery,
  type GraphWithDetailsDetail,
  type GraphWithGtkDetail,
  useGetGraphQuery,
  useGetGraphWithDetailsQuery,
  useGetGraphWithGtkQuery
} from '@/entities/production-summary'
import { ApiErrorAlert } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'
import {
  GRAPH_SERIES_CONFIGS,
  GraphChart,
  type GraphSeriesKey,
  type GraphSeriesView
} from './graph-chart'

const GRAPH_LOADING_OVERLAY_DELAY_MS = 400

const DEFAULT_GRAPH_PERIOD: GraphPeriod = 'day'
const GRAPH_PERIOD_OPTIONS: Array<{ label: string; value: GraphPeriod }> = [
  { label: 'Дни', value: 'day' },
  { label: 'Месяцы', value: 'month' },
  { label: 'Годы', value: 'year' }
]
const EMPTY_GRAPH_DATA: GraphPoint[] = []
const EMPTY_GTK_DETAILS: GraphWithGtkDetail[] = []
const EMPTY_GRAPH_DETAILS: GraphWithDetailsDetail[] = []

const SERIES_VIEW_OPTIONS: Array<{ label: ReactNode; value: GraphSeriesView }> = [
  {
    label: (
      <span className={styles.seriesViewIconLabel} title="Столбики">
        <BarChartOutlined className={styles.seriesViewIcon} />
      </span>
    ),
    value: 'bar'
  },
  {
    label: (
      <span className={styles.seriesViewIconLabel} title="Линия">
        <LineChartOutlined className={styles.seriesViewIcon} />
      </span>
    ),
    value: 'line'
  }
]

type GraphPanelQuery = Pick<GraphQuery, 'indicator' | 'gtk' | 'date_from' | 'date_to'>

type GraphPanelProps = {
  query: GraphPanelQuery | undefined
}

type LastSuccessfulGraphData = {
  data: GraphPoint[]
  dataKey: string | undefined
}

function getGraphQuery(query: GraphPanelQuery | undefined, period: GraphPeriod) {
  if (!query) {
    return undefined
  }

  const shouldUseGlobalRange =
    query.date_from !== undefined &&
    query.date_to !== undefined &&
    query.date_from !== query.date_to

  return {
    indicator: query.indicator,
    period,
    ...(query.gtk ? { gtk: query.gtk } : {}),
    ...(shouldUseGlobalRange
      ? {
          date_from: query.date_from,
          date_to: query.date_to
        }
      : {})
  } satisfies GraphQuery
}

function getGraphDataKey(query: GraphQuery | undefined) {
  if (!query) {
    return undefined
  }

  return [
    query.gtk ?? '',
    query.indicator,
    query.period ?? '',
    query.date_from ?? '',
    query.date_to ?? ''
  ].join(':')
}

function useDelayedFlag(isActive: boolean, delayMs: number) {
  const [isDelayedActive, setIsDelayedActive] = useState(false)

  useEffect(() => {
    if (!isActive) {
      setIsDelayedActive(false)

      return
    }

    const timeoutId = window.setTimeout(() => {
      setIsDelayedActive(true)
    }, delayMs)

    return () => {
      window.clearTimeout(timeoutId)
    }
  }, [delayMs, isActive])

  return isDelayedActive
}

export function GraphPanel({ query }: GraphPanelProps) {
  const [graphPeriod, setGraphPeriod] = useState<GraphPeriod>(DEFAULT_GRAPH_PERIOD)
  const [seriesView, setSeriesView] = useState<Record<GraphSeriesKey, GraphSeriesView>>({
    plan: 'bar',
    fact: 'bar'
  })
  const graphQuery = useMemo(() => getGraphQuery(query, graphPeriod), [graphPeriod, query])
  const graphDataKey = useMemo(() => getGraphDataKey(graphQuery), [graphQuery])
  const { currentData, error, isFetching, isLoading } = useGetGraphQuery(graphQuery as GraphQuery, {
    skip: !graphQuery
  })
  const {
    currentData: graphWithGtkData,
    error: graphWithGtkError,
    isLoading: isGraphWithGtkLoading
  } = useGetGraphWithGtkQuery(graphQuery as GraphQuery, {
    skip: !graphQuery
  })
  const {
    currentData: graphWithDetailsData,
    error: graphWithDetailsError,
    isLoading: isGraphWithDetailsLoading
  } = useGetGraphWithDetailsQuery(graphQuery as GraphQuery, {
    skip: !graphQuery
  })
  const [lastSuccessfulData, setLastSuccessfulData] = useState<
    LastSuccessfulGraphData | undefined
  >()
  const data = currentData ?? lastSuccessfulData?.data ?? EMPTY_GRAPH_DATA
  const dataKey = currentData ? graphDataKey : lastSuccessfulData?.dataKey
  const measureUnit = data[0]?.measure_unit
  const isInitialLoading = isLoading && !currentData && !lastSuccessfulData?.data
  const shouldShowUpdatingOverlay = useDelayedFlag(
    isFetching && Boolean(lastSuccessfulData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )
  const depositDetails = graphWithGtkData?.details ?? EMPTY_GTK_DETAILS
  const graphDetails = graphWithDetailsData?.details ?? EMPTY_GRAPH_DETAILS

  useEffect(() => {
    if (currentData) {
      setLastSuccessfulData({
        data: currentData,
        dataKey: graphDataKey
      })
    }
  }, [currentData, graphDataKey])

  const updateSeriesView = (seriesKey: GraphSeriesKey, view: GraphSeriesView) => {
    setSeriesView((currentView) => ({
      ...currentView,
      [seriesKey]: view
    }))
  }

  const renderGraphContent = () => {
    if (!query) {
      return <div className={styles.emptyState}>Нет показателя для графика</div>
    }

    if (error) {
      return <ApiErrorAlert error={error} title="Не удалось загрузить график" />
    }

    if (isInitialLoading) {
      return <Skeleton active paragraph={{ rows: 6 }} title={false} />
    }

    return (
      <GraphChart
        data={data}
        dataKey={dataKey}
        emptyText="Нет данных для графика"
        graphPeriod={graphPeriod}
        isUpdating={shouldShowUpdatingOverlay}
        seriesView={seriesView}
      />
    )
  }

  const renderDepositsContent = () => {
    if (graphWithGtkError) {
      return <ApiErrorAlert error={graphWithGtkError} title="Не удалось загрузить месторождения" />
    }

    if (isGraphWithGtkLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} title={false} />
    }

    if (depositDetails.length === 0) {
      return <div className={styles.emptyState}>Нет данных по месторождениям</div>
    }

    return (
      <div className={styles.depositGraphGrid}>
        {depositDetails.map((detail) => (
          <article className={styles.depositGraphCard} key={detail.gtk}>
            <h3 className={styles.depositGraphTitle}>{detail.gtk}</h3>
            <GraphChart
              data={detail.points}
              dataKey={`${graphDataKey}:${detail.gtk}`}
              graphPeriod={graphPeriod}
              seriesView={seriesView}
              size="compact"
            />
          </article>
        ))}
      </div>
    )
  }

  const renderDetailsContent = () => {
    if (graphWithDetailsError) {
      return (
        <ApiErrorAlert
          error={graphWithDetailsError}
          title="Не удалось загрузить детальные показатели"
        />
      )
    }

    if (isGraphWithDetailsLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} title={false} />
    }

    if (graphDetails.length === 0) {
      return <div className={styles.emptyState}>Нет данных по детальным показателям</div>
    }

    return (
      <div className={styles.depositGraphGrid}>
        {graphDetails.map((detail) => (
          <article className={styles.depositGraphCard} key={detail.indicator}>
            <h3 className={styles.depositGraphTitle}>
              <span>{detail.indicator}</span>
              <span className={styles.graphTitleUnit}>{detail.unit}</span>
            </h3>
            <GraphChart
              data={detail.points}
              dataKey={`${graphDataKey}:details:${detail.indicator}`}
              graphPeriod={graphPeriod}
              seriesView={seriesView}
              size="compact"
            />
          </article>
        ))}
      </div>
    )
  }

  return (
    <section className={styles.graphPanel}>
      <header className={styles.graphHeader}>
        <div>
          <h2 className={styles.graphTitle}>
            <span>{query?.indicator ?? 'График'}</span>
            {measureUnit ? <span className={styles.graphTitleUnit}>{measureUnit}</span> : null}
          </h2>
        </div>
        <div className={styles.graphMeta}>
          <label className={styles.graphPeriodControl}>
            <span className={styles.seriesViewLabel}>Детализация</span>
            <Segmented
              options={GRAPH_PERIOD_OPTIONS}
              size="small"
              value={graphPeriod}
              onChange={(value) => setGraphPeriod(value as GraphPeriod)}
            />
          </label>
          <div className={styles.graphViewControls}>
            {GRAPH_SERIES_CONFIGS.map((series) => (
              <label className={styles.seriesViewControl} key={series.key}>
                <span className={styles.seriesViewLabel}>{series.name}</span>
                <Segmented
                  options={SERIES_VIEW_OPTIONS}
                  size="small"
                  value={seriesView[series.key]}
                  onChange={(value) => updateSeriesView(series.key, value as GraphSeriesView)}
                />
              </label>
            ))}
          </div>
        </div>
      </header>
      {renderGraphContent()}
      <div className={styles.graphNestedSections}>
        <section className={styles.graphNestedSection}>
          <h2 className={styles.graphSectionTitle}>Месторождения</h2>
          <div className={styles.graphSectionBody}>{renderDepositsContent()}</div>
        </section>
        <section className={styles.graphNestedSection}>
          <h2 className={styles.graphSectionTitle}>Детальные показатели</h2>
          <div className={styles.graphSectionBody}>{renderDetailsContent()}</div>
        </section>
      </div>
    </section>
  )
}
