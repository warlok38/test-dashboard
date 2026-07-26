'use client'

import { FullscreenOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import { useState } from 'react'

import { VideoStream } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'

type GraphCameraOverlayProps = {
  description?: string
  detailSrc: string
  previewSrc: string
  title: string
}

export function GraphCameraOverlay({
  description,
  detailSrc,
  previewSrc,
  title
}: GraphCameraOverlayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className={styles.graphVideoOverlay}>
        <button
          className={styles.graphVideoPreviewButton}
          type="button"
          onClick={() => setIsModalOpen(true)}
        >
          <VideoStream controls={false} isPlaying={!isModalOpen} src={previewSrc} />
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
            <VideoStream isPlaying={isModalOpen} src={detailSrc} />
          </div>
          {description ? <p className={styles.graphCameraModalDescription}>{description}</p> : null}
        </div>
      </Modal>
    </>
  )
}
