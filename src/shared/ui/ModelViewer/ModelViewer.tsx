'use client'

import classNames from 'classnames'

import styles from './ModelViewer.module.css'
import type { ModelAxisBounds, ModelAxisControls, ModelViewerConfig } from './model/viewer'
import { useModelViewerScene } from './model/useModelViewerScene'
import { Loader } from '../Loader'

type ModelViewerProps = {
  axisControls?: ModelAxisControls
  autoRotate?: boolean
  cameraDistanceMultiplier?: number
  className?: string
  color?: string
  config?: ModelViewerConfig
  errorDescription?: string
  interactive?: boolean
  loadingDescription?: string
  onAxisBoundsChange?: (bounds: ModelAxisBounds) => void
  onAxisControlsChange?: (controls: ModelAxisControls) => void
  resetKey?: number
  showRotationAxis?: boolean
  src: string
}

export function ModelViewer({
  axisControls,
  autoRotate = false,
  cameraDistanceMultiplier,
  className,
  color,
  config,
  errorDescription = 'Модель недоступна',
  interactive = false,
  loadingDescription = 'Загружаем модель...',
  onAxisBoundsChange,
  onAxisControlsChange,
  resetKey = 0,
  showRotationAxis = false,
  src
}: ModelViewerProps) {
  const { containerRef, loadState, pointerCoordinates, progress } = useModelViewerScene({
    axisControls,
    autoRotate,
    cameraDistanceMultiplier: cameraDistanceMultiplier ?? config?.cameraDistanceMultiplier,
    color,
    config,
    interactive,
    onAxisBoundsChange,
    onAxisControlsChange,
    resetKey,
    showRotationAxis,
    src
  })

  const progressLabel =
    progress === null ? loadingDescription : `${loadingDescription} ${progress}%`

  return (
    <div className={classNames(styles.modelViewer, className)} ref={containerRef}>
      {pointerCoordinates ? (
        <div
          className={styles.coordinatesTooltip}
          style={{
            transform: `translate(${pointerCoordinates.left}px, ${pointerCoordinates.top}px)`
          }}
        >
          <span>X</span>
          <strong>{pointerCoordinates.point.x.toFixed(1)}</strong>
          <span>Y</span>
          <strong>{pointerCoordinates.point.y.toFixed(1)}</strong>
          <span>Z</span>
          <strong>{pointerCoordinates.point.z.toFixed(1)}</strong>
        </div>
      ) : null}
      {loadState === 'loading' || loadState === 'idle' ? (
        <div className={styles.state}>
          <Loader size="small" description={progressLabel} />
        </div>
      ) : null}
      {loadState === 'error' ? (
        <div className={classNames(styles.state, styles.error)}>{errorDescription}</div>
      ) : null}
    </div>
  )
}
