import { Suspense } from 'react'

import { ContentHeader, homeBreadcrumbIcon, IndustrialDashboardTable } from '@/widgets'
import { PageShell, PageSurface } from '@/shared/ui'

export default function ProductionStagesPage() {
  return (
    <PageShell>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: 'Сводка по стадиям производства' }
        ]}
      />
      <PageSurface variant="constrained">
        <Suspense fallback={null}>
          <IndustrialDashboardTable />
        </Suspense>
      </PageSurface>
    </PageShell>
  )
}
