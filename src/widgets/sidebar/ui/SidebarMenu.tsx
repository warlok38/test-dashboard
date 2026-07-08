import { Menu, type MenuProps } from 'antd'
import Link from 'next/link'

import { type SidebarMenuItem } from '../sidebarConfig'
import styles from '../Sidebar.module.css'

type SidebarMenuProps = {
  items: SidebarMenuItem[]
  onOpenChange: (openKeys: string[]) => void
  onRouteClick?: () => void
  openKeys: string[]
  selectedKey?: string
}

function getMenuLabel(item: SidebarMenuItem, onRouteClick?: () => void) {
  if (item.isSkeleton) {
    return <span className={styles.menuSkeletonLine} aria-hidden="true" />
  }

  if (item.isStatus) {
    return <span className={styles.menuStatusText}>{item.label}</span>
  }

  if (item.href) {
    if (item.isExternal) {
      return (
        <a href={item.href} target="_blank" rel="noreferrer" onClick={onRouteClick}>
          {item.label}
        </a>
      )
    }

    return (
      <Link href={item.href} onClick={onRouteClick}>
        {item.label}
      </Link>
    )
  }

  return item.label
}

function getMenuItems(items: SidebarMenuItem[], onRouteClick?: () => void): MenuProps['items'] {
  return items.map((item) => {
    const Icon = item.icon

    return {
      key: item.key,
      icon: Icon ? <Icon /> : undefined,
      label: getMenuLabel(item, onRouteClick),
      children: item.children ? getMenuItems(item.children, onRouteClick) : undefined,
      disabled: item.disabled
    }
  })
}

export function SidebarMenu({
  items,
  onOpenChange,
  onRouteClick,
  openKeys,
  selectedKey
}: SidebarMenuProps) {
  return (
    <Menu
      className={styles.menu}
      items={getMenuItems(items, onRouteClick)}
      mode="inline"
      openKeys={openKeys}
      selectedKeys={selectedKey ? [selectedKey] : []}
      onOpenChange={onOpenChange}
      inlineIndent={12}
    />
  )
}
