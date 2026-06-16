import { HomeOutlined } from '@ant-design/icons'
import { Breadcrumb, type BreadcrumbProps } from 'antd'
import Link from 'next/link'
import { Suspense, type ReactNode } from 'react'

import styles from './ContentHeader.module.css'

export type ContentHeaderBreadcrumb = {
  label: string
  href?: string
  icon?: ReactNode
}

type ContentHeaderProps = {
  breadcrumbs: ContentHeaderBreadcrumb[]
  actions?: ReactNode
}

function renderBreadcrumbContent(item: ContentHeaderBreadcrumb) {
  return (
    <span className={styles.content}>
      {/* {item.icon && <span className={styles.icon}>{item.icon}</span>} */}
      <span className={styles.label}>{item.label}</span>
    </span>
  )
}

export function ContentHeader({ breadcrumbs, actions }: ContentHeaderProps) {
  const items: BreadcrumbProps['items'] = breadcrumbs.map((item, index) => {
    const isCurrent = index === breadcrumbs.length - 1
    const content = renderBreadcrumbContent(item)

    return {
      key: `${item.label}-${index}`,
      title:
        item.href && !isCurrent ? (
          <Link href={item.href} className={styles.link}>
            {content}
          </Link>
        ) : (
          <span className={styles.current} aria-current={isCurrent ? 'page' : undefined}>
            {content}
          </span>
        )
    }
  })

  return (
    <header className={styles.header}>
      <Breadcrumb className={styles.breadcrumbs} items={items} />
      {actions && (
        <div className={styles.actions}>
          <Suspense fallback={null}>{actions}</Suspense>
        </div>
      )}
    </header>
  )
}

export const homeBreadcrumbIcon = <HomeOutlined />
