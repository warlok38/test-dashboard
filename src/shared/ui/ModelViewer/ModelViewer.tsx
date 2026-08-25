'use client'

import classNames from 'classnames'

import styles from './ModelViewer.module.css'
import type { ModelAxisBounds, ModelAxisControls } from './model/viewer'
import { useModelViewerScene } from './model/useModelViewerScene'
import { Loader } from '../Loader'

type ModelViewerProps = {
  axisControls?: ModelAxisControls
  autoRotate?: boolean
  cameraDistanceMultiplier?: number
  className?: string
  color?: string
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
  errorDescription = 'Модель недоступна',
  interactive = false,
  loadingDescription = 'Загружаем модель...',
  onAxisBoundsChange,
  onAxisControlsChange,
  resetKey = 0,
  showRotationAxis = false,
  src
}: ModelViewerProps) {
  const { containerRef, loadState, progress } = useModelViewerScene({
    axisControls,
    autoRotate,
    cameraDistanceMultiplier,
    color,
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
