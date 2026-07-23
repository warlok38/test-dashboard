'use client'

import {
  AppstoreOutlined,
  BarChartOutlined,
  CarOutlined,
  LineChartOutlined,
  PartitionOutlined,
  PercentageOutlined,
  SettingOutlined,
  VideoCameraFilled,
  VideoCameraOutlined,
  TruckOutlined
} from '@ant-design/icons'
import { Popover, Segmented, Tabs, Tooltip } from 'antd'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  useGetGraphQuery,
  useGetGraphWithDetailsQuery,
  useGetGraphWithGtkQuery,
  type GraphPeriod,
  type GraphPoint,
  type GraphQuery,
  type GraphWithGtkDetail
} from '@/entities/production-summary'
import { ApiErrorAlert, DEFAULT_CAMERA_STREAM, Empty, Loader } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'
import { GraphCameraOverlay } from './GraphCameraOverlay'
import {
  GRAPH_SERIES_CONFIGS,
  GraphChart,
  type GraphSeriesKey,
  type GraphSeriesView
} from './graph-chart'
import { type GraphYAxisValueRange } from './graph-chart/graph-y-axis'
import { SideActions } from './SideActions'

const GRAPH_LOADING_OVERLAY_DELAY_MS = 400
const MAIN_TAB_KEY = 'main'

const EMPTY_GRAPH_DATA: GraphPoint[] = []
const EMPTY_GTK_DETAILS: GraphWithGtkDetail[] = []
const DEPOSIT_LOADING_CARD_COUNT = 6

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

type GraphDetailMode = 'quarry' | 'stage' | 'park' | 'parkPercent' | 'block'
type DetailScaleMode = 'comparison' | 'dynamics'

const DETAIL_SCALE_MODE_OPTIONS: Array<{ label: ReactNode; value: DetailScaleMode }> = [
  {
    label: (
      <Tooltip
        title="Каждый график использует свою шкалу, чтобы лучше видеть колебания."
        mouseEnterDelay={0.5}
      >
        <span className={styles.detailScaleModeLabel}>Динамика</span>
      </Tooltip>
    ),
    value: 'dynamics'
  },
  {
    label: (
      <Tooltip
        title="Все графики используют общую шкалу, чтобы сравнивать значения."
        mouseEnterDelay={0.5}
      >
        <span className={styles.detailScaleModeLabel}>Сравнение</span>
      </Tooltip>
    ),
    value: 'comparison'
  }
]

const GRAPH_DETAIL_MODE_OPTIONS: Array<{
  icon: ReactNode
  label: string
  value: GraphDetailMode
}> = [
  {
    icon: <TruckOutlined />,
    label: 'Карьер',
    value: 'quarry'
  },
  {
    icon: <PartitionOutlined />,
    label: 'Этап',
    value: 'stage'
  },
  {
    icon: <CarOutlined />,
    label: 'Парк',
    value: 'park'
  },
  {
    icon: <PercentageOutlined />,
    label: 'Парк %',
    value: 'parkPercent'
  },
  {
    icon: <AppstoreOutlined />,
    label: 'Блок',
    value: 'block'
  }
]

type GraphPanelQuery = Pick<GraphQuery, 'indicator' | 'gtk' | 'shift' | 'production_date'>

type GraphPanelProps = {
  graphPeriod: GraphPeriod
  query: GraphPanelQuery | undefined
}

type GraphControlsProps = {
  activeDetailMode: GraphDetailMode
  detailScaleMode: DetailScaleMode
  isCameraVisible: boolean
  onDetailModeChange: (detailMode: GraphDetailMode) => void
  onDetailScaleModeChange: (detailScaleMode: DetailScaleMode) => void
  onCameraVisibleChange: (isVisible: boolean) => void
  seriesView: Record<GraphSeriesKey, GraphSeriesView>
  onSeriesViewChange: (seriesKey: GraphSeriesKey, view: GraphSeriesView) => void
}

type GraphTab = {
  indicator: string
  isDetail: boolean
  key: string
  unit?: string
}

type LastSuccessfulGraphData = {
  data: GraphPoint[]
  dataKey: string | undefined
  graphPeriod: GraphPeriod
}

type LastSuccessfulDetailsData<T> = {
  details: T[]
  dataKey: string | undefined
  graphPeriod: GraphPeriod
}

function getGraphQuery(query: GraphPanelQuery | undefined) {
  if (!query) {
    return undefined
  }

  return {
    indicator: query.indicator,
    ...(query.gtk ? { gtk: query.gtk } : {}),
    ...(query.shift ? { shift: query.shift } : {}),
    ...(query.production_date ? { production_date: query.production_date } : {})
  } satisfies GraphQuery
}

function getGraphDataKey(query: GraphQuery | undefined) {
  if (!query) {
    return undefined
  }

  return [query.gtk ?? '', query.indicator, query.shift ?? '', query.production_date ?? ''].join(
    ':'
  )
}

function getIndicatorQuery(
  query: GraphQuery | undefined,
  indicator: string
): GraphQuery | undefined {
  if (!query) {
    return undefined
  }

  return {
    ...query,
    indicator
  }
}

function getDetailTabKey(indicator: string) {
  return `detail:${indicator}`
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function getSharedGraphValueRange(details: GraphWithGtkDetail[]): GraphYAxisValueRange | undefined {
  const values = details.flatMap((detail) =>
    detail.points.flatMap((point) => [point.fact, point.plan]).filter(isFiniteNumber)
  )
  const nonZeroValues = values.filter((value) => value !== 0)

  if (nonZeroValues.length === 0) {
    return undefined
  }

  return {
    hasZero: values.some((value) => value === 0),
    max: Math.max(...nonZeroValues),
    min: Math.min(...nonZeroValues)
  }
}

function GraphControls({
  activeDetailMode,
  detailScaleMode,
  isCameraVisible,
  onDetailModeChange,
  onDetailScaleModeChange,
  onCameraVisibleChange,
  seriesView,
  onSeriesViewChange
}: GraphControlsProps) {
  const content = (
    <div className={styles.graphSettingsMenu}>
      <div className={styles.graphViewControls}>
        {GRAPH_SERIES_CONFIGS.map((series) => (
          <div className={styles.seriesViewControl} key={series.key}>
            <span className={styles.seriesViewLabel}>Вид: {series.name.toLowerCase()}</span>
            <Segmented
              options={SERIES_VIEW_OPTIONS}
              size="small"
              value={seriesView[series.key]}
              onChange={(value) => onSeriesViewChange(series.key, value as GraphSeriesView)}
            />
          </div>
        ))}
        <div className={styles.seriesViewControl}>
          <span className={styles.seriesViewLabel}>Детали</span>
          <Segmented<DetailScaleMode>
            options={DETAIL_SCALE_MODE_OPTIONS}
            size="small"
            value={detailScaleMode}
            onChange={onDetailScaleModeChange}
          />
        </div>
      </div>
    </div>
  )
  const cameraToggleIcon = isCameraVisible ? <VideoCameraFilled /> : <VideoCameraOutlined />

  return (
    <SideActions
      actions={[
        {
          icon: <SettingOutlined />,
          key: 'settings',
          label: 'Настройки отображения',
          render: (button) => (
            <Popover
              classNames={{
                content: styles.graphSettingsPopoverContent,
                root: styles.graphSettingsPopoverRoot
              }}
              content={content}
              placement="leftTop"
              trigger={['click']}
            >
              {button}
            </Popover>
          )
        },
        {
          icon: <VideoCameraOutlined />,
          key: 'cameras',
          label: isCameraVisible ? 'Выключить камеры' : 'Включить камеры',
          render: () => (
            <button
              className={`${styles.cameraToggleButton} ${
                isCameraVisible ? styles.cameraToggleButtonActive : ''
              }`}
              type="button"
              onClick={() => onCameraVisibleChange(!isCameraVisible)}
            >
              {cameraToggleIcon}
            </button>
          )
        }
      ]}
    >
      <Segmented<GraphDetailMode>
        className={styles.graphDetailModeSelector}
        options={GRAPH_DETAIL_MODE_OPTIONS.map((option) => ({
          label: (
            <Tooltip placement="left" title={option.label}>
              <span className={styles.graphDetailModeIcon}>{option.icon}</span>
            </Tooltip>
          ),
          value: option.value
        }))}
        size="small"
        value={activeDetailMode}
        vertical
        onChange={onDetailModeChange}
      />
    </SideActions>
  )
}

function GraphTabLabel({
  isDetailsLoading,
  indicator,
  isDetail,
  unit
}: {
  isDetailsLoading?: boolean
  indicator: string
  isDetail: boolean
  unit?: string
}) {
  return (
    <span className={isDetail ? styles.graphTabLabelDetail : styles.graphTabLabel}>
      <span>{indicator}</span>
      {unit ? <span className={styles.graphTabUnit}>{unit}</span> : null}
      {isDetailsLoading ? <Loader size="small" /> : null}
    </span>
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

function GraphTabContent({
  detailScaleMode,
  graphPeriod,
  indicator,
  onMeasureUnitChange,
  parentGraphQuery,
  seriesView
}: {
  detailScaleMode: DetailScaleMode
  graphPeriod: GraphPeriod
  indicator: string
  onMeasureUnitChange?: (measureUnit: string | undefined) => void
  parentGraphQuery: GraphQuery | undefined
  seriesView: Record<GraphSeriesKey, GraphSeriesView>
}) {
  const graphQuery = useMemo(
    () => getIndicatorQuery(parentGraphQuery, indicator),
    [indicator, parentGraphQuery]
  )
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
  const [lastSuccessfulData, setLastSuccessfulData] = useState<
    LastSuccessfulGraphData | undefined
  >()
  const [lastSuccessfulGtkData, setLastSuccessfulGtkData] = useState<
    LastSuccessfulDetailsData<GraphWithGtkDetail> | undefined
  >()
  const data = currentData ?? lastSuccessfulData?.data ?? EMPTY_GRAPH_DATA
  const dataKey = currentData ? graphDataKey : lastSuccessfulData?.dataKey
  const displayedGraphPeriod = currentData
    ? graphPeriod
    : (lastSuccessfulData?.graphPeriod ?? graphPeriod)
  const measureUnit = data[0]?.measure_unit
  const isInitialLoading = isLoading && !currentData && !lastSuccessfulData?.data
  const shouldShowUpdatingOverlay = useDelayedFlag(
    isFetching && Boolean(lastSuccessfulData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )
  const depositDetails =
    graphWithGtkData?.details ?? lastSuccessfulGtkData?.details ?? EMPTY_GTK_DETAILS
  const depositDetailsDataKey = graphWithGtkData ? graphDataKey : lastSuccessfulGtkData?.dataKey
  const depositGraphPeriod = graphWithGtkData
    ? graphPeriod
    : (lastSuccessfulGtkData?.graphPeriod ?? graphPeriod)
  const depositValueRange = useMemo(
    () => getSharedGraphValueRange(depositDetails),
    [depositDetails]
  )
  const sharedDepositValueRange = detailScaleMode === 'comparison' ? depositValueRange : undefined
  const isInitialGtkLoading =
    isGraphWithGtkLoading && !graphWithGtkData && !lastSuccessfulGtkData?.details
  const shouldShowGtkUpdatingOverlay = useDelayedFlag(
    isGraphWithGtkFetching && Boolean(lastSuccessfulGtkData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )

  useEffect(() => {
    if (currentData) {
      setLastSuccessfulData({
        data: currentData,
        dataKey: graphDataKey,
        graphPeriod
      })
    }
  }, [currentData, graphDataKey, graphPeriod])

  useEffect(() => {
    if (graphWithGtkData) {
      setLastSuccessfulGtkData({
        details: graphWithGtkData.details,
        dataKey: graphDataKey,
        graphPeriod
      })
    }
  }, [graphWithGtkData, graphDataKey, graphPeriod])

  useEffect(() => {
    onMeasureUnitChange?.(measureUnit)
  }, [measureUnit, onMeasureUnitChange])

  const renderGraphContent = () => {
    if (!graphQuery) {
      return <div className={styles.emptyState}>Нет показателя для графика</div>
    }

    if (error) {
      return <ApiErrorAlert error={error} title="Не удалось загрузить график" />
    }

    return (
      <div className={styles.graphMainChartArea}>
        <GraphChart
          data={data}
          dataKey={dataKey}
          emptyText="Нет данных для графика"
          graphPeriod={displayedGraphPeriod}
          isUpdating={isInitialLoading || shouldShowUpdatingOverlay}
          normalizeValueRange
          seriesView={seriesView}
          updatingText={isInitialLoading ? 'Загрузка...' : 'Обновление...'}
        />
      </div>
    )
  }

  const renderDepositsContent = () => {
    if (graphWithGtkError) {
      if (error) {
        return null
      }
      return <ApiErrorAlert error={graphWithGtkError} title="Не удалось загрузить детали" />
    }

    if (depositDetails.length === 0) {
      if (isInitialGtkLoading) {
        return (
          <div className={styles.depositGraphGrid}>
            {Array.from({ length: DEPOSIT_LOADING_CARD_COUNT }, (_, index) => (
              <article className={styles.depositGraphCard} key={index}>
                <h3 className={styles.depositGraphTitle}>
                  <span className={styles.depositGraphTitlePlaceholder}>Загрузка...</span>
                </h3>
                <GraphChart
                  data={EMPTY_GRAPH_DATA}
                  dataKey={`${graphDataKey}:deposit-loading:${index}`}
                  emptyText="Нет данных"
                  graphPeriod={graphPeriod}
                  isUpdating
                  seriesView={seriesView}
                  size="compact"
                  updatingText="Загрузка..."
                />
              </article>
            ))}
          </div>
        )
      }

      return <Empty />
    }

    return (
      <div className={styles.depositGraphGrid}>
        {depositDetails.map((detail) => (
          <article className={styles.depositGraphCard} key={detail.gtk}>
            <h3 className={styles.depositGraphTitle}>{detail.display_name ?? detail.gtk}</h3>
            <GraphChart
              data={detail.points}
              dataKey={`${depositDetailsDataKey}:${detail.gtk}`}
              graphPeriod={depositGraphPeriod}
              isUpdating={shouldShowGtkUpdatingOverlay}
              normalizeValueRange
              normalizedValueRange={sharedDepositValueRange}
              seriesView={seriesView}
              size="compact"
              updatingText="Обновление..."
            />
          </article>
        ))}
      </div>
    )
  }

  return (
    <>
      {renderGraphContent()}
      <div className={styles.graphNestedSections}>
        <section className={styles.graphNestedSection}>
          <div className={styles.graphSectionBody}>{renderDepositsContent()}</div>
        </section>
      </div>
    </>
  )
}

function GraphTabsPanel({ graphPeriod, query }: GraphPanelProps) {
  const [activeTabKey, setActiveTabKey] = useState(MAIN_TAB_KEY)
  const [visitedTabKeys, setVisitedTabKeys] = useState<Set<string>>(() => new Set([MAIN_TAB_KEY]))
  const [activeDetailMode, setActiveDetailMode] = useState<GraphDetailMode>(
    GRAPH_DETAIL_MODE_OPTIONS[0].value
  )
  const [detailScaleMode, setDetailScaleMode] = useState<DetailScaleMode>('dynamics')
  const [mainMeasureUnit, setMainMeasureUnit] = useState<string | undefined>()
  const [isCameraVisible, setIsCameraVisible] = useState(false)
  const [seriesView, setSeriesView] = useState<Record<GraphSeriesKey, GraphSeriesView>>({
    plan: 'bar',
    fact: 'bar'
  })
  const graphQuery = useMemo(() => getGraphQuery(query), [query])
  const graphDataKey = useMemo(() => getGraphDataKey(graphQuery), [graphQuery])
  const {
    currentData: graphWithDetailsData,
    error: graphWithDetailsError,
    isFetching: isGraphWithDetailsFetching,
    isLoading: isGraphWithDetailsLoading
  } = useGetGraphWithDetailsQuery(graphQuery as GraphQuery, {
    skip: !graphQuery
  })

  useEffect(() => {
    setActiveTabKey(MAIN_TAB_KEY)
    setVisitedTabKeys(new Set([MAIN_TAB_KEY]))
    setMainMeasureUnit(undefined)
  }, [graphDataKey])

  useEffect(() => {
    setVisitedTabKeys((currentKeys) => {
      if (currentKeys.has(activeTabKey)) {
        return currentKeys
      }

      return new Set([...Array.from(currentKeys), activeTabKey])
    })
  }, [activeTabKey])

  const updateSeriesView = (seriesKey: GraphSeriesKey, view: GraphSeriesView) => {
    setSeriesView((currentView) => ({
      ...currentView,
      [seriesKey]: view
    }))
  }

  const tabs = useMemo<GraphTab[]>(() => {
    if (!query?.indicator) {
      return []
    }

    const usedIndicators = new Set([query.indicator])
    const detailTabs =
      graphWithDetailsData?.details
        .filter((detail) => {
          if (usedIndicators.has(detail.indicator)) {
            return false
          }

          usedIndicators.add(detail.indicator)

          return true
        })
        .map((detail) => ({
          indicator: detail.indicator,
          isDetail: true,
          key: getDetailTabKey(detail.indicator),
          unit: detail.unit
        })) ?? []

    return [
      {
        indicator: query.indicator,
        isDetail: false,
        key: MAIN_TAB_KEY,
        unit: mainMeasureUnit
      },
      ...detailTabs
    ]
  }, [graphWithDetailsData?.details, mainMeasureUnit, query?.indicator])

  const activeTab = tabs.find((tab) => tab.key === activeTabKey) ?? tabs[0]
  const isDetailsLoading = isGraphWithDetailsLoading || isGraphWithDetailsFetching
  const tabItems = tabs.map((tab) => ({
    key: tab.key,
    label: (
      <GraphTabLabel
        indicator={tab.indicator}
        isDetail={tab.isDetail}
        isDetailsLoading={tab.key === MAIN_TAB_KEY && isDetailsLoading}
        unit={tab.unit}
      />
    ),
    children: visitedTabKeys.has(tab.key) ? (
      <GraphTabContent
        detailScaleMode={detailScaleMode}
        graphPeriod={graphPeriod}
        indicator={tab.indicator}
        onMeasureUnitChange={tab.key === MAIN_TAB_KEY ? setMainMeasureUnit : undefined}
        parentGraphQuery={graphQuery}
        seriesView={seriesView}
      />
    ) : null
  }))

  const renderDetailsStatus = () => {
    if (graphWithDetailsError) {
      return (
        <div className={styles.graphDetailsStatus}>
          <span>Не удалось загрузить список детальных показателей</span>
        </div>
      )
    }

    return null
  }

  const detailsStatus = renderDetailsStatus()
  const tabBarExtraContent = detailsStatus ? (
    <div className={styles.graphTabsExtra}>{detailsStatus}</div>
  ) : undefined

  if (!query?.indicator) {
    return <div className={styles.emptyState}>Нет показателя для графика</div>
  }

  return (
    <div className={styles.graphPanelStack}>
      <section className={styles.graphPanel}>
        <div className={styles.graphPanelContent}>
          <Tabs
            activeKey={activeTab?.key}
            className={styles.graphTabs}
            destroyOnHidden={false}
            items={tabItems}
            tabBarExtraContent={tabBarExtraContent}
            onChange={setActiveTabKey}
          />
          {isCameraVisible ? (
            <GraphCameraOverlay
              description={DEFAULT_CAMERA_STREAM.description}
              detailSrc={DEFAULT_CAMERA_STREAM.detailSrc}
              previewSrc={DEFAULT_CAMERA_STREAM.previewSrc}
              title={DEFAULT_CAMERA_STREAM.title}
            />
          ) : null}
        </div>
        <GraphControls
          activeDetailMode={activeDetailMode}
          detailScaleMode={detailScaleMode}
          isCameraVisible={isCameraVisible}
          seriesView={seriesView}
          onCameraVisibleChange={setIsCameraVisible}
          onDetailModeChange={setActiveDetailMode}
          onDetailScaleModeChange={setDetailScaleMode}
          onSeriesViewChange={updateSeriesView}
        />
      </section>
    </div>
  )
}

export function GraphPanel(props: GraphPanelProps) {
  return <GraphTabsPanel {...props} />
}
