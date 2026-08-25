'use client'

import { FullscreenOutlined } from '@ant-design/icons'

import { ModelViewer } from '@/shared/ui'

import type { MediaModel } from '../../../model'
import styles from '../ModelOverlay.module.css'

type PreviewProps = {
  cameraDistanceMultiplier: number
  model: MediaModel
  onOpen: (model: MediaModel) => void
}

export function Preview({ cameraDistanceMultiplier, model, onOpen }: PreviewProps) {
  return (
    <button className={styles.previewButton} type="button" onClick={() => onOpen(model)}>
      <ModelViewer
        cameraDistanceMultiplier={cameraDistanceMultiplier}
        config={model.config}
        loadingDescription="Загружаем модель..."
        src={model.src}
      />
      <span className={styles.previewHover}>
        <FullscreenOutlined />
      </span>
    </button>
  )
}
