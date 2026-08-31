'use client'

import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import type { ReportingAssetKey } from '@/entities/reporting'

import { REPORTING_MAP_IMAGE_SIZE } from '../model/reporting-map-points'
import styles from '../ReportingOverview.module.css'
import { ReportingMapPoints } from './ReportingMapPoints'

type ReportingMapProps = {
  activeAssetKey: ReportingAssetKey
}

type ImagePlaneRect = {
  width: number
  height: number
  left: number
  top: number
}

export function ReportingMap({ activeAssetKey }: ReportingMapProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const [imagePlaneRect, setImagePlaneRect] = useState<ImagePlaneRect | null>(null)

  useEffect(() => {
    const panel = panelRef.current

    if (!panel) {
      return
    }

    const updateImagePlaneRect = () => {
      setImagePlaneRect(getCoverImageRect(panel.getBoundingClientRect()))
    }

    updateImagePlaneRect()

    const observer = new ResizeObserver(updateImagePlaneRect)
    observer.observe(panel)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div className={styles.mapPanel} ref={panelRef}>
      <div className={styles.mapImagePlane} style={imagePlaneRect ?? undefined}>
        <Image
          alt=""
          className={styles.mapImage}
          fill
          priority
          src="/reporting/russia-map.png"
          sizes="49vw"
        />
        <ReportingMapPoints activeAssetKey={activeAssetKey} />
      </div>
    </div>
  )
}

function getCoverImageRect(containerRect: DOMRect): ImagePlaneRect {
  const widthRatio = containerRect.width / REPORTING_MAP_IMAGE_SIZE.width
  const heightRatio = containerRect.height / REPORTING_MAP_IMAGE_SIZE.height
  const scale = Math.max(widthRatio, heightRatio)
  const width = REPORTING_MAP_IMAGE_SIZE.width * scale
  const height = REPORTING_MAP_IMAGE_SIZE.height * scale

  return {
    width,
    height,
    left: containerRect.width - width,
    top: (containerRect.height - height) / 2
  }
}
