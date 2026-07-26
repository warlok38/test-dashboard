'use client'

import { useEffect, useRef } from 'react'

import Hls from 'hls.js'

import { DEFAULT_CAMERA_STREAM } from './settings'
import styles from './VideoStream.module.css'

type VideoStreamProps = {
  controls?: boolean
  isPlaying?: boolean
  src?: string
}

export function VideoStream({
  controls = true,
  isPlaying = true,
  src = DEFAULT_CAMERA_STREAM.previewSrc
}: VideoStreamProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)

  useEffect(() => {
    const video = videoRef.current

    if (!video) {
      return
    }

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true
      })

      hlsRef.current = hls
      hls.loadSource(src)
      hls.attachMedia(video)

      hls.on(Hls.Events.MANIFEST_PARSED, () => {
        void video.play().catch(() => {
          // Autoplay blocked - user interaction required.
        })
      })

      hls.on(Hls.Events.ERROR, (_event, data) => {
        if (!data.fatal) {
          return
        }

        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            hls.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            hls.recoverMediaError()
            break
          default:
            hls.destroy()
            break
        }
      })
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = src
      void video.play().catch(() => {
        // Autoplay blocked.
      })
    }

    return () => {
      hlsRef.current?.destroy()
      hlsRef.current = null
    }
  }, [src])

  useEffect(() => {
    const video = videoRef.current

    if (!video) {
      return
    }

    if (isPlaying) {
      void video.play().catch(() => {
        // Autoplay blocked - user interaction required.
      })

      return
    }

    video.pause()
  }, [isPlaying])

  return (
    <div className={styles.streamContainer}>
      <video ref={videoRef} className={styles.streamVideo} controls={controls} muted playsInline />
    </div>
  )
}
