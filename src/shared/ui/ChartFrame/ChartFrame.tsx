'use client'

import { cloneElement, useEffect, useRef, useState, type ReactElement } from 'react'

import styles from './ChartFrame.module.css'

type ChartFrameProps = {
  className: string
  children:
    | ReactElement<{ height?: number; width?: number }>
    | ((size: ChartFrameSize) => ReactElement<{ height?: number; width?: number }>)
}

type ChartFrameSize = {
  width: number
  height: number
}

const CHART_RESIZE_DEBOUNCE_MS = 120

export function ChartFrame({ className, children }: ChartFrameProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const resizeTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })
  const hasMeasuredSize = size.width > 0 && size.height > 0

  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const commitSize = ({ width, height }: ChartFrameSize) => {
      const nextSize = {
        width: Math.floor(width),
        height: Math.floor(height)
      }

      if (nextSize.width <= 0 || nextSize.height <= 0) {
        return
      }

      setSize((currentSize) =>
        currentSize.width === nextSize.width && currentSize.height === nextSize.height
          ? currentSize
          : nextSize
      )
    }

    commitSize(root.getBoundingClientRect())

    const scheduleSizeCommit = ([entry]: ResizeObserverEntry[]) => {
      if (!entry) {
        return
      }

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
      }

      const nextSize = {
        width: entry.contentRect.width,
        height: entry.contentRect.height
      }

      resizeTimeoutRef.current = setTimeout(() => {
        commitSize(nextSize)
        resizeTimeoutRef.current = null
      }, CHART_RESIZE_DEBOUNCE_MS)
    }

    const observer = new ResizeObserver(scheduleSizeCommit)
    observer.observe(root)

    return () => {
      observer.disconnect()

      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current)
        resizeTimeoutRef.current = null
      }
    }
  }, [])

  const renderChart = () => {
    if (!hasMeasuredSize) {
      return null
    }

    const chart = typeof children === 'function' ? children(size) : children

    return cloneElement(chart, {
      width: size.width,
      height: size.height
    })
  }

  return (
    <div ref={rootRef} className={`${styles.frame} ${className}`}>
      {renderChart()}
    </div>
  )
}
