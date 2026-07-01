import { getHomeDashboardSummary } from '@/entities/production-stage'
import { homeDashboardSummaryMock } from '@/shared/mocks/production-stage/homeDashboard'

import styles from './HomeDashboard.module.css'
import {
  AssetPerformanceTable,
  DeviationReasonsList,
  PeriodControls,
  PlanFactChart,
  ProductionEventsList,
  ProductionFlow,
  ProductionKpiStrip
} from './ui'

export function HomeDashboard() {
  const summary = getHomeDashboardSummary(homeDashboardSummaryMock)

  return (
    <section className={styles.dashboard} aria-label="Главная сводка производства">
      <header className={styles.summary}>
        <div className={styles.summaryLead}>
          <span className={styles.summaryEyebrow}>{summary.controls.updatedAtLabel}</span>
          <h1>{summary.title}</h1>
          <p>{summary.subtitle}</p>
        </div>
        <PeriodControls
          periodLabel={summary.controls.periodLabel}
          shiftLabel={summary.controls.shiftLabel}
          assetLabel={summary.controls.assetLabel}
        />
      </header>
      <ProductionKpiStrip kpis={summary.kpis} />
      <div className={styles.primaryGrid}>
        <PlanFactChart trend={summary.trend} />
        <DeviationReasonsList deviations={summary.deviations} />
      </div>
      <ProductionFlow stages={summary.flow} />
      <div className={styles.secondaryGrid}>
        <AssetPerformanceTable assets={summary.assets} />
        <ProductionEventsList events={summary.events} />
      </div>
    </section>
  )
}
