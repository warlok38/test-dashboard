import type { ThemeConfig } from 'antd'

type SegmentedTheme = NonNullable<NonNullable<ThemeConfig['components']>['Segmented']>

export const segmentedTheme: SegmentedTheme = {
  fontSize: 16,
  itemSelectedBg: '#ffffff'
}

export const darkSegmentedTheme: SegmentedTheme = {
  fontSize: 16,
  itemSelectedBg: '#1f1f1d'
}
