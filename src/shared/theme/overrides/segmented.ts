import type { ThemeConfig } from 'antd'

type SegmentedTheme = NonNullable<NonNullable<ThemeConfig['components']>['Segmented']>

export const segmentedTheme: SegmentedTheme = {
  itemSelectedBg: 'var(--palette-status-warning-bg)'
}

export const darkSegmentedTheme: SegmentedTheme = {
  itemSelectedBg: 'var(--palette-status-warning-bg)'
}
