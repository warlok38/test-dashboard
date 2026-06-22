'use client'

import { Breadcrumb as AntBreadcrumb, type BreadcrumbProps } from 'antd'
import Link from 'next/link'
import { type ReactNode } from 'react'

import { useScreen } from '@/shared/hooks/useScreen'

import styles from './Breadcrumbs.module.css'
import { getBreadcrumbMenuItems } from './lib'
import { BreadcrumbContent, MobileBreadcrumbs } from './ui'

export type BreadcrumbItem = {
  label: string
  href?: string
  icon?: ReactNode
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

const LARGE_SCREEN_BREADCRUMB_LIMIT = 5
const COMPACT_SCREEN_BREADCRUMB_LIMIT = 3

export function Breadcrumbs({ items: breadcrumbs }: BreadcrumbsProps) {
  const { isTabletScreen } = useScreen()

  const breadcrumbLimit = isTabletScreen
    ? COMPACT_SCREEN_BREADCRUMB_LIMIT
    : LARGE_SCREEN_BREADCRUMB_LIMIT
  const shouldCollapse = breadcrumbs.length > breadcrumbLimit
  const visibleBreadcrumbs = shouldCollapse
    ? [breadcrumbs[0], breadcrumbs[breadcrumbs.length - 1]]
    : breadcrumbs
  const hiddenBreadcrumbs = shouldCollapse ? breadcrumbs.slice(1, -1) : []

  const items: BreadcrumbProps['items'] = visibleBreadcrumbs.map((item, index) => {
    const isCurrent = shouldCollapse
      ? index === visibleBreadcrumbs.length - 1
      : index === breadcrumbs.length - 1
    const content = <BreadcrumbContent item={item} />

    return {
      key: `${item.label}-${index}`,
      title:
        item.href && !isCurrent ? (
          <Link href={item.href} className={styles.link}>
            {content}
          </Link>
        ) : (
          <span
            className={isCurrent ? styles.current : styles.inactive}
            aria-current={isCurrent ? 'page' : undefined}
          >
            {content}
          </span>
        )
    }
  })

  if (shouldCollapse) {
    items.splice(1, 0, {
      key: 'collapsed-breadcrumbs',
      title: <span className={styles.collapsed}>...</span>,
      menu: {
        items: getBreadcrumbMenuItems(hiddenBreadcrumbs)
      }
    })
  }

  return (
    <>
      <AntBreadcrumb className={styles.breadcrumbs} items={items} />
      <MobileBreadcrumbs items={breadcrumbs} />
    </>
  )
}
