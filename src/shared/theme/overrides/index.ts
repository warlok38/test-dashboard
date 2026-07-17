import type { ThemeConfig } from 'antd'

import { breadcrumbTheme, darkBreadcrumbTheme } from './breadcrumb'
import { darkMenuTheme, menuTheme } from './menu'
import { darkSegmentedTheme, segmentedTheme } from './segmented'
import { darkSwitchTheme, switchTheme } from './switch'
import { darkTabsTheme, tabsTheme } from './tabs'

type ComponentOverrides = NonNullable<ThemeConfig['components']>

export const componentOverrides: ComponentOverrides = {
  Breadcrumb: breadcrumbTheme,
  Menu: menuTheme,
  Segmented: segmentedTheme,
  Switch: switchTheme,
  Tabs: tabsTheme
}

export const darkComponentOverrides: ComponentOverrides = {
  Breadcrumb: darkBreadcrumbTheme,
  Menu: darkMenuTheme,
  Segmented: darkSegmentedTheme,
  Switch: darkSwitchTheme,
  Tabs: darkTabsTheme
}
