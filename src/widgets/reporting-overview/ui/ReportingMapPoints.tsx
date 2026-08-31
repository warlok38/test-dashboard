'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useMemo } from 'react'

import { reportingAssetMockOptions, type ReportingAssetKey } from '@/entities/reporting'

import { REPORTING_MAP_IMAGE_SIZE, reportingMapPoints } from '../model/reporting-map-points'
import styles from '../ReportingOverview.module.css'

const ASSET_PARAM = 'asset'
const GROUP_ASSET_KEY: ReportingAssetKey = 'group'

type ReportingMapPointsProps = {
  activeAssetKey: ReportingAssetKey
}

export function ReportingMapPoints({ activeAssetKey }: ReportingMapPointsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const isGroupActive = activeAssetKey === GROUP_ASSET_KEY

  const selectAsset = useMemo(
    () => (assetKey: ReportingAssetKey) => {
      const params = new URLSearchParams(searchParams.toString())
      params.set(ASSET_PARAM, assetKey)

      router.replace(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [pathname, router, searchParams]
  )

  return (
    <div className={styles.mapPoints}>
      {reportingMapPoints.map((point) => {
        const isSelectedAsset = activeAssetKey === point.assetKey
        const isActive = isGroupActive || isSelectedAsset
        const assetLabel = getAssetLabel(point.assetKey)
        const pointLabel = getAssetInitials(assetLabel)

        return (
          <button
            className={`${styles.mapPoint} ${isActive ? styles.mapPointActive : ''}`}
            key={point.assetKey}
            style={{
              left: `${(point.x / REPORTING_MAP_IMAGE_SIZE.width) * 100}%`,
              top: `${(point.y / REPORTING_MAP_IMAGE_SIZE.height) * 100}%`,
              zIndex: isSelectedAsset ? 1000 : point.y
            }}
            title={assetLabel}
            type="button"
            onClick={() => selectAsset(point.assetKey)}
          >
            <span className={styles.mapPointMotion}>
              <span className={styles.mapPointPin}>
                <span className={styles.mapPointLabel}>{pointLabel}</span>
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

function getAssetLabel(assetKey: ReportingAssetKey) {
  return reportingAssetMockOptions.find((option) => option.key === assetKey)?.label ?? assetKey
}

function getAssetInitials(label: string) {
  return label
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
}
