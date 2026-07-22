'use client'

import { useEffect, useRef } from 'react'

import Hls from 'hls.js'

import styles from './VideoStream.module.css'

const STREAM_URL = 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8'

type VideoStreamProps = {
  src?: string
}

export function VideoStream({ src = STREAM_URL }: VideoStreamProps) {
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

  return (
    <div className={styles.streamContainer}>
      <video ref={videoRef} className={styles.streamVideo} controls muted playsInline />
    </div>
  )
}
