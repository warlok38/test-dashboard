import { type BreadcrumbProps, type MenuProps } from 'antd'
import Link from 'next/link'

import { type BreadcrumbItem } from '../Breadcrumbs'

type AntBreadcrumbItem = NonNullable<BreadcrumbProps['items']>[number]
type AntBreadcrumbMenuItems = NonNullable<NonNullable<AntBreadcrumbItem['menu']>['items']>

export function getMenuItems(items: BreadcrumbItem[]): MenuProps['items'] {
  return items.map((item, index) => ({
    key: `${item.label}-${index}`,
    label: item.href ? <Link href={item.href}>{item.label}</Link> : item.label
  }))
}

export function getBreadcrumbMenuItems(items: BreadcrumbItem[]): AntBreadcrumbMenuItems {
  return items.map((item, index) => ({
    key: `${item.label}-${index}`,
    label: item.href ? <Link href={item.href}>{item.label}</Link> : item.label
  }))
}
