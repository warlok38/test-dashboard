import classNames from 'classnames'
import type { CSSProperties, ReactNode } from 'react'

import styles from './PageSurface.module.css'

type PageSurfaceProps = {
  children: ReactNode
  className?: string
  padding?: false | CSSProperties['padding']
  variant?: 'wide' | 'constrained'
  style?: CSSProperties
}

export function PageSurface({
  children,
  className,
  padding,
  variant = 'wide',
  style
}: PageSurfaceProps) {
  const surfaceStyle = padding === undefined ? style : { ...style, padding: padding || 0 }

  return (
    <div
      className={classNames(styles.surface, className, {
        [styles.surfaceConstrained]: variant === 'constrained'
      })}
      style={surfaceStyle}
    >
      {children}
    </div>
  )
}
