'use client'

import { DownOutlined } from '@ant-design/icons'
import { Breadcrumb as AntBreadcrumb, Dropdown, type BreadcrumbProps, type MenuProps } from 'antd'
import Link from 'next/link'
import { type ReactNode } from 'react'

import { useScreen } from '@/shared/hooks/useScreen'

import styles from './Breadcrumbs.module.css'

export type BreadcrumbItem = {
  label: string
  href?: string
  icon?: ReactNode
}

type BreadcrumbsProps = {
  items: BreadcrumbItem[]
}

type AntBreadcrumbItem = NonNullable<BreadcrumbProps['items']>[number]
type AntBreadcrumbMenuItems = NonNullable<NonNullable<AntBreadcrumbItem['menu']>['items']>

const LARGE_SCREEN_BREADCRUMB_LIMIT = 5
const COMPACT_SCREEN_BREADCRUMB_LIMIT = 3
const MOBILE_HISTORY_LABEL = '...'

function renderBreadcrumbContent(item: BreadcrumbItem) {
  return (
    <span className={styles.content}>
      {/* {item.icon && <span className={styles.icon}>{item.icon}</span>} */}
      <span className={styles.label}>{item.label}</span>
    </span>
  )
}

function getMenuItems(items: BreadcrumbItem[]): MenuProps['items'] {
  return items.map((item, index) => ({
    key: `${item.label}-${index}`,
    label: item.href ? <Link href={item.href}>{item.label}</Link> : item.label
  }))
}

function getBreadcrumbMenuItems(items: BreadcrumbItem[]): AntBreadcrumbMenuItems {
  return items.map((item, index) => ({
    key: `${item.label}-${index}`,
    label: item.href ? <Link href={item.href}>{item.label}</Link> : item.label
  }))
}

function MobileBreadcrumbs({ items }: BreadcrumbsProps) {
  const currentBreadcrumb = items[items.length - 1]
  const historyBreadcrumbs = items.slice(0, -1)

  return (
    <nav className={styles.mobileBreadcrumbs} aria-label="breadcrumb">
      {historyBreadcrumbs.length > 0 && (
        <>
          <Dropdown
            menu={{ items: getMenuItems(historyBreadcrumbs) }}
            placement="bottomLeft"
            trigger={['click']}
            classNames={{ root: styles.mobileHistoryDropdown }}
          >
            <button
              className={styles.mobileHistoryButton}
              type="button"
              aria-label="Открыть предыдущие разделы"
            >
              <span>{MOBILE_HISTORY_LABEL}</span>
              <DownOutlined />
            </button>
          </Dropdown>
          <span className={styles.mobileSeparator} aria-hidden="true">
            /
          </span>
        </>
      )}
      {currentBreadcrumb && (
        <span className={styles.current} aria-current="page">
          {renderBreadcrumbContent(currentBreadcrumb)}
        </span>
      )}
    </nav>
  )
}

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
    const content = renderBreadcrumbContent(item)

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
