import classNames from 'classnames'
import type { ReactNode } from 'react'

import styles from './PageSurface.module.css'

type PageSurfaceProps = {
  children: ReactNode
  className?: string
  variant?: 'wide' | 'constrained'
}

export function PageSurface({ children, className, variant = 'wide' }: PageSurfaceProps) {
  return (
    <div
      className={classNames(styles.surface, className, {
        [styles.surfaceConstrained]: variant === 'constrained'
      })}
    >
      {children}
    </div>
  )
}
