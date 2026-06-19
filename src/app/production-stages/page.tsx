import { Suspense } from 'react'

import {
  ContentHeader,
  homeBreadcrumbIcon,
  IndustrialDashboardTable,
  PageSurface
} from '@/components'

export default function ProductionStagesPage() {
  return (
    <>
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
    </>
  )
}
