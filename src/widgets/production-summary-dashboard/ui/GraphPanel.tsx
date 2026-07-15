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

type GraphControlsProps = {
  graphPeriod: GraphPeriod
  seriesView: Record<GraphSeriesKey, GraphSeriesView>
  onGraphPeriodChange: (period: GraphPeriod) => void
  onSeriesViewChange: (seriesKey: GraphSeriesKey, view: GraphSeriesView) => void
}

type LastSuccessfulGraphData = {
  data: GraphPoint[]
  dataKey: string | undefined
}

type LastSuccessfulDetailsData<T> = {
  details: T[]
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

function getDetailDepositGraphQuery(
  query: GraphQuery | undefined,
  detailIndicator: string
): GraphQuery | undefined {
  if (!query) {
    return undefined
  }

  return {
    ...query,
    indicator: detailIndicator
  }
}

function GraphControls({
  graphPeriod,
  seriesView,
  onGraphPeriodChange,
  onSeriesViewChange
}: GraphControlsProps) {
  return (
    <div className={styles.graphMeta}>
      <label className={styles.graphPeriodControl}>
        <span className={styles.seriesViewLabel}>Детализация</span>
        <Segmented
          options={GRAPH_PERIOD_OPTIONS}
          size="small"
          value={graphPeriod}
          onChange={(value) => onGraphPeriodChange(value as GraphPeriod)}
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
              onChange={(value) => onSeriesViewChange(series.key, value as GraphSeriesView)}
            />
          </label>
        ))}
      </div>
    </div>
  )
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

function DetailDepositGraphs({
  detailIndicator,
  graphPeriod,
  parentGraphQuery,
  seriesView
}: {
  detailIndicator: string
  graphPeriod: GraphPeriod
  parentGraphQuery: GraphQuery | undefined
  seriesView: Record<GraphSeriesKey, GraphSeriesView>
}) {
  const detailGraphQuery = useMemo(
    () => getDetailDepositGraphQuery(parentGraphQuery, detailIndicator),
    [detailIndicator, parentGraphQuery]
  )
  const detailGraphDataKey = useMemo(() => getGraphDataKey(detailGraphQuery), [detailGraphQuery])
  const {
    currentData: detailGraphWithGtkData,
    error: detailGraphWithGtkError,
    isFetching: isDetailGraphWithGtkFetching,
    isLoading: isDetailGraphWithGtkLoading
  } = useGetGraphWithGtkQuery(detailGraphQuery as GraphQuery, {
    skip: !detailGraphQuery
  })
  const [lastSuccessfulDetailGtkData, setLastSuccessfulDetailGtkData] = useState<
    LastSuccessfulDetailsData<GraphWithGtkDetail> | undefined
  >()
  const detailDepositDetails =
    detailGraphWithGtkData?.details ?? lastSuccessfulDetailGtkData?.details ?? EMPTY_GTK_DETAILS
  const detailDepositDetailsDataKey = detailGraphWithGtkData
    ? detailGraphDataKey
    : lastSuccessfulDetailGtkData?.dataKey
  const isInitialDetailGtkLoading =
    isDetailGraphWithGtkLoading && !detailGraphWithGtkData && !lastSuccessfulDetailGtkData?.details
  const shouldShowDetailGtkUpdatingOverlay = useDelayedFlag(
    isDetailGraphWithGtkFetching && Boolean(lastSuccessfulDetailGtkData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )

  useEffect(() => {
    if (detailGraphWithGtkData) {
      setLastSuccessfulDetailGtkData({
        details: detailGraphWithGtkData.details,
        dataKey: detailGraphDataKey
      })
    }
  }, [detailGraphDataKey, detailGraphWithGtkData])

  if (detailGraphWithGtkError) {
    return (
      <ApiErrorAlert
        error={detailGraphWithGtkError}
        title="Не удалось загрузить месторождения для детального показателя"
      />
    )
  }

  if (isInitialDetailGtkLoading) {
    return <Skeleton active paragraph={{ rows: 4 }} title={false} />
  }

  if (detailDepositDetails.length === 0) {
    return <div className={styles.emptyState}>Нет данных по месторождениям</div>
  }

  return (
    <div className={styles.detailDepositGraphGrid}>
      {detailDepositDetails.map((depositDetail) => (
        <article className={styles.depositGraphCard} key={depositDetail.gtk}>
          <h4 className={styles.depositGraphTitle}>
            {depositDetail.display_name ?? depositDetail.gtk}
          </h4>
          <GraphChart
            data={depositDetail.points}
            dataKey={`${detailDepositDetailsDataKey}:detail-deposits:${depositDetail.gtk}`}
            emptyText="Нет данных по месторождению"
            graphPeriod={graphPeriod}
            isUpdating={shouldShowDetailGtkUpdatingOverlay}
            seriesView={seriesView}
            size="compact"
          />
        </article>
      ))}
    </div>
  )
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
    isFetching: isGraphWithGtkFetching,
    isLoading: isGraphWithGtkLoading
  } = useGetGraphWithGtkQuery(graphQuery as GraphQuery, {
    skip: !graphQuery
  })
  const {
    currentData: graphWithDetailsData,
    error: graphWithDetailsError,
    isFetching: isGraphWithDetailsFetching,
    isLoading: isGraphWithDetailsLoading
  } = useGetGraphWithDetailsQuery(graphQuery as GraphQuery, {
    skip: !graphQuery
  })
  const [lastSuccessfulData, setLastSuccessfulData] = useState<
    LastSuccessfulGraphData | undefined
  >()
  const [lastSuccessfulGtkData, setLastSuccessfulGtkData] = useState<
    LastSuccessfulDetailsData<GraphWithGtkDetail> | undefined
  >()
  const [lastSuccessfulDetailsData, setLastSuccessfulDetailsData] = useState<
    LastSuccessfulDetailsData<GraphWithDetailsDetail> | undefined
  >()
  const data = currentData ?? lastSuccessfulData?.data ?? EMPTY_GRAPH_DATA
  const dataKey = currentData ? graphDataKey : lastSuccessfulData?.dataKey
  const measureUnit = data[0]?.measure_unit
  const isInitialLoading = isLoading && !currentData && !lastSuccessfulData?.data
  const shouldShowUpdatingOverlay = useDelayedFlag(
    isFetching && Boolean(lastSuccessfulData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )
  const depositDetails =
    graphWithGtkData?.details ?? lastSuccessfulGtkData?.details ?? EMPTY_GTK_DETAILS
  const depositDetailsDataKey = graphWithGtkData ? graphDataKey : lastSuccessfulGtkData?.dataKey
  const graphDetails =
    graphWithDetailsData?.details ?? lastSuccessfulDetailsData?.details ?? EMPTY_GRAPH_DETAILS
  const graphDetailsDataKey = graphWithDetailsData
    ? graphDataKey
    : lastSuccessfulDetailsData?.dataKey
  const isInitialGtkLoading =
    isGraphWithGtkLoading && !graphWithGtkData && !lastSuccessfulGtkData?.details
  const isInitialDetailsLoading =
    isGraphWithDetailsLoading && !graphWithDetailsData && !lastSuccessfulDetailsData?.details
  const shouldShowGtkUpdatingOverlay = useDelayedFlag(
    isGraphWithGtkFetching && Boolean(lastSuccessfulGtkData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )
  const shouldShowDetailsUpdatingOverlay = useDelayedFlag(
    isGraphWithDetailsFetching && Boolean(lastSuccessfulDetailsData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )

  useEffect(() => {
    if (currentData) {
      setLastSuccessfulData({
        data: currentData,
        dataKey: graphDataKey
      })
    }
  }, [currentData, graphDataKey])

  useEffect(() => {
    if (graphWithGtkData) {
      setLastSuccessfulGtkData({
        details: graphWithGtkData.details,
        dataKey: graphDataKey
      })
    }
  }, [graphWithGtkData, graphDataKey])

  useEffect(() => {
    if (graphWithDetailsData) {
      setLastSuccessfulDetailsData({
        details: graphWithDetailsData.details,
        dataKey: graphDataKey
      })
    }
  }, [graphWithDetailsData, graphDataKey])

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

    if (isInitialGtkLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} title={false} />
    }

    if (depositDetails.length === 0) {
      return <div className={styles.emptyState}>Нет данных по месторождениям</div>
    }

    return (
      <div className={styles.depositGraphGrid}>
        {depositDetails.map((detail) => (
          <article className={styles.depositGraphCard} key={detail.gtk}>
            <h3 className={styles.depositGraphTitle}>{detail.display_name ?? detail.gtk}</h3>
            <GraphChart
              data={detail.points}
              dataKey={`${depositDetailsDataKey}:${detail.gtk}`}
              graphPeriod={graphPeriod}
              isUpdating={shouldShowGtkUpdatingOverlay}
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

    if (isInitialDetailsLoading) {
      return <Skeleton active paragraph={{ rows: 4 }} title={false} />
    }

    if (graphDetails.length === 0) {
      return <div className={styles.emptyState}>Нет данных по детальным показателям</div>
    }

    return (
      <div className={styles.detailGraphList}>
        {graphDetails.map((detail) => (
          <article className={styles.detailGraphCard} key={detail.indicator}>
            <header className={styles.detailGraphHeader}>
              <h3 className={styles.detailGraphTitle}>
                <span>{detail.indicator}</span>
                {detail.unit ? <span className={styles.graphTitleUnit}>{detail.unit}</span> : null}
              </h3>
            </header>
            <GraphChart
              data={detail.points}
              dataKey={`${graphDetailsDataKey}:details:${detail.indicator}`}
              emptyText="Нет данных по детальному показателю"
              graphPeriod={graphPeriod}
              isUpdating={shouldShowDetailsUpdatingOverlay}
              seriesView={seriesView}
            />
            <DetailDepositGraphs
              detailIndicator={detail.indicator}
              graphPeriod={graphPeriod}
              parentGraphQuery={graphQuery}
              seriesView={seriesView}
            />
          </article>
        ))}
      </div>
    )
  }

  return (
    <div className={styles.graphPanelStack}>
      <section className={styles.graphPanel}>
        <header className={styles.graphHeader}>
          <div>
            <h2 className={styles.graphTitle}>
              <span>{query?.indicator ?? 'График'}</span>
              {measureUnit ? <span className={styles.graphTitleUnit}>{measureUnit}</span> : null}
            </h2>
          </div>
          <GraphControls
            graphPeriod={graphPeriod}
            seriesView={seriesView}
            onGraphPeriodChange={setGraphPeriod}
            onSeriesViewChange={updateSeriesView}
          />
        </header>
        {renderGraphContent()}
        <div className={styles.graphNestedSections}>
          <section className={styles.graphNestedSection}>
            {/* <h2 className={styles.graphSectionTitle}>Месторождения</h2> */}
            <div className={styles.graphSectionBody}>{renderDepositsContent()}</div>
          </section>
        </div>
      </section>
      <section className={styles.detailGraphsSection}>
        <h2 className={styles.detailGraphsSectionTitle}>Детальные показатели</h2>
        <div className={styles.detailGraphsSectionBody}>{renderDetailsContent()}</div>
      </section>
    </div>
  )
}
