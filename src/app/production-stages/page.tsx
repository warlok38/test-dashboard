import { Suspense } from 'react'

import { ContentHeader, homeBreadcrumbIcon, IndustrialDashboardTable } from '@/components'

export default function ProductionStagesPage() {
  return (
    <>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: 'Сводка по стадиям производства' }
        ]}
      />
      <Suspense fallback={null}>
        <IndustrialDashboardTable />
      </Suspense>
    </>
  )
}
