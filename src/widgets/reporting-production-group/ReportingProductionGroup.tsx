'use client'

import { useSearchParams } from 'next/navigation'
import {
  Bar,
  BarChart,
  LabelList,
  Rectangle,
  ResponsiveContainer,
  XAxis,
  YAxis,
  type BarShapeProps,
  type XAxisTickContentProps
} from 'recharts'

import {
  reportingMockData,
  type ReportingAssetKey,
  type ReportingDataset,
  type ReportingProductionCard
} from '@/entities/reporting'
import { ComparisonArrowLine } from '@/shared/ui'
import { formatNumber } from '@/shared/utils'

import styles from './ReportingProductionGroup.module.css'

const ASSET_PARAM = 'asset'
const DEFAULT_ASSET_KEY: ReportingAssetKey = 'group'

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

  return (
    <section className={styles.section}>
      <h2>Производство по группе</h2>
      <div className={styles.cardGrid}>
        {dataset.productionCards.map((card) => (
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
  return (
    <article className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.chartColumn}>
          <div className={styles.cardHeader}>
            <h3>
              {card.title}, <span>{card.unit}</span>
            </h3>
          </div>
          <div className={styles.chartFrame}>
            <ComparisonArrowLine className={styles.comparisonTrack} deltas={card.deltas} />
            <svg
              className={styles.barConnectorLine}
              preserveAspectRatio="none"
              viewBox="0 0 100 100"
            >
              <path d="M16 62L50 36L84 43" />
            </svg>
            <ResponsiveContainer height={204} width="100%">
              <BarChart
                barCategoryGap="20%"
                barSize={60}
                data={card.bars}
                margin={{ top: 44, right: 20, left: 20, bottom: 0 }}
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
                <Bar
                  dataKey="value"
                  isAnimationActive={false}
                  radius={[0, 0, 0, 0]}
                  shape={renderProductionBar}
                >
                  <LabelList
                    content={(props) => {
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
                    }}
                  />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className={styles.textColumn}>
          <div className={styles.description}>{card.description}</div>
          <div className={styles.editHint}>Нажмите, чтобы отредактировать</div>
        </div>
      </div>
    </article>
  )
}

function renderProductionBar(props: BarShapeProps) {
  const payload = props.payload as ReportingProductionCard['bars'][number] | undefined

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
