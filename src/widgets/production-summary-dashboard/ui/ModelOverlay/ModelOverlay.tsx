'use client'

import { ProductOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import classNames from 'classnames'
import { useCallback, useRef } from 'react'

import { useClickOutside } from '@/shared/hooks'
import { ModelViewer } from '@/shared/ui'

import type { MediaModel } from '../../model'
import styles from './ModelOverlay.module.css'
import { useOverlayState } from './model/useOverlayState'
import { ControlsPanel } from './ui/ControlsPanel'
import { Preview } from './ui/Preview'

type ModelOverlayProps = {
  className?: string
  models: MediaModel[]
  onClosePreview: () => void
}

const PREVIEW_CAMERA_DISTANCE_MULTIPLIER = 1.35

export function ModelToggleIcon() {
  return (
    <span className={styles.modelToggleIcon}>
      <ProductOutlined />
      <span>3D</span>
    </span>
  )
}

export function ModelOverlay({ className, models, onClosePreview }: ModelOverlayProps) {
  const overlayState = useOverlayState()
  const previewRef = useRef<HTMLDivElement>(null)
  const previewModel = models[0]

  const closePreview = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const target = event.target
      const element = target instanceof Element ? target : null

      if (!overlayState.isModalOpen && !element?.closest('.ant-modal-root')) {
        onClosePreview()
      }
    },
    [overlayState.isModalOpen, onClosePreview]
  )

  useClickOutside(previewRef, closePreview)

  if (!previewModel) {
    return null
  }

  return (
    <>
      <div className={classNames(styles.modelOverlay, className)} ref={previewRef}>
        <Preview
          cameraDistanceMultiplier={PREVIEW_CAMERA_DISTANCE_MULTIPLIER}
          model={previewModel}
          onOpen={overlayState.openModel}
        />
      </div>
      <Modal
        centered
        className={styles.modal}
        footer={null}
        open={overlayState.isModalOpen}
        title={overlayState.selectedModel?.name ?? '3D-модель'}
        width="92vw"
        onCancel={overlayState.closeModal}
      >
        <div className={styles.modalContent}>
          <div className={styles.viewerFrame}>
            {overlayState.isModalOpen && overlayState.selectedModel ? (
              <ModelViewer
                {...overlayState.viewerProps}
                interactive
                loadingDescription="Загружаем модель..."
                src={overlayState.selectedModel.src}
              />
            ) : null}
            <ControlsPanel state={overlayState.controlsPanel} />
          </div>
        </div>
      </Modal>
    </>
  )
}
