'use client'

import { LeftOutlined, RightOutlined } from '@ant-design/icons'
import classNames from 'classnames'
import { Button } from 'antd'
import { useSearchParams } from 'next/navigation'
import { useCallback, useEffect, useRef, useState } from 'react'

import {
  reportingMockData,
  type ReportingAssetKey,
  type ReportingDataset
} from '@/entities/reporting'
import { formatNumber, formatPercent } from '@/shared/utils'

import styles from './ReportingKpiPanel.module.css'

const ASSET_PARAM = 'asset'
const DEFAULT_ASSET_KEY: ReportingAssetKey = 'group'
const SCROLL_ITEM_FALLBACK_WIDTH = 160

function getDataset(assetKey: string | null): ReportingDataset {
  return (
    reportingMockData.find((dataset) => dataset.assetKey === assetKey) ??
    reportingMockData.find((dataset) => dataset.assetKey === DEFAULT_ASSET_KEY) ??
    reportingMockData[0]
  )
}

export function ReportingKpiPanel() {
  const searchParams = useSearchParams()
  const dataset = getDataset(searchParams.get(ASSET_PARAM))
  const scrollRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)

  const updateScrollState = useCallback(() => {
    const scrollElement = scrollRef.current

    if (!scrollElement) {
      return
    }

    const maxScrollLeft = scrollElement.scrollWidth - scrollElement.clientWidth

    setCanScrollLeft(scrollElement.scrollLeft > 0)
    setCanScrollRight(scrollElement.scrollLeft < maxScrollLeft - 1)
  }, [])

  const scrollByItem = useCallback((direction: -1 | 1) => {
    const scrollElement = scrollRef.current

    if (!scrollElement) {
      return
    }

    const firstItem = scrollElement.querySelector<HTMLElement>('[data-kpi-item]')
    const itemWidth = firstItem?.offsetWidth ?? SCROLL_ITEM_FALLBACK_WIDTH
    const gap = Number.parseFloat(getComputedStyle(scrollElement).columnGap) || 0

    scrollElement.scrollBy({
      left: direction * (itemWidth + gap),
      behavior: 'smooth'
    })
  }, [])

  useEffect(() => {
    const scrollElement = scrollRef.current

    if (!scrollElement) {
      return
    }

    updateScrollState()

    const resizeObserver = new ResizeObserver(updateScrollState)
    resizeObserver.observe(scrollElement)

    return () => resizeObserver.disconnect()
  }, [dataset.kpiSummary.length, updateScrollState])

  return (
    <section className={styles.panel}>
      <div className={styles.viewport}>
        {(canScrollLeft || canScrollRight) && (
          <Button
            className={classNames(styles.navButton, styles.navButtonLeft)}
            disabled={!canScrollLeft}
            icon={<LeftOutlined />}
            size="small"
            type="text"
            onClick={() => scrollByItem(-1)}
          />
        )}
        <div className={styles.scroller} ref={scrollRef} onScroll={updateScrollState}>
          {dataset.kpiSummary.map((item) => {
            const delta = item.delta
            const isDeltaPositive = delta !== null && delta > 0
            const isDeltaNegative = delta !== null && delta < 0

            return (
              <article className={styles.item} data-kpi-item key={item.key}>
                <div className={styles.label}>{item.label}</div>
                <div className={styles.value}>
                  {item.value === null
                    ? '-'
                    : formatNumber(item.value, { fractionDigits: item.fractionDigits })}
                </div>
                <div className={styles.meta}>
                  {delta !== null ? (
                    <span
                      className={classNames(styles.delta, {
                        [styles.positive]: item.inverseDelta ? isDeltaNegative : isDeltaPositive,
                        [styles.negative]: item.inverseDelta ? isDeltaPositive : isDeltaNegative
                      })}
                    >
                      {formatPercent(delta, 0)}
                    </span>
                  ) : (
                    <span className={styles.status}>В норме</span>
                  )}
                  <span className={styles.target}>
                    {item.targetLabel}{' '}
                    {item.target === undefined
                      ? item.unit
                      : formatNumber(item.target, { fractionDigits: item.fractionDigits })}
                  </span>
                </div>
              </article>
            )
          })}
        </div>
        {(canScrollLeft || canScrollRight) && (
          <Button
            className={classNames(styles.navButton, styles.navButtonRight)}
            disabled={!canScrollRight}
            icon={<RightOutlined />}
            size="small"
            type="text"
            onClick={() => scrollByItem(1)}
          />
        )}
      </div>
    </section>
  )
}
