'use client'

import { FullscreenOutlined } from '@ant-design/icons'
import { Modal } from 'antd'
import classNames from 'classnames'
import { useCallback, useRef, useState } from 'react'

import {
  useGetVideoCamerasQuery,
  useGetVideoRecordStreamQuery,
  useVideoWatchSession
} from '@/entities/video-record'
import { useClickOutside } from '@/shared/hooks'
import { Loader, VideoStream } from '@/shared/ui'

import styles from '../ProductionSummaryDashboard.module.css'

type GraphCameraOverlayProps = {
  cameras?: GraphCamera[]
  className?: string
  onClosePreview: () => void
  siteSlug: string
}

export type GraphCamera = {
  detailSrc?: string
  id: string
  name: string
  previewSrc?: string
}

export function GraphCameraOverlay({
  cameras: providedCameras,
  className,
  onClosePreview,
  siteSlug
}: GraphCameraOverlayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCamera, setSelectedCamera] = useState<GraphCamera>()
  const shouldFetchCameras = !providedCameras
  const previewRef = useRef<HTMLDivElement>(null)
  const {
    data: camerasData,
    isError: isCamerasError,
    isFetching: isCamerasFetching,
    isLoading: isCamerasLoading
  } = useGetVideoCamerasQuery(
    { site_slug: siteSlug },
    {
      skip: !shouldFetchCameras
    }
  )
  const cameras = providedCameras ?? camerasData ?? []
  const {
    data: liveStream,
    isFetching: isLiveStreamFetching,
    isLoading: isLiveStreamLoading
  } = useGetVideoRecordStreamQuery(
    {
      objectGuid: selectedCamera?.id ?? '',
      siteSlug,
      stream: 'live'
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !isModalOpen || !selectedCamera || Boolean(selectedCamera.detailSrc)
    }
  )
  const liveStreamSrc = selectedCamera?.detailSrc ?? liveStream?.stream_url

  useVideoWatchSession({
    enabled: isModalOpen && !selectedCamera?.detailSrc,
    sessionId: selectedCamera?.id,
    stream: liveStream
  })

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

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedCamera(undefined)
  }, [])

  const openCamera = useCallback((camera: GraphCamera) => {
    setSelectedCamera(camera)
    setIsModalOpen(true)
  }, [])

  return (
    <>
      <div
        className={classNames(styles.graphVideoOverlay, styles.graphCameraOverlayList, className)}
        ref={previewRef}
      >
        {shouldFetchCameras && (isCamerasLoading || isCamerasFetching) ? (
          <div className={styles.graphCameraPreviewCard}>
            <Loader size="small" description="Загружаем камеры..." />
          </div>
        ) : null}
        {shouldFetchCameras && !isCamerasLoading && !isCamerasFetching && isCamerasError ? (
          <div className={classNames(styles.graphCameraPreviewCard, styles.videoRecordStatus)}>
            Не удалось загрузить камеры
          </div>
        ) : null}
        {!isCamerasLoading && !isCamerasFetching && !isCamerasError && cameras.length === 0 ? (
          <div className={classNames(styles.graphCameraPreviewCard, styles.videoRecordStatus)}>
            Нет доступных камер
          </div>
        ) : null}
        {cameras.map((camera) => (
          <CameraPreview
            key={camera.id}
            camera={camera}
            isStopped={isModalOpen}
            siteSlug={siteSlug}
            onOpen={openCamera}
          />
        ))}
      </div>
      <Modal
        centered
        className={styles.graphCameraModal}
        footer={null}
        open={isModalOpen}
        title={selectedCamera?.name ?? 'Камера'}
        width={960}
        onCancel={closeModal}
      >
        <div className={styles.graphCameraModalContent}>
          <div className={styles.graphCameraModalVideo}>
            {isLiveStreamLoading || isLiveStreamFetching ? (
              <Loader description="Подключаем камеру..." />
            ) : null}
            {!isLiveStreamLoading && !isLiveStreamFetching && !liveStreamSrc ? (
              <div className={styles.videoRecordModalStatus}>Камера недоступна</div>
            ) : null}
            {isModalOpen && liveStreamSrc ? <VideoStream src={liveStreamSrc} /> : null}
          </div>
        </div>
      </Modal>
    </>
  )
}

type CameraPreviewProps = {
  camera: GraphCamera
  isStopped: boolean
  onOpen: (camera: GraphCamera) => void
  siteSlug: string
}

function CameraPreview({ camera, isStopped, onOpen, siteSlug }: CameraPreviewProps) {
  const {
    data: previewStream,
    isFetching,
    isLoading
  } = useGetVideoRecordStreamQuery(
    {
      objectGuid: camera.id,
      siteSlug,
      stream: 'preview'
    },
    {
      refetchOnMountOrArgChange: true,
      skip: isStopped || Boolean(camera.previewSrc)
    }
  )

  useVideoWatchSession({
    enabled: !isStopped && !camera.previewSrc,
    sessionId: camera.id,
    stream: previewStream
  })

  const isPreviewLoading = isLoading || isFetching
  const previewStreamSrc = camera.previewSrc ?? previewStream?.stream_url

  return (
    <button
      className={classNames(styles.graphVideoPreviewButton, styles.graphCameraPreviewCard)}
      disabled={isStopped || !previewStreamSrc}
      type="button"
      onClick={() => onOpen(camera)}
    >
      {!isStopped && isPreviewLoading ? <Loader size="small" description="Подключаем..." /> : null}
      {!isStopped && !isPreviewLoading && previewStreamSrc ? (
        <VideoStream controls={false} src={previewStreamSrc} />
      ) : null}
      {!isStopped && !isPreviewLoading && !previewStreamSrc ? (
        <div className={styles.videoRecordStatus}>Камера недоступна</div>
      ) : null}
      <span className={styles.graphVideoPreviewHover}>
        <FullscreenOutlined />
      </span>
    </button>
  )
}
