'use client'

import { HomeOutlined } from '@ant-design/icons'
import { Suspense, type ReactNode } from 'react'

import { Breadcrumbs, type BreadcrumbItem } from '@/shared/ui'

import { BusinessUnitFilter } from '../BusinessUnitFilter'
import { DateRangeFilter } from '../DateRangeFilter'
import styles from './ContentHeader.module.css'

export type ContentHeaderBreadcrumb = BreadcrumbItem

type ContentHeaderProps = {
  breadcrumbs: ContentHeaderBreadcrumb[]
  actions?: ReactNode
  showBusinessUnitFilter?: boolean
  showDateFilter?: boolean
}

export function ContentHeader({
  breadcrumbs,
  actions,
  showBusinessUnitFilter = true,
  showDateFilter = true
}: ContentHeaderProps) {
  const defaultActions =
    showBusinessUnitFilter || showDateFilter ? (
      <>
        {showBusinessUnitFilter && <BusinessUnitFilter />}
        {showDateFilter && <DateRangeFilter />}
      </>
    ) : null
  const resolvedActions = actions ?? defaultActions

  return (
    <header className={styles.header}>
      <Breadcrumbs items={breadcrumbs} />
      {resolvedActions && (
        <div className={styles.actions}>
          <Suspense fallback={null}>{resolvedActions}</Suspense>
        </div>
      )}
    </header>
  )
}

export const homeBreadcrumbIcon = <HomeOutlined />
