import type { ThemeConfig } from 'antd'

type BreadcrumbTheme = NonNullable<NonNullable<ThemeConfig['components']>['Breadcrumb']>

export const breadcrumbTheme: BreadcrumbTheme = {
  fontSize: 20,
  iconFontSize: 20
}

export const darkBreadcrumbTheme: BreadcrumbTheme = {
  ...breadcrumbTheme
}
