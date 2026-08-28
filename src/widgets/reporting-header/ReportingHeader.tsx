'use client'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import { Button, Segmented, type SegmentedProps } from 'antd'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import {
  reportingAssetMockOptions,
  reportingModeMockOptions,
  type ReportingAssetKey,
  type ReportingMode,
  type ReportingQuarter
} from '@/entities/reporting'

import styles from './ReportingHeader.module.css'

const ASSET_PARAM = 'asset'
const QUARTER_PARAM = 'quarter'
const MODE_PARAM = 'mode'
const DEFAULT_ASSET_KEY: ReportingAssetKey = 'group'
const DEFAULT_MODE: ReportingMode = 'period'

const assetKeys = new Set<ReportingAssetKey>(reportingAssetMockOptions.map((option) => option.key))
const modeKeys = new Set<ReportingMode>(reportingModeMockOptions.map((option) => option.key))

const assetOptions: SegmentedProps['options'] = reportingAssetMockOptions.map((option) => ({
  label: option.label,
  value: option.key
}))

const modeOptions: SegmentedProps['options'] = reportingModeMockOptions.map((option) => ({
  label: option.label,
  value: option.key
}))

function getCurrentQuarter(): ReportingQuarter {
  const now = new Date()

  return {
    year: now.getFullYear(),
    quarter: (Math.floor(now.getMonth() / 3) + 1) as ReportingQuarter['quarter']
  }
}

function parseQuarter(value: string | null): ReportingQuarter {
  const match = value?.match(/^(\d{4})-q([1-4])$/i)

  if (!match) {
    return getCurrentQuarter()
  }

  return {
    year: Number(match[1]),
    quarter: Number(match[2]) as ReportingQuarter['quarter']
  }
}

function formatQuarterParam(quarter: ReportingQuarter) {
  return `${quarter.year}-q${quarter.quarter}`
}

function formatQuarterLabel(quarter: ReportingQuarter) {
  return `${quarter.quarter}КВ ${quarter.year}`
}

function shiftQuarter(quarter: ReportingQuarter, direction: -1 | 1): ReportingQuarter {
  const nextQuarter = quarter.quarter + direction

  if (nextQuarter < 1) {
    return {
      year: quarter.year - 1,
      quarter: 4
    }
  }

  if (nextQuarter > 4) {
    return {
      year: quarter.year + 1,
      quarter: 1
    }
  }

  return {
    year: quarter.year,
    quarter: nextQuarter as ReportingQuarter['quarter']
  }
}

function getAssetKey(value: string | null): ReportingAssetKey {
  return value && assetKeys.has(value as ReportingAssetKey)
    ? (value as ReportingAssetKey)
    : DEFAULT_ASSET_KEY
}

function getMode(value: string | null): ReportingMode {
  return value && modeKeys.has(value as ReportingMode) ? (value as ReportingMode) : DEFAULT_MODE
}

export function ReportingHeader() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const asset = getAssetKey(searchParams.get(ASSET_PARAM))
  const quarter = parseQuarter(searchParams.get(QUARTER_PARAM))
  const mode = getMode(searchParams.get(MODE_PARAM))

  const replaceParams = useMemo(
    () => (updates: Record<string, string>) => {
      const params = new URLSearchParams(searchParams.toString())

      Object.entries(updates).forEach(([key, value]) => {
        params.set(key, value)
      })

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <header className={styles.header}>
      <Segmented
        className={styles.assetSegment}
        options={assetOptions}
        size="large"
        value={asset}
        onChange={(value) => replaceParams({ [ASSET_PARAM]: String(value) })}
      />
      <div className={styles.rightControls}>
        <div className={styles.quarterControl}>
          <Button
            className={styles.navButton}
            icon={<LeftOutlined />}
            size="large"
            type="text"
            onClick={() =>
              replaceParams({ [QUARTER_PARAM]: formatQuarterParam(shiftQuarter(quarter, -1)) })
            }
          />
          <span className={styles.quarterLabel}>{formatQuarterLabel(quarter)}</span>
          <Button
            className={styles.navButton}
            icon={<RightOutlined />}
            size="large"
            type="text"
            onClick={() =>
              replaceParams({ [QUARTER_PARAM]: formatQuarterParam(shiftQuarter(quarter, 1)) })
            }
          />
        </div>
        <Segmented
          className={styles.modeSegment}
          options={modeOptions}
          size="large"
          value={mode}
          onChange={(value) => replaceParams({ [MODE_PARAM]: String(value) })}
        />
      </div>
    </header>
  )
}
