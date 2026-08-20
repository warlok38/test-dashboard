'use client'

import {
  AppstoreOutlined,
  BarChartOutlined,
  CarOutlined,
  LineChartOutlined,
  PartitionOutlined,
  PercentageOutlined,
  SettingOutlined,
  TruckOutlined
} from '@ant-design/icons'
import { Popover, Segmented, Tabs, Tooltip } from 'antd'
import { useEffect, useMemo, useState, type ReactNode } from 'react'

import {
  useGetGraphByModeQuery,
  useGetGraphMappingQuery,
  type GraphByModeDetail,
  type GraphByModeQuery,
  type GraphMappingItem,
  type GraphMappingResponse,
  type GraphMode,
  type GraphPeriod,
  type GraphPoint
} from '@/entities/production-summary'
import { ApiErrorAlert, Empty, Loader } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'
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
const EMPTY_MODE_DETAILS: GraphByModeDetail[] = []
const DETAIL_LOADING_CARD_COUNT = 6

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

const GRAPH_DETAIL_MODE_OPTIONS: Record<
  GraphMode,
  {
    icon: ReactNode
    label: string
    value: GraphMode
  }
> = {
  gtk: {
    icon: <TruckOutlined />,
    label: 'Месторождения',
    value: 'gtk'
  },
  quarry: {
    icon: <AppstoreOutlined />,
    label: 'Карьер',
    value: 'quarry'
  },
  stage: {
    icon: <PartitionOutlined />,
    label: 'Этап',
    value: 'stage'
  },
  park: {
    icon: <CarOutlined />,
    label: 'Парк',
    value: 'park'
  },
  parkPercent: {
    icon: <PercentageOutlined />,
    label: 'Парк %',
    value: 'parkPercent'
  },
  block: {
    icon: <AppstoreOutlined />,
    label: 'Блок',
    value: 'block'
  }
}

type GraphPanelQuery = Pick<
  GraphByModeQuery,
  'date_from' | 'date_to' | 'gtk_name' | 'indicator' | 'period' | 'production_date' | 'shift'
>

type GraphPanelProps = {
  graphPeriod: GraphPeriod
  query: GraphPanelQuery | undefined
}

type GraphControlsProps = {
  activeDetailMode: GraphMode | undefined
  detailModeOptions: GraphMode[]
  detailScaleMode: DetailScaleMode
  onDetailModeChange: (detailMode: GraphMode) => void
  onDetailScaleModeChange: (detailScaleMode: DetailScaleMode) => void
  seriesView: Record<GraphSeriesKey, GraphSeriesView>
  onSeriesViewChange: (seriesKey: GraphSeriesKey, view: GraphSeriesView) => void
  showDetailModeSelector: boolean
}

type GraphTab = {
  indicator: string
  isDetail: boolean
  key: string
  modes: GraphMode[]
  unit?: string
}

type LastSuccessfulGraphData = {
  detail: GraphByModeDetail | undefined
  dataKey: string | undefined
  graphPeriod: GraphPeriod
}

type LastSuccessfulDetailsData = {
  details: GraphByModeDetail[]
  dataKey: string | undefined
  graphPeriod: GraphPeriod
}

function getGraphTabs(mapping: GraphMappingResponse | undefined, indicator: string): GraphTab[] {
  const mappingItems =
    mapping?.[indicator] ??
    Object.values(mapping ?? {}).find((items) => items.some((item) => item.indicator === indicator))

  return (
    mappingItems?.map((item, index) => ({
      indicator: item.indicator,
      isDetail: index > 0,
      key: index === 0 ? MAIN_TAB_KEY : getDetailTabKey(item.indicator),
      modes: item.modes,
      unit: item.unit
    })) ?? [
      {
        indicator,
        isDetail: false,
        key: MAIN_TAB_KEY,
        modes: ['gtk'],
        unit: undefined
      }
    ]
  )
}

function getStableDetailModes(
  activeTab: GraphTab | undefined,
  tabs: GraphTab[],
  isGeneralPage: boolean
) {
  if (!activeTab || isGeneralPage) {
    return []
  }

  const availableModes = new Set(activeTab.modes.filter((mode) => mode !== 'gtk'))
  const groupModes = tabs[0]?.modes.filter((mode) => mode !== 'gtk') ?? []
  const orderedModes = groupModes.filter((mode) => availableModes.has(mode))
  const modesMissingFromMainTab = activeTab.modes.filter(
    (mode) => mode !== 'gtk' && !orderedModes.includes(mode)
  )

  return [...orderedModes, ...modesMissingFromMainTab]
}

function getBaseGraphQuery(
  query: GraphPanelQuery | undefined,
  tab: GraphMappingItem | GraphTab | undefined
): GraphByModeQuery | undefined {
  if (!query || !tab) {
    return undefined
  }

  return {
    indicator: tab.indicator,
    ...(query.gtk_name ? { gtk_name: query.gtk_name } : {}),
    ...(query.shift ? { shift: query.shift } : {}),
    ...(query.production_date ? { production_date: query.production_date } : {}),
    ...(query.period ? { period: query.period } : {}),
    ...(query.date_from ? { date_from: query.date_from } : {}),
    ...(query.date_to ? { date_to: query.date_to } : {})
  }
}

function getDetailGraphQuery(
  query: GraphPanelQuery | undefined,
  tab: GraphTab | undefined,
  mode: GraphMode | undefined
): GraphByModeQuery | undefined {
  const baseQuery = getBaseGraphQuery(query, tab)

  if (!baseQuery || !mode) {
    return undefined
  }

  return {
    ...baseQuery,
    mode
  }
}

function getGraphDataKey(query: GraphByModeQuery | undefined) {
  if (!query) {
    return undefined
  }

  return [
    query.gtk_name ?? '',
    query.indicator,
    query.mode ?? '',
    query.shift ?? '',
    query.production_date ?? '',
    query.period ?? '',
    query.date_from ?? '',
    query.date_to ?? ''
  ].join(':')
}

function getDetailTabKey(indicator: string) {
  return `detail:${indicator}`
}

function isFiniteNumber(value: number | null | undefined): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function getSharedGraphValueRange(details: GraphByModeDetail[]): GraphYAxisValueRange | undefined {
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
  detailModeOptions,
  detailScaleMode,
  onDetailModeChange,
  onDetailScaleModeChange,
  seriesView,
  onSeriesViewChange,
  showDetailModeSelector
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
  const actions: Array<{
    icon: ReactNode
    key: string
    label: string
    render?: (button: ReactNode) => ReactNode
  }> = [
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
    }
  ]

  return (
    <SideActions actions={actions}>
      {showDetailModeSelector && activeDetailMode ? (
        <Segmented<GraphMode>
          className={styles.graphDetailModeSelector}
          options={detailModeOptions.map((mode) => {
            const option = GRAPH_DETAIL_MODE_OPTIONS[mode]

            return {
              label: (
                <Tooltip placement="left" title={option.label}>
                  <span className={styles.graphDetailModeIcon}>{option.icon}</span>
                </Tooltip>
              ),
              value: option.value
            }
          })}
          size="small"
          value={activeDetailMode}
          vertical
          onChange={onDetailModeChange}
        />
      ) : null}
    </SideActions>
  )
}

function GraphTabLabel({
  indicator,
  isDetail,
  isMappingLoading,
  unit
}: {
  indicator: string
  isDetail: boolean
  isMappingLoading?: boolean
  unit?: string
}) {
  return (
    <span className={isDetail ? styles.graphTabLabelDetail : styles.graphTabLabel}>
      <span>{indicator}</span>
      {unit ? <span className={styles.graphTabUnit}>{unit}</span> : null}
      {isMappingLoading ? <Loader size="small" /> : null}
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
  detailMode,
  detailScaleMode,
  graphPeriod,
  onMeasureUnitChange,
  parentGraphQuery,
  seriesView,
  tab
}: {
  detailMode: GraphMode | undefined
  detailScaleMode: DetailScaleMode
  graphPeriod: GraphPeriod
  onMeasureUnitChange?: (measureUnit: string | undefined) => void
  parentGraphQuery: GraphPanelQuery | undefined
  seriesView: Record<GraphSeriesKey, GraphSeriesView>
  tab: GraphTab
}) {
  const mainGraphQuery = useMemo(
    () => getBaseGraphQuery(parentGraphQuery, tab),
    [parentGraphQuery, tab]
  )
  const detailGraphQuery = useMemo(
    () => getDetailGraphQuery(parentGraphQuery, tab, detailMode),
    [detailMode, parentGraphQuery, tab]
  )
  const mainGraphDataKey = useMemo(() => getGraphDataKey(mainGraphQuery), [mainGraphQuery])
  const detailGraphDataKey = useMemo(() => getGraphDataKey(detailGraphQuery), [detailGraphQuery])
  const {
    currentData: mainGraphData,
    error: mainGraphError,
    isFetching: isMainGraphFetching,
    isLoading: isMainGraphLoading,
    refetch: refetchMainGraph
  } = useGetGraphByModeQuery(mainGraphQuery as GraphByModeQuery, {
    skip: !mainGraphQuery
  })
  const {
    currentData: detailGraphData,
    error: detailGraphError,
    isFetching: isDetailGraphFetching,
    isLoading: isDetailGraphLoading,
    refetch: refetchDetailGraph
  } = useGetGraphByModeQuery(detailGraphQuery as GraphByModeQuery, {
    skip: !detailGraphQuery
  })
  const [lastSuccessfulMainData, setLastSuccessfulMainData] = useState<
    LastSuccessfulGraphData | undefined
  >()
  const [lastSuccessfulDetailData, setLastSuccessfulDetailData] = useState<
    LastSuccessfulDetailsData | undefined
  >()
  const mainDetail = mainGraphData?.details[0] ?? lastSuccessfulMainData?.detail
  const data = mainDetail?.points ?? EMPTY_GRAPH_DATA
  const dataKey = mainGraphData ? mainGraphDataKey : lastSuccessfulMainData?.dataKey
  const displayedGraphPeriod = mainGraphData
    ? graphPeriod
    : (lastSuccessfulMainData?.graphPeriod ?? graphPeriod)
  const measureUnit = mainDetail?.unit ?? tab.unit
  const isInitialLoading = isMainGraphLoading && !mainGraphData && !lastSuccessfulMainData?.detail
  const shouldShowUpdatingOverlay = useDelayedFlag(
    isMainGraphFetching && Boolean(lastSuccessfulMainData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )
  const detailGraphs =
    detailGraphData?.details ?? lastSuccessfulDetailData?.details ?? EMPTY_MODE_DETAILS
  const displayedDetailDataKey = detailGraphData
    ? detailGraphDataKey
    : lastSuccessfulDetailData?.dataKey
  const displayedDetailGraphPeriod = detailGraphData
    ? graphPeriod
    : (lastSuccessfulDetailData?.graphPeriod ?? graphPeriod)
  const detailValueRange = useMemo(() => getSharedGraphValueRange(detailGraphs), [detailGraphs])
  const sharedDetailValueRange = detailScaleMode === 'comparison' ? detailValueRange : undefined
  const isInitialDetailsLoading =
    isDetailGraphLoading && !detailGraphData && !lastSuccessfulDetailData?.details
  const shouldShowDetailsUpdatingOverlay = useDelayedFlag(
    isDetailGraphFetching && Boolean(lastSuccessfulDetailData),
    GRAPH_LOADING_OVERLAY_DELAY_MS
  )

  useEffect(() => {
    if (mainGraphData) {
      setLastSuccessfulMainData({
        detail: mainGraphData.details[0],
        dataKey: mainGraphDataKey,
        graphPeriod
      })
    }
  }, [mainGraphData, mainGraphDataKey, graphPeriod])

  useEffect(() => {
    if (detailGraphData) {
      setLastSuccessfulDetailData({
        details: detailGraphData.details,
        dataKey: detailGraphDataKey,
        graphPeriod
      })
    }
  }, [detailGraphData, detailGraphDataKey, graphPeriod])

  useEffect(() => {
    onMeasureUnitChange?.(measureUnit)
  }, [measureUnit, onMeasureUnitChange])

  const renderGraphContent = () => {
    if (!mainGraphQuery) {
      return <div className={styles.emptyState}>Нет показателя для графика</div>
    }

    if (mainGraphError) {
      return (
        <ApiErrorAlert
          error={mainGraphError}
          title="Не удалось загрузить график"
          endpoint="graphByMode"
          onRetry={refetchMainGraph}
        />
      )
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

  const renderDetailsContent = () => {
    if (!detailGraphQuery) {
      return null
    }

    if (detailGraphError) {
      if (mainGraphError) {
        return null
      }

      return (
        <ApiErrorAlert
          error={detailGraphError}
          title="Не удалось загрузить детальные графики"
          endpoint="graphByMode"
          onRetry={refetchDetailGraph}
        />
      )
    }

    if (detailGraphs.length === 0) {
      if (isInitialDetailsLoading) {
        return (
          <div className={styles.depositGraphGrid}>
            {Array.from({ length: DETAIL_LOADING_CARD_COUNT }, (_, index) => (
              <article className={styles.depositGraphCard} key={index}>
                <h3 className={styles.depositGraphTitle}>
                  <span className={styles.depositGraphTitlePlaceholder}>Загрузка...</span>
                </h3>
                <GraphChart
                  data={EMPTY_GRAPH_DATA}
                  dataKey={`${detailGraphDataKey}:detail-loading:${index}`}
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

      return <Empty description="Нет детальных данных" />
    }

    return (
      <div className={styles.depositGraphGrid}>
        {detailGraphs.map((detail) => (
          <article className={styles.depositGraphCard} key={detail.gtk}>
            <h3 className={styles.depositGraphTitle}>{detail.display_name ?? detail.gtk}</h3>
            <GraphChart
              data={detail.points}
              dataKey={`${displayedDetailDataKey}:${detail.gtk}`}
              graphPeriod={displayedDetailGraphPeriod}
              isUpdating={shouldShowDetailsUpdatingOverlay}
              normalizeValueRange
              normalizedValueRange={sharedDetailValueRange}
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
          <div className={styles.graphSectionBody}>{renderDetailsContent()}</div>
        </section>
      </div>
    </>
  )
}

function GraphTabsPanel({ graphPeriod, query }: GraphPanelProps) {
  const [activeTabKey, setActiveTabKey] = useState(MAIN_TAB_KEY)
  const [visitedTabKeys, setVisitedTabKeys] = useState<Set<string>>(() => new Set([MAIN_TAB_KEY]))
  const [activeDetailMode, setActiveDetailMode] = useState<GraphMode | undefined>()
  const [detailScaleMode, setDetailScaleMode] = useState<DetailScaleMode>('dynamics')
  const [mainMeasureUnit, setMainMeasureUnit] = useState<string | undefined>()
  const [seriesView, setSeriesView] = useState<Record<GraphSeriesKey, GraphSeriesView>>({
    plan: 'bar',
    fact: 'bar'
  })
  const isGeneralPage = !query?.gtk_name
  const {
    currentData: graphMapping,
    error: graphMappingError,
    isFetching: isGraphMappingFetching,
    isLoading: isGraphMappingLoading
  } = useGetGraphMappingQuery()

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

    return getGraphTabs(graphMapping, query.indicator)
  }, [graphMapping, query?.indicator])

  const selectedTab = tabs.find((tab) => tab.key === activeTabKey)
  const activeTab = selectedTab ?? tabs[0]
  const activeGroupIndicator = tabs[0]?.indicator
  const selectableDetailModes = useMemo(
    () => getStableDetailModes(activeTab, tabs, isGeneralPage),
    [activeTab, isGeneralPage, tabs]
  )
  const selectedDetailMode = isGeneralPage ? 'gtk' : activeDetailMode

  useEffect(() => {
    if (!activeTab) {
      return
    }

    const nextModes = isGeneralPage
      ? activeTab.modes
      : activeTab.modes.filter((mode) => mode !== 'gtk')

    if (isGeneralPage) {
      setActiveDetailMode('gtk')

      return
    }

    setActiveDetailMode((currentMode) =>
      currentMode && nextModes.includes(currentMode) ? currentMode : nextModes[0]
    )
  }, [activeTab, isGeneralPage])

  useEffect(() => {
    if (selectedTab || tabs.length === 0) {
      return
    }

    setActiveTabKey(tabs[0].key)
  }, [selectedTab, tabs])

  useEffect(() => {
    setMainMeasureUnit(undefined)
  }, [activeGroupIndicator])

  const isMappingLoading = isGraphMappingLoading || isGraphMappingFetching
  const tabItems = tabs.map((tab) => ({
    key: tab.key,
    label: (
      <GraphTabLabel
        indicator={tab.indicator}
        isDetail={tab.isDetail}
        isMappingLoading={tab.key === MAIN_TAB_KEY && isMappingLoading}
        unit={tab.key === MAIN_TAB_KEY ? (mainMeasureUnit ?? tab.unit) : tab.unit}
      />
    ),
    children: visitedTabKeys.has(tab.key) ? (
      <GraphTabContent
        detailMode={selectedDetailMode}
        detailScaleMode={detailScaleMode}
        graphPeriod={graphPeriod}
        onMeasureUnitChange={tab.key === MAIN_TAB_KEY ? setMainMeasureUnit : undefined}
        parentGraphQuery={query}
        seriesView={seriesView}
        tab={tab}
      />
    ) : null
  }))

  const renderMappingStatus = () => {
    if (graphMappingError) {
      return (
        <div className={styles.graphDetailsStatus}>
          <span>Не удалось загрузить список показателей</span>
        </div>
      )
    }

    return null
  }

  const mappingStatus = renderMappingStatus()
  const tabBarExtraContent = mappingStatus ? (
    <div className={styles.graphTabsExtra}>{mappingStatus}</div>
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
        </div>
        <GraphControls
          activeDetailMode={activeDetailMode}
          detailModeOptions={selectableDetailModes}
          detailScaleMode={detailScaleMode}
          seriesView={seriesView}
          showDetailModeSelector={!isGeneralPage && selectableDetailModes.length > 0}
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
