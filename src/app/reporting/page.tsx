import { Suspense } from 'react'

import { ReportingStageTabs } from '@/features'
import { PageShell, PageSurface } from '@/shared/ui'
import {
  ReportingHeader,
  ReportingKpiPanel,
  ReportingOverview,
  ReportingProductionGroup
} from '@/widgets'

import styles from './page.module.css'

export default function ReportingPage() {
  return (
    <PageShell>
      <Suspense fallback={null}>
        <ReportingHeader />
        <ReportingKpiPanel />
        <ReportingStageTabs />
      </Suspense>
      <PageSurface className={styles.surface} padding={false} variant="constrained">
        <Suspense fallback={null}>
          <ReportingOverview />
          <div className={styles.productionSection}>
            <ReportingProductionGroup />
          </div>
        </Suspense>
      </PageSurface>
    </PageShell>
  )
}
