import classNames from 'classnames'
import Link from 'next/link'

import { getCollapsedItemHref, isCollapsedItemActive } from '../lib'
import { type SidebarMenuItem } from '../sidebarConfig'
import styles from '../Sidebar.module.css'

type CollapsedSidebarNavProps = {
  items: SidebarMenuItem[]
  pathname: string
}

export function CollapsedSidebarNav({ items, pathname }: CollapsedSidebarNavProps) {
  return (
    <nav className={styles.rail} aria-label="Разделы панели">
      {items.map((item) => {
        const Icon = item.icon
        const href = getCollapsedItemHref(item)
        const isActive = isCollapsedItemActive(item, pathname)

        if (!Icon || !href) {
          return null
        }

        if (item.isExternal) {
          return (
            <a
              key={item.key}
              href={href}
              className={styles.railItem}
              title={item.label}
              aria-label={item.label}
              target="_blank"
              rel="noreferrer"
            >
              <Icon />
            </a>
          )
        }

        return (
          <Link
            key={item.key}
            href={href}
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
