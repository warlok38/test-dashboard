import type { ReactNode } from 'react'
import { Button, Tooltip } from 'antd'

import styles from '../ProductionSummaryDashboard.module.css'

type SideAction = {
  icon: ReactNode
  key: string
  label: string
  onClick?: () => void
  render?: (button: ReactNode) => ReactNode
}

type SideActionsProps = {
  actions: SideAction[]
  children?: ReactNode
}

export function SideActions({ actions, children }: SideActionsProps) {
  return (
    <div className={styles.sideActions}>
      {actions.map((action) => {
        const button = (
          <Button
            className={styles.sideActionButton}
            icon={action.icon}
            onClick={action.onClick}
            type="text"
          />
        )

        return (
          <Tooltip key={action.key} placement="left" title={action.label}>
            <span className={styles.sideActionTarget}>
              {action.render ? action.render(button) : button}
            </span>
          </Tooltip>
        )
      })}
      {children ? <div className={styles.sideActionsChildren}>{children}</div> : null}
    </div>
  )
}
