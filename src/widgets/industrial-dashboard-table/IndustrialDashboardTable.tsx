'use client'

import { useMemo } from 'react'
import { Alert, Empty, Skeleton } from 'antd'
import { useSearchParams } from 'next/navigation'

import { useGetProductionStagesQuery } from '@/entities/production-stage'
import { useScreen } from '@/shared/hooks/useScreen'

import { getColumnWidth, getRows } from './lib'
import { DesktopDashboardTable, MobileDashboardList } from './ui'
import styles from './IndustrialDashboardTable.module.css'

export function IndustrialDashboardTable() {
  const searchParams = useSearchParams()
  const { isTabletScreen, isMediumScreen } = useScreen()
  const queryString = searchParams.toString()
  const columnWidth = getColumnWidth(isTabletScreen, isMediumScreen)
  const {
    data: stages = [],
    error,
    isLoading
  } = useGetProductionStagesQuery({
    dateFrom: searchParams.get('dateFrom') ?? undefined,
    dateTo: searchParams.get('dateTo') ?? undefined,
    businessUnit: searchParams.getAll('businessUnit')
  })
  const rows = useMemo(() => getRows(stages), [stages])
  const defaultMobileActiveKeys = useMemo(() => stages.map((stage) => stage.id), [stages])

  if (isLoading) {
    return (
      <div className={styles.dashboard}>
        <Skeleton active paragraph={{ rows: 8 }} title={false} />
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.dashboard}>
        <Alert
          showIcon
          type="error"
          message="Не удалось загрузить сводку по стадиям производства"
        />
      </div>
    )
  }

  if (stages.length === 0) {
    return (
      <div className={styles.dashboard}>
        <Empty description="Нет данных по стадиям производства" />
      </div>
    )
  }

  return (
    <>
      <DesktopDashboardTable
        columnWidth={columnWidth}
        queryString={queryString}
        rows={rows}
        stages={stages}
      />
      <MobileDashboardList
        defaultActiveKeys={defaultMobileActiveKeys}
        queryString={queryString}
        stages={stages}
      />
    </>
  )
}
