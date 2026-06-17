'use client'

import { FilterOutlined, HomeOutlined } from '@ant-design/icons'
import { Badge, Button, Drawer } from 'antd'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState, type ReactNode } from 'react'

import { useScreen } from '@/shared/hooks/useScreen'
import { Breadcrumbs, type BreadcrumbItem } from '@/shared/ui'

import { BusinessUnitFilter } from '../BusinessUnitFilter'
import { BUSINESS_UNIT_PARAM } from '../BusinessUnitFilter/useBusinessUnitSearchParams'
import { DateRangeFilter } from '../DateRangeFilter'
import { DATE_FROM_PARAM, DATE_TO_PARAM } from '../DateRangeFilter/dateRange'
import styles from './ContentHeader.module.css'

export type ContentHeaderBreadcrumb = BreadcrumbItem

type ContentHeaderProps = {
  breadcrumbs: ContentHeaderBreadcrumb[]
  actions?: ReactNode
  showBusinessUnitFilter?: boolean
  showDateFilter?: boolean
}

type MobileFilterActionsProps = {
  children: ReactNode
}

function MobileFilterActions({ children }: MobileFilterActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const hasActiveFilters =
    searchParams.getAll(BUSINESS_UNIT_PARAM).length > 0 ||
    Boolean(searchParams.get(DATE_FROM_PARAM) || searchParams.get(DATE_TO_PARAM))

  return (
    <>
      <Badge dot={hasActiveFilters} className={styles.filterBadge}>
        <Button icon={<FilterOutlined />} onClick={() => setIsOpen(true)}>
          Фильтры
        </Button>
      </Badge>
      <Drawer
        title="Фильтры"
        placement="right"
        size="default"
        open={isOpen}
        onClose={() => setIsOpen(false)}
      >
        <div className={styles.drawerActions}>{children}</div>
      </Drawer>
    </>
  )
}

export function ContentHeader({
  breadcrumbs,
  actions,
  showBusinessUnitFilter = true,
  showDateFilter = true
}: ContentHeaderProps) {
  const { isSmallScreen } = useScreen()
  const defaultActions =
    showBusinessUnitFilter || showDateFilter ? (
      <>
        {showBusinessUnitFilter && <BusinessUnitFilter />}
        {showDateFilter && <DateRangeFilter />}
      </>
    ) : null
  const resolvedActions = actions ?? defaultActions
  const shouldUseMobileFilterDrawer =
    isSmallScreen && !actions && (showBusinessUnitFilter || showDateFilter)

  return (
    <header className={styles.header}>
      <Breadcrumbs items={breadcrumbs} />
      {resolvedActions && shouldUseMobileFilterDrawer && (
        <Suspense fallback={null}>
          <MobileFilterActions>{resolvedActions}</MobileFilterActions>
        </Suspense>
      )}
      {resolvedActions && !shouldUseMobileFilterDrawer && (
        <div className={styles.actions}>
          <Suspense fallback={null}>{resolvedActions}</Suspense>
        </div>
      )}
    </header>
  )
}

export const homeBreadcrumbIcon = <HomeOutlined />
