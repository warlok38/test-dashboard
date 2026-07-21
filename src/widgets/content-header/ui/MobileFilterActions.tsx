'use client'

import { FilterOutlined } from '@ant-design/icons'
import { Badge, Button, Drawer } from 'antd'
import { useSearchParams } from 'next/navigation'
import { useState, type ReactNode } from 'react'

import { PERIOD_PARAM } from '@/features/period-filter'

import styles from '../ContentHeader.module.css'

type MobileFilterActionsProps = {
  children: ReactNode
  onOpenChange?: (isOpen: boolean) => void
}

export function MobileFilterActions({ children, onOpenChange }: MobileFilterActionsProps) {
  const [isOpen, setIsOpen] = useState(false)
  const searchParams = useSearchParams()
  const hasActiveFilters = Boolean(searchParams.get(PERIOD_PARAM))
  const updateOpen = (nextIsOpen: boolean) => {
    setIsOpen(nextIsOpen)
    onOpenChange?.(nextIsOpen)
  }

  return (
    <>
      <Badge dot={hasActiveFilters} className={styles.filterBadge}>
        <Button icon={<FilterOutlined />} onClick={() => updateOpen(true)}>
          Фильтры
        </Button>
      </Badge>
      <Drawer
        title="Фильтры"
        placement="right"
        size="default"
        open={isOpen}
        push={false}
        onClose={() => updateOpen(false)}
      >
        <div className={styles.drawerActions}>{children}</div>
      </Drawer>
    </>
  )
}
