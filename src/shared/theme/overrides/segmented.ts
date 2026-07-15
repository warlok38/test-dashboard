import type { ThemeConfig } from 'antd'

type SegmentedTheme = NonNullable<NonNullable<ThemeConfig['components']>['Segmented']>

export const segmentedTheme: SegmentedTheme = {
  itemSelectedBg: '#ffffff'
}

export const darkSegmentedTheme: SegmentedTheme = {
  itemSelectedBg: '#1f1f1d'
}
