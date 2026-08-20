'use client'

import { FullscreenOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import classNames from 'classnames'
import { useCallback, useRef, useState } from 'react'

import { useClickOutside } from '@/shared/hooks'
import { VideoStream } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'

type GraphCameraOverlayProps = {
  className?: string
  description?: string
  detailSrc: string
  onClosePreview: () => void
  previewSrc: string
  title: string
}

export function GraphCameraOverlay({
  className,
  description,
  detailSrc,
  onClosePreview,
  previewSrc,
  title
}: GraphCameraOverlayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const previewRef = useRef<HTMLDivElement>(null)
  const closePreview = useCallback(() => {
    if (!isModalOpen) {
      onClosePreview()
    }
  }, [isModalOpen, onClosePreview])

  useClickOutside(previewRef, closePreview)

  return (
    <>
      <div className={classNames(styles.graphVideoOverlay, className)} ref={previewRef}>
        <button
          className={styles.graphVideoPreviewButton}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          {!isModalOpen ? <VideoStream controls={false} src={previewSrc} /> : null}
          <span className={styles.graphVideoPreviewHover}>
            <FullscreenOutlined />
          </span>
        </button>
      </div>
      <Modal
        centered
        className={styles.graphCameraModal}
        footer={null}
        open={isModalOpen}
        title={title}
        width={960}
        onCancel={() => setIsModalOpen(false)}
      >
        <div className={styles.graphCameraModalContent}>
          <div className={styles.graphCameraModalVideo}>
            {isModalOpen ? <VideoStream src={detailSrc} /> : null}
          </div>
          {description ? <p className={styles.graphCameraModalDescription}>{description}</p> : null}
        </div>
      </Modal>
    </>
  )
}
