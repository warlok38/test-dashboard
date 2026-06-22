'use client'

import { HomeOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { Suspense, useState, type ReactNode } from 'react'

import { Breadcrumbs, type BreadcrumbItem } from '@/shared/ui'

import { BusinessUnitFilter } from '@/features/business-unit-filter'
import { DateRangeFilter } from '@/features/date-range-filter'
import styles from './ContentHeader.module.css'
import { useHeaderVisibility } from './lib'
import { MobileFilterActions } from './ui'

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
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
  const { headerRef, isHeaderHidden } = useHeaderVisibility(isMobileFilterOpen)
  const hasDefaultActions = showBusinessUnitFilter || showDateFilter
  const renderDefaultActions = () =>
    hasDefaultActions ? (
      <>
        {showBusinessUnitFilter && <BusinessUnitFilter />}
        {showDateFilter && <DateRangeFilter />}
      </>
    ) : null
  const resolvedActions = actions ?? renderDefaultActions()
  const shouldRenderResponsiveDefaultActions = !actions && hasDefaultActions
  return (
    <header
      ref={headerRef}
      className={classNames(styles.header, {
        [styles.headerHidden]: isHeaderHidden
      })}
    >
      <Breadcrumbs items={breadcrumbs} />
      {shouldRenderResponsiveDefaultActions && (
        <>
          <div className={styles.mobileActions}>
            <Suspense fallback={null}>
              <MobileFilterActions onOpenChange={setIsMobileFilterOpen}>
                {renderDefaultActions()}
              </MobileFilterActions>
            </Suspense>
          </div>
          <div className={styles.actions}>
            <Suspense fallback={null}>{renderDefaultActions()}</Suspense>
          </div>
        </>
      )}
      {resolvedActions && !shouldRenderResponsiveDefaultActions && (
        <div className={styles.actions}>
          <Suspense fallback={null}>{resolvedActions}</Suspense>
        </div>
      )}
    </header>
  )
}

export const homeBreadcrumbIcon = <HomeOutlined />
