import type { ThemeConfig } from 'antd'

type TabsTheme = NonNullable<NonNullable<ThemeConfig['components']>['Tabs']>

export const tabsTheme: TabsTheme = {
  itemSelectedColor: 'var(--color-text-strong)'
}

export const darkTabsTheme: TabsTheme = {
  ...tabsTheme
}
