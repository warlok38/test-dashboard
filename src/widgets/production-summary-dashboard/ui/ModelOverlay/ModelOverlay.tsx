'use client'

import { ProductOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import classNames from 'classnames'
import { useCallback, useEffect, useState } from 'react'

import { ModelViewer } from '@/shared/ui'

import type { MediaModel } from '../../model'
import styles from './ModelOverlay.module.css'
import { useOverlayState } from './model/useOverlayState'
import { ControlsPanel } from './ui/ControlsPanel'

type ModelOverlayProps = {
  className?: string
  models: MediaModel[]
  onClosePreview: () => void
}

const CONTROL_LINES = [
  {
    accent: 'ЛКМ + движение мыши',
    text: '— вращать камеру относительно точки обзора'
  },
  {
    accent: 'Колесо мыши',
    text: '— зум, при максимальном зуме - вид от первого лица'
  },
  {
    accent: 'ЛКМ + движение мыши за точку',
    text: '— перемещение оси вращения по горизонтали'
  },
  {
    accent: 'ПКМ + движение мыши за точку',
    text: '— перемещение точки вращения по вертикали'
  }
] as const

export function ModelToggleIcon() {
  return (
    <span className={styles.modelToggleIcon}>
      <ProductOutlined />
      <span>3D</span>
    </span>
  )
}

export function ModelOverlay({ className, models, onClosePreview }: ModelOverlayProps) {
  const { closeModal, controlsPanel, isModalOpen, openModel, selectedModel, viewerProps } =
    useOverlayState()
  const [showControlInfo, setShowControlInfo] = useState(false)
  const previewModel = models[0]

  useEffect(() => {
    if (previewModel) {
      openModel(previewModel)
    }
  }, [openModel, previewModel])

  const closeModel = useCallback(() => {
    closeModal()
    onClosePreview()
  }, [closeModal, onClosePreview])

  return (
    <div className={classNames(styles.modelOverlayHost, className)}>
      <Modal
        centered
        className={styles.modal}
        footer={null}
        open={isModalOpen}
        title={selectedModel?.name ?? '3D-модель'}
        width="92vw"
        onCancel={closeModel}
      >
        <div className={styles.modalContent}>
          <div className={styles.viewerFrame}>
            {isModalOpen && selectedModel ? (
              <ModelViewer
                {...viewerProps}
                config={selectedModel.config}
                interactive
                loadingDescription="Загружаем модель..."
                src={selectedModel.src}
              />
            ) : null}
            <ControlsPanel state={controlsPanel} />
            <div className={styles.controlInfoStack}>
              {showControlInfo ? (
                <div className={styles.controlsPanel}>
                  <div className={styles.controlInfoContent}>
                    <div className={styles.controlInfoTitle}>Управление</div>
                    <div className={styles.controlInfoList}>
                      {CONTROL_LINES.map((line) => (
                        <p className={styles.controlInfoLine} key={line.accent}>
                          <span>{line.accent}</span> {line.text}
                        </p>
                      ))}
                    </div>
                  </div>
                </div>
              ) : null}
              <button
                className={styles.controlsToggleButton}
                type="button"
                onClick={() => setShowControlInfo((isVisible) => !isVisible)}
              >
                {showControlInfo ? 'Скрыть управление' : 'Показать управление'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </div>
  )
}
