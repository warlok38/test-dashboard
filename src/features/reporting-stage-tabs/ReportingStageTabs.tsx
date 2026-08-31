'use client'

import { Tabs, type TabsProps } from 'antd'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { getReportingStage, isReportingStageKey, reportingStageOptions } from '@/entities/reporting'

import styles from './ReportingStageTabs.module.css'

const STAGE_PARAM = 'stage'

const stageItems: TabsProps['items'] = reportingStageOptions.map((stage) => ({
  key: stage.key,
  label: stage.label.toUpperCase()
}))

export function ReportingStageTabs() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const activeStage = getReportingStage(searchParams.get(STAGE_PARAM))

  const handleStageChange = useMemo(
    () => (stageKey: string) => {
      if (!isReportingStageKey(stageKey)) {
        return
      }

      const params = new URLSearchParams(searchParams.toString())
      params.set(STAGE_PARAM, stageKey)

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <div className={styles.stageTabs}>
      <Tabs
        activeKey={activeStage.key}
        className={styles.tabs}
        items={stageItems}
        onChange={handleStageChange}
      />
    </div>
  )
}
