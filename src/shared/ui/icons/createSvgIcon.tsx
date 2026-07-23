'use client'

import Icon from '@ant-design/icons'
import type { IconComponentProps } from '@ant-design/icons/lib/components/Icon'
import type { ComponentType, ForwardRefExoticComponent, RefAttributes, SVGProps } from 'react'
import { forwardRef } from 'react'

type SvgComponent = ComponentType<SVGProps<SVGSVGElement>>
type SvgIconMap = Record<string, SvgComponent>

export type CustomIconProps = Omit<IconComponentProps, 'component'>

export type CustomIconComponent = ForwardRefExoticComponent<
  Omit<CustomIconProps, 'ref'> & RefAttributes<HTMLSpanElement>
>

export type CustomIconGroup<TIcons extends SvgIconMap> = {
  readonly [IconName in keyof TIcons]: CustomIconComponent
}

export function createSvgIcon(component: SvgComponent, displayName: string): CustomIconComponent {
  const SvgIcon = forwardRef<HTMLSpanElement, CustomIconProps>((props, ref) => (
    <Icon ref={ref} component={component} {...props} />
  ))

  SvgIcon.displayName = displayName

  return SvgIcon
}

export function createIconGroup<TIcons extends SvgIconMap>(
  icons: TIcons,
  displayNameSuffix: string
): CustomIconGroup<TIcons> {
  return Object.fromEntries(
    Object.entries(icons).map(([iconName, component]) => [
      iconName,
      createSvgIcon(component, `${iconName}${displayNameSuffix}`)
    ])
  ) as CustomIconGroup<TIcons>
}
