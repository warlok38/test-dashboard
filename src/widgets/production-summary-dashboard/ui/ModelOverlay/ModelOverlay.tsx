'use client'

import { FullscreenOutlined, ProductOutlined } from '@ant-design/icons'
import { ColorPicker, Modal, Switch } from 'antd'
import classNames from 'classnames'
import { type KeyboardEvent, useCallback, useRef, useState } from 'react'

import { useClickOutside } from '@/shared/hooks'
import { ModelViewer } from '@/shared/ui'

import type { MediaModel } from '../../model'
import styles from './ModelOverlay.module.css'

type ModelOverlayProps = {
  className?: string
  models: MediaModel[]
  onClosePreview: () => void
}

const DEFAULT_MODEL_COLOR = '#d6b15c'
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i
const PREVIEW_CAMERA_DISTANCE_MULTIPLIER = 1.35

function normalizeHexColor(value: string) {
  const trimmedValue = value.trim()
  const hexValue = trimmedValue.startsWith('#') ? trimmedValue : `#${trimmedValue}`

  return HEX_COLOR_PATTERN.test(hexValue) ? hexValue.toUpperCase() : null
}

export function ModelToggleIcon() {
  return (
    <span className={styles.modelToggleIcon}>
      <ProductOutlined />
      <span>3D</span>
    </span>
  )
}

export function ModelOverlay({ className, models, onClosePreview }: ModelOverlayProps) {
  const [autoRotate, setAutoRotate] = useState(true)
  const [color, setColor] = useState(DEFAULT_MODEL_COLOR)
  const [colorInput, setColorInput] = useState(DEFAULT_MODEL_COLOR.toUpperCase())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedModel, setSelectedModel] = useState<MediaModel>()
  const [showControls, setShowControls] = useState(true)
  const previewRef = useRef<HTMLDivElement>(null)
  const previewModel = models[0]
  const colorHex = color.toUpperCase()

  const updateColor = useCallback((nextColor: string) => {
    const normalizedColor = normalizeHexColor(nextColor)

    if (!normalizedColor) {
      return
    }

    setColor(normalizedColor)
    setColorInput(normalizedColor)
  }, [])

  const commitColorInput = useCallback(() => {
    const normalizedColor = normalizeHexColor(colorInput)

    if (normalizedColor) {
      setColor(normalizedColor)
      setColorInput(normalizedColor)
      return
    }

    setColorInput(colorHex)
  }, [colorHex, colorInput])

  const commitColorInputOnEnter = useCallback((event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.currentTarget.blur()
    }
  }, [])

  const closePreview = useCallback(
    (event: MouseEvent | TouchEvent) => {
      const target = event.target
      const element = target instanceof Element ? target : null

      if (!isModalOpen && !element?.closest('.ant-modal-root')) {
        onClosePreview()
      }
    },
    [isModalOpen, onClosePreview]
  )

  useClickOutside(previewRef, closePreview)

  const openModel = useCallback((model: MediaModel) => {
    setSelectedModel(model)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedModel(undefined)
  }, [])

  if (!previewModel) {
    return null
  }

  return (
    <>
      <div className={classNames(styles.modelOverlay, className)} ref={previewRef}>
        <button
          className={styles.previewButton}
          type="button"
          onClick={() => openModel(previewModel)}
        >
          <ModelViewer
            cameraDistanceMultiplier={PREVIEW_CAMERA_DISTANCE_MULTIPLIER}
            loadingDescription="Загружаем модель..."
            src={previewModel.src}
          />
          <span className={styles.previewHover}>
            <FullscreenOutlined />
          </span>
        </button>
      </div>
      <Modal
        centered
        className={styles.modal}
        footer={null}
        open={isModalOpen}
        title={selectedModel?.name ?? '3D-модель'}
        width="92vw"
        onCancel={closeModal}
      >
        <div className={styles.modalContent}>
          <div className={styles.viewerFrame}>
            {isModalOpen && selectedModel ? (
              <ModelViewer
                autoRotate={autoRotate}
                color={color}
                interactive
                loadingDescription="Загружаем модель..."
                src={selectedModel.src}
              />
            ) : null}
            <div className={styles.controlsStack}>
              {showControls ? (
                <div className={styles.controlsPanel}>
                  <label className={styles.controlRow}>
                    <span className={styles.controlLabel}>Автовращение</span>
                    <Switch size="small" checked={autoRotate} onChange={setAutoRotate} />
                  </label>
                  <div className={styles.controlRow}>
                    <span className={styles.controlLabel}>Цвет модели</span>
                    <div className={styles.colorValue}>
                      <input
                        className={styles.colorInput}
                        maxLength={7}
                        spellCheck={false}
                        value={colorInput}
                        onBlur={commitColorInput}
                        onChange={(event) => setColorInput(event.target.value)}
                        onKeyDown={commitColorInputOnEnter}
                      />
                      <ColorPicker
                        disabledAlpha
                        format="hex"
                        value={color}
                        onChange={(value) => updateColor(value.toHexString())}
                      >
                        <button className={styles.colorButton} type="button">
                          <span className={styles.colorSwatch} style={{ backgroundColor: color }} />
                        </button>
                      </ColorPicker>
                    </div>
                  </div>
                </div>
              ) : null}
              <button
                className={styles.controlsToggleButton}
                type="button"
                onClick={() => setShowControls(!showControls)}
              >
                {showControls ? 'Скрыть настройки' : 'Показать настройки'}
              </button>
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
