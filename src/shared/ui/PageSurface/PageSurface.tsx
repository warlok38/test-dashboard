import classNames from 'classnames'
import type { CSSProperties, ReactNode } from 'react'

import styles from './PageSurface.module.css'

type PageSurfaceProps = {
  children: ReactNode
  className?: string
  variant?: 'wide' | 'constrained'
  style?: CSSProperties
}

export function PageSurface({ children, className, variant = 'wide', style }: PageSurfaceProps) {
  return (
    <div
      className={classNames(styles.surface, className, {
        [styles.surfaceConstrained]: variant === 'constrained'
      })}
      style={style}
    >
      {children}
    </div>
  )
}
