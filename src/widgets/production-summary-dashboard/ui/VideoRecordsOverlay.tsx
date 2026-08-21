'use client'

import { FullscreenOutlined } from '@ant-design/icons'
import { Modal, Select } from 'antd'
import classNames from 'classnames'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import {
  useGetVideoRecordStreamQuery,
  useGetVideoRecordsQuery,
  useVideoWatchSession
} from '@/entities/video-record'
import { useClickOutside } from '@/shared/hooks'
import { Loader, VideoStream } from '@/shared/ui'
import { formatSmartDateTime } from '@/shared/utils/formatDateTime'

import styles from '../ProductionSummaryDashboard.module.css'

type VideoRecordsOverlayProps = {
  className?: string
  onClosePreview: () => void
  siteSlug: string
}

export function VideoRecordsOverlay({
  className,
  onClosePreview,
  siteSlug
}: VideoRecordsOverlayProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isPreviewSelectOpen, setIsPreviewSelectOpen] = useState(false)
  const [isModalSelectOpen, setIsModalSelectOpen] = useState(false)
  const [isModalVideoPaused, setIsModalVideoPaused] = useState(true)
  const [selectedRecordId, setSelectedRecordId] = useState<string>()
  const previewRef = useRef<HTMLDivElement>(null)
  const {
    data: recordsData,
    isFetching: isRecordsFetching,
    isLoading: isRecordsLoading
  } = useGetVideoRecordsQuery({ site_slug: siteSlug })
  const records = useMemo(() => recordsData ?? [], [recordsData])
  const selectedRecord = records.find((record) => record.id === selectedRecordId)
  const recordOptions = records.map((record) => ({
    label: formatSmartDateTime(record.record_date),
    value: record.id
  }))
  const {
    data: previewStream,
    isFetching: isPreviewStreamFetching,
    isLoading: isPreviewStreamLoading
  } = useGetVideoRecordStreamQuery(
    {
      objectGuid: selectedRecordId ?? '',
      siteSlug,
      stream: 'preview'
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedRecordId || isModalOpen
    }
  )
  const {
    data: liveStream,
    isFetching: isLiveStreamFetching,
    isLoading: isLiveStreamLoading
  } = useGetVideoRecordStreamQuery(
    {
      objectGuid: selectedRecordId ?? '',
      siteSlug,
      stream: 'live'
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !selectedRecordId || !isModalOpen
    }
  )

  useVideoWatchSession({
    enabled: !isModalOpen,
    stream: previewStream
  })
  useVideoWatchSession({
    enabled: isModalOpen,
    stream: liveStream
  })

  const closePreview = useCallback(() => {
    if (!isModalOpen) {
      onClosePreview()
    }
  }, [isModalOpen, onClosePreview])

  useClickOutside(previewRef, closePreview)

  useEffect(() => {
    if (records.length === 0) {
      setSelectedRecordId(undefined)

      return
    }

    if (!selectedRecordId || !records.some((record) => record.id === selectedRecordId)) {
      setSelectedRecordId(records[0].id)
    }
  }, [records, selectedRecordId])

  const renderPreviewContent = () => {
    if (isRecordsLoading || isRecordsFetching) {
      return <Loader size="small" description="Загружаем записи..." />
    }

    if (records.length === 0) {
      return <div className={styles.videoRecordStatus}>Нет доступных записей</div>
    }

    if (isPreviewStreamLoading || isPreviewStreamFetching) {
      return <Loader size="small" description="Подключаем видео..." />
    }

    if (!previewStream?.stream_url) {
      return <div className={styles.videoRecordStatus}>Видео недоступно</div>
    }

    return <VideoStream controls={false} src={previewStream.stream_url} />
  }

  const renderModalContent = () => {
    if (isLiveStreamLoading || isLiveStreamFetching) {
      return <Loader description="Подключаем видео..." />
    }

    if (!liveStream?.stream_url) {
      return <div className={styles.videoRecordModalStatus}>Видео недоступно</div>
    }

    return (
      <VideoStream
        src={liveStream.stream_url}
        onPlayingChange={(isPlaying) => {
          setIsModalVideoPaused(!isPlaying)

          if (isPlaying && document.activeElement instanceof HTMLElement) {
            document.activeElement.blur()
          }
        }}
      />
    )
  }
  const recordSelect = (
    <Select
      className={styles.videoRecordSelect}
      disabled={recordOptions.length === 0}
      loading={isRecordsLoading || isRecordsFetching}
      options={recordOptions}
      placement="bottomLeft"
      popupMatchSelectWidth={false}
      size="small"
      value={selectedRecordId}
      onChange={(value) => {
        setSelectedRecordId(value)
        setIsModalSelectOpen(false)
      }}
      onOpenChange={setIsModalSelectOpen}
    />
  )

  return (
    <>
      <div className={classNames(styles.graphVideoOverlay, className)} ref={previewRef}>
        <div
          className={classNames(styles.videoRecordPreview, {
            [styles.videoRecordPreviewSelectOpen]: isPreviewSelectOpen
          })}
        >
          {!isModalOpen ? renderPreviewContent() : null}
          <div className={styles.videoRecordControls} onClick={(event) => event.stopPropagation()}>
            <Select
              className={styles.videoRecordSelect}
              disabled={recordOptions.length === 0}
              getPopupContainer={(triggerNode) => triggerNode.parentElement ?? document.body}
              loading={isRecordsLoading || isRecordsFetching}
              open={isPreviewSelectOpen}
              options={recordOptions}
              placement="bottomLeft"
              popupMatchSelectWidth={false}
              size="small"
              value={selectedRecordId}
              onChange={(value) => {
                setSelectedRecordId(value)
                setIsPreviewSelectOpen(false)
              }}
              onOpenChange={setIsPreviewSelectOpen}
            />
          </div>
          <button
            className={styles.videoRecordFullscreenButton}
            disabled={!previewStream?.stream_url}
            type="button"
            onClick={() => {
              setIsModalVideoPaused(true)
              setIsModalOpen(true)
            }}
          >
            <FullscreenOutlined />
          </button>
        </div>
      </div>
      <Modal
        centered
        className={styles.graphCameraModal}
        footer={null}
        open={isModalOpen}
        title={selectedRecord ? formatSmartDateTime(selectedRecord.record_date) : 'Запись камеры'}
        width={960}
        onCancel={() => {
          setIsModalVideoPaused(true)
          setIsModalOpen(false)
        }}
      >
        <div className={styles.graphCameraModalContent}>
          <div
            className={classNames(styles.graphCameraModalVideo, styles.videoRecordModalVideo, {
              [styles.videoRecordModalVideoPaused]: isModalVideoPaused,
              [styles.videoRecordModalVideoSelectOpen]: isModalSelectOpen
            })}
          >
            <div className={styles.videoRecordModalVideoFrame}>
              {isModalOpen ? renderModalContent() : null}
            </div>
            <div
              className={styles.videoRecordModalControls}
              onClick={(event) => event.stopPropagation()}
            >
              {recordSelect}
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
