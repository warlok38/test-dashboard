import classNames from 'classnames'
import type { ReactNode } from 'react'

import styles from './PageShell.module.css'

type PageShellProps = {
  children: ReactNode
  className?: string
}

export function PageShell({ children, className }: PageShellProps) {
  return <div className={classNames(styles.shell, className)}>{children}</div>
}
