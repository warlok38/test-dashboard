'use client'

import classNames from 'classnames'

import styles from './ModelViewer.module.css'
import { useModelViewerScene } from './model/useModelViewerScene'
import { Loader } from '../Loader'

type ModelViewerProps = {
  autoRotate?: boolean
  cameraDistanceMultiplier?: number
  className?: string
  color?: string
  errorDescription?: string
  interactive?: boolean
  loadingDescription?: string
  src: string
}

export function ModelViewer({
  autoRotate = false,
  cameraDistanceMultiplier,
  className,
  color,
  errorDescription = 'Модель недоступна',
  interactive = false,
  loadingDescription = 'Загружаем модель...',
  src
}: ModelViewerProps) {
  const { containerRef, loadState, progress } = useModelViewerScene({
    autoRotate,
    cameraDistanceMultiplier,
    color,
    interactive,
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
