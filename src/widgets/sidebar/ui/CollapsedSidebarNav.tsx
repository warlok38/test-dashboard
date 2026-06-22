import classNames from 'classnames'
import Link from 'next/link'

import { getCollapsedItemHref, getHrefWithQuery, isCollapsedItemActive } from '../lib'
import { type SidebarMenuItem } from '../sidebarConfig'
import styles from '../Sidebar.module.css'

type CollapsedSidebarNavProps = {
  items: SidebarMenuItem[]
  pathname: string
  queryString: string
}

export function CollapsedSidebarNav({ items, pathname, queryString }: CollapsedSidebarNavProps) {
  return (
    <nav className={styles.rail} aria-label="Разделы панели">
      {items.map((item) => {
        const Icon = item.icon
        const href = getCollapsedItemHref(item)
        const isActive = isCollapsedItemActive(item, pathname)

        if (!Icon || !href) {
          return null
        }

        return (
          <Link
            key={item.key}
            href={getHrefWithQuery(href, queryString)}
            className={classNames(styles.railItem, isActive && styles.railItemActive)}
            title={item.label}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon />
          </Link>
        )
      })}
    </nav>
  )
}
