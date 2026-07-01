import { Suspense } from 'react'

import { PageShell, PageSurface } from '@/shared/ui'
import { ContentHeader, HomeDashboard, homeBreadcrumbIcon } from '@/widgets'

export default function Home() {
  return (
    <PageShell>
      <ContentHeader
        breadcrumbs={[{ label: 'Главная', icon: homeBreadcrumbIcon }]}
        showBusinessUnitFilter={false}
        showDateFilter={false}
      />
      <PageSurface variant="constrained">
        <Suspense fallback={null}>
          <HomeDashboard />
        </Suspense>
      </PageSurface>
    </PageShell>
  )
}
