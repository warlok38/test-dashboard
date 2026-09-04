'use client'

import { useCallback, useEffect, useState } from 'react'
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

import type { ReportingProductionCard } from '@/entities/reporting'
import { ChartFrame, ComparisonArrowLine } from '@/shared/ui'
import { formatNumber } from '@/shared/utils'

import { getBarConnectorSegments, type BarConnectorPoint } from '../lib/bar-connector-line'
import {
  PRODUCTION_BAR_SIZE,
  PRODUCTION_CHART_MARGIN,
  getProductionBarFill,
  isBarConnectorPoint,
  isSameBarConnectorPoint
} from '../lib/production-chart'
import styles from '../ReportingProductionGroup.module.css'

type ProductionChartProps = {
  card: ReportingProductionCard
}

export function ProductionChart({ card }: ProductionChartProps) {
  const [barPoints, setBarPoints] = useState<BarConnectorPoint[]>([])
  const hasBarData = card.bars.some((bar) => bar.value !== null)

  useEffect(() => {
    setBarPoints([])
  }, [card.id, card.bars])

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

  return (
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
                    <ProductionBarShape {...props} onGeometryChange={handleBarGeometryChange} />
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
  )
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
      fill={getProductionBarFill(
        payload?.caption,
        typeof props.index === 'number' ? props.index : 0
      )}
      height={props.height}
      radius={props.radius}
      width={props.width}
      x={props.x}
      y={props.y}
    />
  )
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
