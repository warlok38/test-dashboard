import {
  ContentHeader,
  DateRangeFilter,
  homeBreadcrumbIcon,
  IndustrialDashboardTable
} from '@/components'

export default function ProductionStagesPage() {
  return (
    <>
      <ContentHeader
        breadcrumbs={[
          { label: 'Главная', href: '/', icon: homeBreadcrumbIcon },
          { label: 'Сводка по стадиям производства' }
        ]}
        actions={<DateRangeFilter />}
      />
      <IndustrialDashboardTable />
    </>
  )
}
