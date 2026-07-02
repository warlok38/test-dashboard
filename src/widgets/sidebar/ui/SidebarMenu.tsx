import { Menu, type MenuProps } from 'antd'
import Link from 'next/link'

import { getHrefWithQuery } from '../lib'
import { type SidebarMenuItem } from '../sidebarConfig'
import styles from '../Sidebar.module.css'

type SidebarMenuProps = {
  items: SidebarMenuItem[]
  onOpenChange: (openKeys: string[]) => void
  onRouteClick?: () => void
  openKeys: string[]
  queryString: string
  selectedKey?: string
}

function getMenuLabel(item: SidebarMenuItem, queryString: string, onRouteClick?: () => void) {
  if (item.isSkeleton) {
    return <span className={styles.menuSkeletonLine} aria-hidden="true" />
  }

  if (item.isStatus) {
    return <span className={styles.menuStatusText}>{item.label}</span>
  }

  if (item.href) {
    return (
      <Link href={getHrefWithQuery(item.href, queryString)} onClick={onRouteClick}>
        {item.label}
      </Link>
    )
  }

  return item.label
}

function getMenuItems(
  items: SidebarMenuItem[],
  queryString: string,
  onRouteClick?: () => void
): MenuProps['items'] {
  return items.map((item) => {
    const Icon = item.icon

    return {
      key: item.key,
      icon: Icon ? <Icon /> : undefined,
      label: getMenuLabel(item, queryString, onRouteClick),
      children: item.children ? getMenuItems(item.children, queryString, onRouteClick) : undefined,
      disabled: item.disabled
    }
  })
}

export function SidebarMenu({
  items,
  onOpenChange,
  onRouteClick,
  openKeys,
  queryString,
  selectedKey
}: SidebarMenuProps) {
  return (
    <Menu
      className={styles.menu}
      items={getMenuItems(items, queryString, onRouteClick)}
      mode="inline"
      openKeys={openKeys}
      selectedKeys={selectedKey ? [selectedKey] : []}
      onOpenChange={onOpenChange}
      inlineIndent={12}
    />
  )
}
