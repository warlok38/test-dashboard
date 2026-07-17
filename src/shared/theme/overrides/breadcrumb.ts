import type { ThemeConfig } from 'antd'

type BreadcrumbTheme = NonNullable<NonNullable<ThemeConfig['components']>['Breadcrumb']>

export const breadcrumbTheme: BreadcrumbTheme = {
  fontSize: 18,
  iconFontSize: 18
}

export const darkBreadcrumbTheme: BreadcrumbTheme = {
  ...breadcrumbTheme
}
