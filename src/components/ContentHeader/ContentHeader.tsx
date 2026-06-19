'use client'

import { FilterOutlined, HomeOutlined } from '@ant-design/icons'
import { Badge, Button, Drawer } from 'antd'
import classNames from 'classnames'
import { useSearchParams } from 'next/navigation'
import { Suspense, useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

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
  onOpenChange?: (isOpen: boolean) => void
}

const HEADER_HIDE_SCROLL_THRESHOLD = 36
const HEADER_TOP_REVEAL_OFFSET = 8
const MOBILE_HEADER_MEDIA_QUERY = '(max-width: 767px)'

function MobileFilterActions({ children, onOpenChange }: MobileFilterActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const hasActiveFilters =
    searchParams.getAll(BUSINESS_UNIT_PARAM).length > 0 ||
    Boolean(searchParams.get(DATE_FROM_PARAM) || searchParams.get(DATE_TO_PARAM))
  const updateOpen = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen)
    onOpenChange?.(nextIsOpen)
  }

  return (
    <>
      <Badge dot={hasActiveFilters} className={styles.filterBadge}>
        <Button icon={<FilterOutlined />} onClick={() => updateOpen(true)}>
          Фильтры
        </Button>
      </Badge>
      <Drawer
        title="Фильтры"
        placement="right"
        size="default"
        open={isOpen}
        push={false}
        onClose={() => updateOpen(false)}
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
  const headerRef = useRef<HTMLElement>(null)
  const isHeaderHiddenRef = useRef(false)
  const isMobileFilterOpenRef = useRef(false)
  const [isHeaderHidden, setIsHeaderHidden] = useState(false)
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false)
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
  const updateHeaderHidden = useCallback((nextIsHidden: boolean) => {
    if (isHeaderHiddenRef.current === nextIsHidden) {
      return
    }

    isHeaderHiddenRef.current = nextIsHidden
    setIsHeaderHidden(nextIsHidden)
  }, [])

  useEffect(() => {
    isMobileFilterOpenRef.current = isMobileFilterOpen

    if (isMobileFilterOpen) {
      updateHeaderHidden(false)
    }
  }, [isMobileFilterOpen, updateHeaderHidden])

  useEffect(() => {
    const header = headerRef.current
    const scrollContainer = header?.closest<HTMLElement>('[data-main-content-scroll]')

    if (!scrollContainer) {
      return undefined
    }

    const mobileMediaQuery = window.matchMedia(MOBILE_HEADER_MEDIA_QUERY)
    let lastScrollTop = Math.round(scrollContainer.scrollTop)
    let accumulatedDelta = 0
    let animationFrameId: number | null = null

    const handleScroll = () => {
      animationFrameId = null

      if (!mobileMediaQuery.matches) {
        accumulatedDelta = 0
        lastScrollTop = Math.round(scrollContainer.scrollTop)
        updateHeaderHidden(false)
        return
      }

      const currentScrollTop = Math.round(scrollContainer.scrollTop)
      const delta = currentScrollTop - lastScrollTop

      if (isMobileFilterOpenRef.current) {
        accumulatedDelta = 0
        lastScrollTop = currentScrollTop
        updateHeaderHidden(false)
        return
      }

      if (currentScrollTop <= HEADER_TOP_REVEAL_OFFSET) {
        accumulatedDelta = 0
        lastScrollTop = currentScrollTop
        updateHeaderHidden(false)
        return
      }

      if (delta === 0) {
        return
      }

      if ((delta > 0 && accumulatedDelta < 0) || (delta < 0 && accumulatedDelta > 0)) {
        accumulatedDelta = 0
      }

      accumulatedDelta += delta

      if (
        delta > 0 &&
        accumulatedDelta > HEADER_HIDE_SCROLL_THRESHOLD &&
        !isHeaderHiddenRef.current
      ) {
        accumulatedDelta = 0
        updateHeaderHidden(true)
      }

      if (
        delta < 0 &&
        Math.abs(accumulatedDelta) > HEADER_HIDE_SCROLL_THRESHOLD &&
        isHeaderHiddenRef.current
      ) {
        accumulatedDelta = 0
        updateHeaderHidden(false)
      }

      lastScrollTop = currentScrollTop
    }

    const requestScrollUpdate = () => {
      if (animationFrameId !== null) {
        return
      }

      animationFrameId = window.requestAnimationFrame(handleScroll)
    }

    const handleViewportChange = () => {
      accumulatedDelta = 0
      lastScrollTop = Math.round(scrollContainer.scrollTop)

      if (!mobileMediaQuery.matches) {
        updateHeaderHidden(false)
      }
    }

    scrollContainer.addEventListener('scroll', requestScrollUpdate, { passive: true })
    mobileMediaQuery.addEventListener('change', handleViewportChange)

    return () => {
      scrollContainer.removeEventListener('scroll', requestScrollUpdate)
      mobileMediaQuery.removeEventListener('change', handleViewportChange)

      if (animationFrameId !== null) {
        window.cancelAnimationFrame(animationFrameId)
      }
    }
  }, [updateHeaderHidden])

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
