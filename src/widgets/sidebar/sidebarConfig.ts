import { BarChartOutlined, HomeOutlined, SettingOutlined } from '@ant-design/icons'
import type { ComponentType } from 'react'

export const PRODUCTION_MENU_KEY = 'production-stages-root'
export const MINING_MENU_KEY = 'production-stages-mining-group'

export type SidebarMenuItem = {
  key: string
  label: string
  href?: string
  icon?: ComponentType
  children?: SidebarMenuItem[]
}

export const SIDEBAR_ITEMS: SidebarMenuItem[] = [
  {
    key: '/',
    href: '/',
    label: 'Главная',
    icon: HomeOutlined
  },
  {
    key: PRODUCTION_MENU_KEY,
    label: 'Сводка по стадиям',
    icon: BarChartOutlined,
    children: [
      {
        key: '/production-stages',
        href: '/production-stages',
        label: 'Общая сводка'
      },
      {
        key: MINING_MENU_KEY,
        label: 'Добыча',
        children: [
          {
            key: '/production-stages/mining',
            href: '/production-stages/mining',
            label: 'Обзор добычи'
          },
          {
            key: '/production-stages/mining/rock-mass',
            href: '/production-stages/mining/rock-mass',
            label: 'Горная масса'
          },
          {
            key: '/production-stages/mining/overburden',
            href: '/production-stages/mining/overburden',
            label: 'Вскрыша'
          }
        ]
      }
    ]
  },
  {
    key: '/settings',
    href: '/settings',
    label: 'Настройки',
    icon: SettingOutlined
  }
]

const ROUTE_KEYS = [
  '/',
  '/production-stages',
  '/production-stages/mining',
  '/production-stages/mining/rock-mass',
  '/production-stages/mining/overburden',
  '/settings'
]

export function getSelectedSidebarKey(pathname: string) {
  if (pathname === '/') {
    return '/'
  }

  return ROUTE_KEYS.filter((key) => key !== '/')
    .sort((a, b) => b.length - a.length)
    .find((key) => pathname === key || pathname.startsWith(`${key}/`))
}

export function getOpenSidebarKeys(pathname: string) {
  if (pathname.startsWith('/production-stages/mining')) {
    return [PRODUCTION_MENU_KEY, MINING_MENU_KEY]
  }

  if (pathname.startsWith('/production-stages')) {
    return [PRODUCTION_MENU_KEY]
  }

  return []
}
