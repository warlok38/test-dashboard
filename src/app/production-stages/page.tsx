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
      <IndustrialDashboardTable />
    </>
  )
}
