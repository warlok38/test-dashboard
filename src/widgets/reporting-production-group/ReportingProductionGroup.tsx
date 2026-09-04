'use client'

import { CloseOutlined, UndoOutlined } from '@ant-design/icons'
import { Button, Input } from 'antd'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  XAxis,
  YAxis,
  type BarShapeProps,
  type XAxisTickContentProps
} from 'recharts'

import {
  getReportingStage,
  reportingMockData,
  type ReportingAssetKey,
  type ReportingDataset,
  type ReportingMetricOption,
  type ReportingProductionCard
} from '@/entities/reporting'
import { ChartFrame, ComparisonArrowLine } from '@/shared/ui'
import { useClickOutside } from '@/shared/hooks'
import { formatNumber } from '@/shared/utils'

import { getBarConnectorSegments, type BarConnectorPoint } from './lib/bar-connector-line'
import styles from './ReportingProductionGroup.module.css'

const ASSET_PARAM = 'asset'
const STAGE_PARAM = 'stage'
const DEFAULT_ASSET_KEY: ReportingAssetKey = 'group'
const PRODUCTION_BAR_SIZE = 60
const PRODUCTION_CHART_MARGIN = { top: 44, right: 20, left: 20, bottom: 0 } as const
const DESCRIPTION_PLACEHOLDER = 'Введите комментарий по отклонениям'

function getDataset(assetKey: string | null): ReportingDataset {
  return (
    reportingMockData.find((dataset) => dataset.assetKey === assetKey) ??
    reportingMockData.find((dataset) => dataset.assetKey === DEFAULT_ASSET_KEY) ??
    reportingMockData[0]
  )
}

export function ReportingProductionGroup() {
  const searchParams = useSearchParams()
  const dataset = getDataset(searchParams.get(ASSET_PARAM))
  const stage = getReportingStage(searchParams.get(STAGE_PARAM))
  const cards = getStageProductionCards(dataset, stage.metrics)

  return (
    <section className={styles.section}>
      <div className={styles.cardGrid}>
        {cards.map((card) => (
          <ProductionCard card={card} key={card.id} />
        ))}
      </div>
    </section>
  )
}

type ProductionCardProps = {
  card: ReportingProductionCard
}

const productionBarColors = ['#c3cfe1', '#cfd0d2', 'var(--color-kpi-fact)'] as const

function ProductionCard({ card }: ProductionCardProps) {
  const [barPoints, setBarPoints] = useState<BarConnectorPoint[]>([])
  const [savedDescription, setSavedDescription] = useState(card.description)
  const [draftDescription, setDraftDescription] = useState(card.description)
  const [editingDescription, setEditingDescription] = useState(false)
  const descriptionEditorRef = useRef<HTMLDivElement>(null)
  const hasBarData = card.bars.some((bar) => bar.value !== null)
  const hasSavedDescription = savedDescription.trim().length > 0

  useEffect(() => {
    setSavedDescription(card.description)
    setDraftDescription(card.description)
    setEditingDescription(false)
  }, [card.description])

  const handleBarGeometryChange = useCallback((index: number, point: BarConnectorPoint) => {
    setBarPoints((currentPoints) => {
      const currentPoint = currentPoints[index]

      if (currentPoint && isSameBarConnectorPoint(currentPoint, point)) {
        return currentPoints
      }

      const nextPoints = [...currentPoints]
      nextPoints[index] = point

      return nextPoints
    })
  }, [])

  const handleSaveDescription = () => {
    setSavedDescription(draftDescription)
    setEditingDescription(false)
  }

  const handleResetDescription = () => {
    setSavedDescription(card.description)
    setDraftDescription(card.description)
  }

  const handleCloseDescription = useCallback(() => {
    setDraftDescription(savedDescription)
    setEditingDescription(false)
  }, [savedDescription])

  useClickOutside(descriptionEditorRef, () => {
    if (editingDescription) {
      handleCloseDescription()
    }
  })

  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.chartColumn}>
          <div className={styles.cardHeader}>
            <h3>{card.title}</h3>
            {card.unit ? <span>{card.unit}</span> : null}
          </div>
          <div className={styles.chartFrame}>
            {card.deltas.length > 0 ? (
              <ComparisonArrowLine className={styles.comparisonTrack} deltas={card.deltas} />
            ) : null}
            {!hasBarData ? (
              <div className={styles.emptyBarValues}>
                {card.bars.map((bar, index) => (
                  <span key={`${bar.label}-${index}`}>-</span>
                ))}
              </div>
            ) : null}
            <ChartFrame className={styles.productionChartFrame}>
              {({ width, height }) => (
                <BarChart
                  barCategoryGap="20%"
                  barSize={PRODUCTION_BAR_SIZE}
                  data={card.bars}
                  height={height}
                  margin={PRODUCTION_CHART_MARGIN}
                  width={width}
                >
                  <XAxis
                    axisLine={{ stroke: 'var(--palette-dashboard-card-border)' }}
                    dataKey="label"
                    height={42}
                    interval={0}
                    tick={renderProductionTick}
                    tickLine={false}
                  />
                  <YAxis hide domain={[0, 'dataMax + 36']} />
                  {hasBarData ? (
                    <>
                      <ProductionBarConnectorLine
                        expectedPointCount={card.bars.length}
                        points={barPoints}
                      />
                      <Bar
                        dataKey="value"
                        isAnimationActive={false}
                        radius={[0, 0, 0, 0]}
                        shape={(props: BarShapeProps) => (
                          <ProductionBarShape
                            {...props}
                            onGeometryChange={handleBarGeometryChange}
                          />
                        )}
                      >
                        <LabelList content={renderProductionBarLabel} />
                      </Bar>
                    </>
                  ) : null}
                </BarChart>
              )}
            </ChartFrame>
          </div>
        </div>
        <div className={styles.textColumn}>
          {editingDescription ? (
            <div className={styles.descriptionEditor} ref={descriptionEditorRef}>
              <Input.TextArea
                autoFocus
                className={styles.descriptionTextarea}
                placeholder={DESCRIPTION_PLACEHOLDER}
                value={draftDescription}
                onChange={(event) => setDraftDescription(event.target.value)}
              />
              <div className={styles.descriptionActions}>
                <Button
                  icon={<CloseOutlined />}
                  size="small"
                  title="Закрыть"
                  onClick={handleCloseDescription}
                />
                <div className={styles.descriptionPrimaryActions}>
                  <Button
                    icon={<UndoOutlined />}
                    size="small"
                    title="Сбросить"
                    onClick={handleResetDescription}
                  />
                  <Button
                    className={styles.descriptionSaveButton}
                    size="small"
                    title="Сохранить"
                    type="primary"
                    onClick={handleSaveDescription}
                  >
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <button
              className={styles.descriptionPreview}
              type="button"
              onClick={() => setEditingDescription(true)}
            >
              <span
                className={hasSavedDescription ? styles.description : styles.descriptionPlaceholder}
              >
                {hasSavedDescription ? savedDescription : DESCRIPTION_PLACEHOLDER}
              </span>
            </button>
          )}
        </div>
      </div>
    </article>
  )
}

function getStageProductionCards(dataset: ReportingDataset, metrics: ReportingMetricOption[]) {
  return metrics.flatMap((metric) => {
    const card = dataset.productionCards.find((item) => item.metricKey === metric.key)

    return card ? [card] : []
  })
}

function renderProductionBarLabel(props: {
  x?: unknown
  y?: unknown
  width?: unknown
  value?: unknown
}) {
  const { x, y, width, value } = props

  if (
    typeof x !== 'number' ||
    typeof y !== 'number' ||
    typeof width !== 'number' ||
    typeof value !== 'number'
  ) {
    return null
  }

  return (
    <text
      fill="var(--color-text-strong)"
      fontSize={16}
      fontWeight={600}
      textAnchor="middle"
      x={x + width / 2}
      y={y - 6}
    >
      {formatNumber(value)}
    </text>
  )
}

type ProductionBarConnectorLineProps = {
  expectedPointCount: number
  points: BarConnectorPoint[]
}

function ProductionBarConnectorLine({
  expectedPointCount,
  points
}: ProductionBarConnectorLineProps) {
  const completePoints = Array.from({ length: expectedPointCount }, (_, index) => points[index])

  if (!completePoints.every(isBarConnectorPoint)) {
    return null
  }

  return (
    <g className={styles.barConnectorLine}>
      {getBarConnectorSegments(completePoints).map((segment) => (
        <line
          key={`${segment.x1}-${segment.y1}-${segment.x2}-${segment.y2}`}
          x1={segment.x1}
          x2={segment.x2}
          y1={segment.y1}
          y2={segment.y2}
        />
      ))}
    </g>
  )
}

type ProductionBarShapeProps = BarShapeProps & {
  onGeometryChange: (index: number, point: BarConnectorPoint) => void
}

function ProductionBarShape({ onGeometryChange, ...props }: ProductionBarShapeProps) {
  const payload = props.payload as ReportingProductionCard['bars'][number] | undefined
  const { index, width, x, y } = props

  useEffect(() => {
    if (
      typeof index === 'number' &&
      typeof x === 'number' &&
      typeof y === 'number' &&
      typeof width === 'number'
    ) {
      onGeometryChange(index, { x, y, width })
    }
  }, [index, onGeometryChange, width, x, y])

  return (
    <Rectangle
      fill={getBarFill(payload?.caption, props.index)}
      height={props.height}
      radius={props.radius}
      width={props.width}
      x={props.x}
      y={props.y}
    />
  )
}

function isSameBarConnectorPoint(left: BarConnectorPoint, right: BarConnectorPoint) {
  return left.x === right.x && left.y === right.y && left.width === right.width
}

function isBarConnectorPoint(point: BarConnectorPoint | undefined): point is BarConnectorPoint {
  return Boolean(point)
}

function renderProductionTick(props: XAxisTickContentProps) {
  const x = typeof props.x === 'number' ? props.x : Number(props.x)
  const y = typeof props.y === 'number' ? props.y : Number(props.y)
  const value = String(props.payload?.value ?? '')

  if (!Number.isFinite(x) || !Number.isFinite(y) || !value) {
    return null
  }

  const [label, period] = value.split(' ')

  return (
    <text className={styles.axisTick} textAnchor="middle" x={x} y={y + 10}>
      <tspan x={x}>{label}</tspan>
      <tspan dy="1.2em" x={x}>
        {period}
      </tspan>
    </text>
  )
}

function getBarFill(caption: string | undefined, index: number) {
  return productionBarColors[index] ?? (caption === 'БП' ? '#cfd0d2' : 'var(--color-kpi-fact)')
}
