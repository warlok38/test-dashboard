import classNames from 'classnames'

import { type ProductionMetricDetail } from '@/entities/production-stage'
import { KpiValue } from '@/shared/ui'

import { getDelta, getMetricTone, hasMetricValue } from '../lib'
import styles from '../ProductionMetricDetail.module.css'

type TotalPanelProps = {
  detail: ProductionMetricDetail
}

export function TotalPanel({ detail }: TotalPanelProps) {
  const totalFact = detail.summaries.reduce((sum, unit) => sum + (unit.fact ?? 0), 0)
  const totalPlan = detail.summaries.reduce((sum, unit) => sum + unit.plan, 0)
  const totalDelta = getDelta(totalFact, totalPlan)
  const totalTone = getMetricTone(totalFact, totalDelta)
  const problemUnitsCount = detail.summaries.filter((unit) => {
    const delta = getDelta(unit.fact, unit.plan)

    return delta !== null && delta < 0
  }).length
  const missingFactUnitsCount = detail.summaries.filter((unit) => !hasMetricValue(unit.fact)).length

  return (
    <div
      className={classNames(styles.totalPanel, {
        [styles.totalPanelDanger]: totalTone === 'danger',
        [styles.totalPanelSuccess]: totalTone === 'success'
      })}
    >
      <div className={styles.totalHeader}>
        <div>
          <h1 id="metric-detail-title" className={styles.title}>
            <span>
              {detail.metricTitle}, {detail.unit}
            </span>{' '}
            <span className={styles.titleNote}>(Итого по выбранным БЕ)</span>
          </h1>
        </div>
        <div className={styles.legend} aria-hidden="true">
          <span className={styles.planLegend}>План</span>
          <span className={styles.factLegend}>Факт</span>
        </div>
      </div>
      <dl className={styles.totalStats}>
        <div className={styles.totalStatsRow}>
          <div className={styles.totalStat}>
            <dt>План</dt>
            <KpiValue
              as="dd"
              kind="plan"
              value={totalPlan}
              fractionDigits={totalPlan % 1 === 0 ? 0 : 2}
            />
          </div>
          <div className={classNames(styles.totalStat, styles.totalFactStat)}>
            <dt>Факт</dt>
            <KpiValue
              as="dd"
              className={styles.totalValue}
              kind="fact"
              value={totalFact}
              fractionDigits={totalFact % 1 === 0 ? 0 : 2}
            />
          </div>
          <div className={styles.totalStat}>
            <dt>Отклонение</dt>
            <KpiValue as="dd" kind="delta" value={totalDelta} fractionDigits={2} />
          </div>
        </div>
        <div className={styles.totalStatsRow}>
          <div className={styles.totalStat}>
            <dt>Ниже плана</dt>
            <dd>{problemUnitsCount}</dd>
          </div>
          <div className={styles.totalStat}>
            <dt>Без факта</dt>
            <dd>{missingFactUnitsCount}</dd>
          </div>
          <div className={styles.totalStat}></div>
        </div>
      </dl>
    </div>
  )
}
