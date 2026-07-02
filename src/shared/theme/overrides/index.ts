import type { ThemeConfig } from 'antd'

import { darkMenuTheme, menuTheme } from './menu'
import { darkSegmentedTheme, segmentedTheme } from './segmented'
import { darkSwitchTheme, switchTheme } from './switch'

type ComponentOverrides = NonNullable<ThemeConfig['components']>

export const componentOverrides: ComponentOverrides = {
  Menu: menuTheme,
  Segmented: segmentedTheme,
  Switch: switchTheme
}

export const darkComponentOverrides: ComponentOverrides = {
  Menu: darkMenuTheme,
  Segmented: darkSegmentedTheme,
  Switch: darkSwitchTheme
}
