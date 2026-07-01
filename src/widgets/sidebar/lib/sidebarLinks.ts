import { type SidebarMenuItem } from '../sidebarConfig'

export function getHrefWithQuery(href: string, queryString: string) {
  if (!queryString || !href.startsWith('/production-stages')) {
    return href
  }

  return `${href}?${queryString}`
}

export function getCollapsedItemHref(item: SidebarMenuItem) {
  return item.href ?? item.children?.find((child) => child.href)?.href
}

export function isCollapsedItemActive(item: SidebarMenuItem, pathname: string) {
  if (item.key === '/') {
    return pathname === '/'
  }

  if (item.children?.some((child) => child.href === pathname)) {
    return true
  }

  return (
    typeof item.href === 'string' &&
    (pathname === item.href || pathname.startsWith(`${item.href}/`))
  )
}
