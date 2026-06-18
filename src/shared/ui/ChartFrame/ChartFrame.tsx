'use client'

import { cloneElement, useEffect, useRef, useState, type ReactElement } from 'react'

import styles from './ChartFrame.module.css'

type ChartFrameProps = {
  className: string
  children: ReactElement<{ height?: number; width?: number }>
}

const SKELETON_BARS = [36, 62, 48, 78, 54, 68, 42]

export function ChartFrame({ className, children }: ChartFrameProps) {
  const rootRef = useRef<HTMLDivElement | null>(null)
  const [size, setSize] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const root = rootRef.current

    if (!root) {
      return
    }

    const updateSize = () => {
      const { width, height } = root.getBoundingClientRect()

      setSize({
        width: Math.floor(width),
        height: Math.floor(height)
      })
    }

    updateSize()

    const observer = new ResizeObserver(updateSize)
    observer.observe(root)

    return () => {
      observer.disconnect()
    }
  }, [])

  return (
    <div ref={rootRef} className={className} aria-hidden="true">
      {size.width > 0 && size.height > 0 ? (
        cloneElement(children, {
          width: size.width,
          height: size.height
        })
      ) : (
        <div className={styles.skeleton}>
          <div className={styles.skeletonGrid} />
          <div className={styles.skeletonLine} />
          <div className={styles.skeletonBars}>
            {SKELETON_BARS.map((height, index) => (
              <span key={index} style={{ height: `${height}%` }} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
