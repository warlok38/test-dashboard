'use client'

import { useSearchParams } from 'next/navigation'

import { industrialDashboardStages } from '@/entities/production-stage'
import { useScreen } from '@/shared/hooks/useScreen'

import { getColumnWidth, getRows } from './lib'
import { DesktopDashboardTable, MobileDashboardList } from './ui'

const rows = getRows(industrialDashboardStages)
const defaultMobileActiveKeys = industrialDashboardStages.map((stage) => stage.id)

export function IndustrialDashboardTable() {
  const searchParams = useSearchParams()
  const { isTabletScreen, isMediumScreen } = useScreen()
  const queryString = searchParams.toString()
  const columnWidth = getColumnWidth(isTabletScreen, isMediumScreen)

  return (
    <>
      <DesktopDashboardTable
        columnWidth={columnWidth}
        queryString={queryString}
        rows={rows}
        stages={industrialDashboardStages}
      />
      <MobileDashboardList
        defaultActiveKeys={defaultMobileActiveKeys}
        queryString={queryString}
        stages={industrialDashboardStages}
      />
    </>
  )
}
